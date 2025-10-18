import { Router, Request, Response } from 'express';
import { db, eq } from '@extractiq/db';
import { users } from '@extractiq/db/schema';
import {
  RegisterRequestSchema,
  LoginRequestSchema,
  type RegisterRequest,
  type LoginRequest,
  type AuthResponse,
  type VerifyTokenResponse,
  type LogoutResponse,
} from '@extractiq/shared/api-schemas';
import {
  signToken,
  hashPassword,
  comparePassword,
  extractTokenFromHeader,
  verifyToken,
} from '../utils/auth';

export const authRouter = Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
authRouter.post('/register', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validation = RegisterRequestSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: validation.error.flatten(),
        },
      });
    }

    const { email, password, name, tenantId } =
      validation.data as RegisterRequest;

    // Check if user already exists
    const existingUsers = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'USER_EXISTS',
          message: 'A user with this email already exists',
        },
      });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const [user] = await db
      .insert(users)
      .values({
        email,
        passwordHash,
        name,
        tenantId: tenantId || null,
        role: 'user',
      })
      .returning();

    // Generate JWT
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const response: AuthResponse = {
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as 'user' | 'admin',
          tenantId: user.tenantId,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        },
        token,
      },
    };

    return res.status(201).json(response);
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred during registration',
      },
    });
  }
});

/**
 * POST /api/auth/login
 * Authenticate a user
 */
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validation = LoginRequestSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: validation.error.flatten(),
        },
      });
    }

    const { email, password } = validation.data as LoginRequest;

    // Find user by email
    const foundUsers = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (foundUsers.length === 0) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
      });
    }

    const user = foundUsers[0];

    // Verify password
    const isValidPassword = await comparePassword(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
      });
    }

    // Generate JWT
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const response: AuthResponse = {
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as 'user' | 'admin',
          tenantId: user.tenantId,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        },
        token,
      },
    };

    return res.json(response);
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred during login',
      },
    });
  }
});

/**
 * POST /api/auth/verify
 * Verify a JWT token and return user data
 */
authRouter.post('/verify', async (req: Request, res: Response) => {
  try {
    // Extract token from Authorization header
    const token = extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'NO_TOKEN',
          message: 'No authentication token provided',
        },
      });
    }

    // Verify token
    let payload;
    try {
      payload = verifyToken(token);
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: error instanceof Error ? error.message : 'Invalid token',
        },
      });
    }

    // Fetch user from database
    const foundUsers = await db
      .select()
      .from(users)
      .where(eq(users.id, payload.userId))
      .limit(1);

    if (foundUsers.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
        },
      });
    }

    const user = foundUsers[0];

    const response: VerifyTokenResponse = {
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as 'user' | 'admin',
          tenantId: user.tenantId,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        },
      },
    };

    return res.json(response);
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred during token verification',
      },
    });
  }
});

/**
 * POST /api/auth/logout
 * Logout a user (client-side token removal)
 */
authRouter.post('/logout', async (_req: Request, res: Response) => {
  const response: LogoutResponse = {
    success: true,
    message: 'Logged out successfully',
  };
  return res.json(response);
});
