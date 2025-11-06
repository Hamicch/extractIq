import { NextRequest, NextResponse } from 'next/server';
import Redis from 'ioredis';

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  failOpen?: boolean;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number;
  retryAfter?: number;
  redisError?: boolean; // Flag to distinguish Redis errors from rate limit exceeded
}

let redisClient: Redis | null = null;

function getRedisClient(): Redis {
  if (!redisClient) {
    const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
    const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);
    const REDIS_PASSWORD = process.env.REDIS_PASSWORD;

    redisClient = new Redis({
      host: REDIS_HOST,
      port: REDIS_PORT,
      password: REDIS_PASSWORD,
      maxRetriesPerRequest: null,
      lazyConnect: true,
    });
  }

  return redisClient;
}

/**
 * Extract client IP from request headers
 * Handles proxy headers (x-forwarded-for, x-real-ip) for production
 */
function extractClientIP(req: NextRequest): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
      const ip = forwardedFor.split(',')[0].trim();
      console.log('extracted ip from forwarded for header:', ip);
    if (ip) return ip;
  }

  const realIP = req.headers.get('x-real-ip');
  if (realIP) {
    console.log('extracted ip from real ip header:', realIP);
    return realIP;
  }

  // Fallback to connection IP
  const ip = req.headers.get('x-client-ip') || 'unknown';
  console.log('extracted ip from client ip header:', ip);
  return ip;
}

/**
 * Rate limit check using Redis
 * Returns rate limit status and remaining requests
 */
async function checkRateLimit(
  key: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  try {
    const redis = getRedisClient();

    if (redis.status === 'wait' || redis.status === 'end') {
      await redis.connect();
    }

    const now = Date.now();
    const windowStart = now - config.windowMs;
    const windowKey = `${key}:${Math.floor(now / config.windowMs)}`;

    const count = await redis.incr(windowKey);

    if (count === 1) {
      await redis.pexpire(windowKey, config.windowMs);
    }

    const remaining = Math.max(0, config.maxRequests - count);
    const reset = Math.ceil((now + config.windowMs) / 1000);

    if (count > config.maxRequests) {
      const retryAfter = Math.ceil((config.windowMs - (now % config.windowMs)) / 1000);
      return {
        success: false,
        remaining: 0,
        reset,
        retryAfter,
      };
    }

    return {
      success: true,
      remaining,
      reset,
    };
  } catch (error) {
    console.error('Rate limit check error:', error);

    const failOpen = config.failOpen !== false; // Default to true

    if (!failOpen) {
      return {
        success: false,
        remaining: 0,
        reset: Math.ceil((Date.now() + config.windowMs) / 1000),
        retryAfter: 60, // Suggest retry after 60 seconds
        redisError: true, // Flag to indicate this is a Redis error, not rate limit exceeded
      };
    }

    // Fail-open: Allow request when Redis is unavailable
    return {
      success: true,
      remaining: config.maxRequests,
      reset: Math.ceil((Date.now() + config.windowMs) / 1000),
    };
  }
}

/**
 * Create rate limit middleware for Next.js API routes
 * Returns rate limit result or error response if limit exceeded
 */
export function createRateLimitMiddleware(
  config: RateLimitConfig,
  endpointName?: string
) {
  return async (
    req: NextRequest
  ): Promise<{ success: true; result: RateLimitResult; ip: string } | { success: false; response: NextResponse }> => {
    const ip = extractClientIP(req);
    const key = endpointName ? `ratelimit:${endpointName}:${ip}` : `ratelimit:${ip}`;

    const result = await checkRateLimit(key, config);

    if (!result.success) {
      // Distinguish between rate limit exceeded and Redis unavailable
      const isRedisError = result.redisError === true;

      const response = NextResponse.json(
        {
          success: false,
          error: {
            code: isRedisError ? 'RATE_LIMIT_SERVICE_UNAVAILABLE' : 'RATE_LIMIT_EXCEEDED',
            message: isRedisError
              ? 'Rate limiting service is temporarily unavailable. Please try again later.'
              : `Too many requests. Please try again after ${result.retryAfter} seconds.`,
          },
        },
        { status: isRedisError ? 503 : 429 }
      );

      // Set rate limit headers
      response.headers.set('X-RateLimit-Limit', String(config.maxRequests));
      response.headers.set('X-RateLimit-Remaining', String(result.remaining));
      response.headers.set('X-RateLimit-Reset', String(result.reset));
      if (result.retryAfter) {
        response.headers.set('Retry-After', String(result.retryAfter));
      }

      return { success: false, response };
    }

    return { success: true, result, ip };
  };
}

/**
 * Add rate limit headers to response
 */
export function addRateLimitHeaders(
  response: NextResponse,
  config: RateLimitConfig,
  result: RateLimitResult
): NextResponse {
  response.headers.set('X-RateLimit-Limit', String(config.maxRequests));
  response.headers.set('X-RateLimit-Remaining', String(result.remaining));
  response.headers.set('X-RateLimit-Reset', String(result.reset));
  return response;
}

/**
 * Rate limit configuration for auth endpoints
 *
 * These endpoints use fail-open strategy: if Redis is unavailable,
 * requests are allowed through to maintain service availability.
 * This prioritizes user access over rate limiting security.
 */
export const AUTH_RATE_LIMITS = {
  login: {
    maxRequests: parseInt(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS || '5', 10),
    windowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
        failOpen: true,
  },
  register: {
    maxRequests: parseInt(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS || '3', 10),
    windowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS || '3600000', 10), // 1 hour
      failOpen: true,
  },
};

