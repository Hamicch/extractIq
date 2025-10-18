import { Request, Response, NextFunction } from 'express';
import { db, eq } from '@extractiq/db';
import { users } from '@extractiq/db/schema';
import {
  extractTokenFromHeader,
  verifyToken,
  type JWTPayload,
} from '../utils/auth';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        role: string;
        tenantId: string | null;
      };
      auth?: JWTPayload;
    }
  }
}

/**
 * Middleware to require authentication
 * Verifies JWT token and attaches user to request
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Extract token from Authorization header
    const token = extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      res.status(401).json({
        success: false,
        error: {
          code: 'NO_TOKEN',
          message: 'Authentication required. No token provided.',
        },
      });
      return;
    }

    // Verify token
    let payload: JWTPayload;
    try {
      payload = verifyToken(token);
    } catch (error) {
      res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: error instanceof Error ? error.message : 'Invalid token',
        },
      });
      return;
    }

    // Fetch user from database
    const foundUsers = await db
      .select()
      .from(users)
      .where(eq(users.id, payload.userId))
      .limit(1);

    if (foundUsers.length === 0) {
      res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
        },
      });
      return;
    }

    const user = foundUsers[0];

    // Attach user and auth payload to request
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tenantId: user.tenantId,
    };
    req.auth = payload;

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred during authentication',
      },
    });
  }
}

/**
 * Middleware to require admin role
 * Must be used after requireAuth
 */
export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
      },
    });
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Admin access required',
      },
    });
    return;
  }

  next();
}

/**
 * Middleware to require specific tenant access
 * Must be used after requireAuth
 */
export function requireTenant(tenantId: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
      return;
    }

    if (req.user.tenantId !== tenantId && req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Access to this tenant is not allowed',
        },
      });
      return;
    }

    next();
  };
}

/**
 * Optional auth middleware
 * Attaches user to request if token is valid, but doesn't fail if no token
 */
export async function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      next();
      return;
    }

    try {
      const payload = verifyToken(token);
      const foundUsers = await db
        .select()
        .from(users)
        .where(eq(users.id, payload.userId))
        .limit(1);

      if (foundUsers.length > 0) {
        const user = foundUsers[0];
        req.user = {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          tenantId: user.tenantId,
        };
        req.auth = payload;
      }
    } catch {
      // Token invalid, but that's ok for optional auth
    }

    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    next();
  }
}
