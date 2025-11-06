import { NextRequest, NextResponse } from 'next/server';
import { getTokenService } from '@/lib/di/container';
import { unauthorizedResponse } from '@/lib/api/response';
import { TokenPayload } from '@extractiq/core';

export interface AuthContext {
  userId: string;
  email: string;
  tenantId: string;
  role: string;
}

export interface AuthenticatedRequest extends NextRequest {
  user: AuthContext;
}

export type AuthMiddlewareResult =
  | { success: true; user: AuthContext }
  | { success: false; response: NextResponse };

/**
 * Extract and verify JWT token from request
 * Returns user context or error response
 */
export async function authenticateRequest(
  req: NextRequest
): Promise<AuthMiddlewareResult> {
  try {
    // Extract Bearer token from Authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        success: false,
        response: unauthorizedResponse('Missing or invalid authorization header'),
      };
    }

    const token = authHeader.substring(7);

    // Verify token using TokenService
    const tokenService = getTokenService();
    const verifyResult = tokenService.verifyToken(token);

    if (verifyResult.isFailure) {
      return {
        success: false,
        response: unauthorizedResponse('Invalid or expired token'),
      };
    }

    const payload: TokenPayload = verifyResult.getValue();

    const user: AuthContext = {
      userId: payload.userId,
      email: payload.email,
      tenantId: payload.tenantId,
      role: payload.role,
    };

    return {
      success: true,
      user,
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return {
      success: false,
      response: unauthorizedResponse('Authentication failed'),
    };
  }
}

/**
 * Create auth middleware for Next.js API routes
 * Returns a function that authenticates the request and provides user context
 */
export function createAuthMiddleware() {
  return async (req: NextRequest): Promise<AuthMiddlewareResult> => {
    return authenticateRequest(req);
  };
}

