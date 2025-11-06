import { NextRequest } from 'next/server';
import {
  successResponse,
  unauthorizedResponse,
  internalErrorResponse,
} from '@/lib/api/response';
import { getUserRepository } from '@/lib/di/container';
import jwt from 'jsonwebtoken';
import { authConfig } from '@extractiq/infrastructure';

/**
 * GET /api/auth/verify
 * Verify JWT token and return user data
 */
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return unauthorizedResponse('Missing or invalid authorization header');
    }

      const token = authHeader.substring(7);

      const jwtSecret = authConfig.jwt.secret;
    let decoded: any;

    try {
        decoded = jwt.verify(token, jwtSecret as string);
    } catch (error) {
      return unauthorizedResponse('Invalid or expired token');
    }

    const userRepository = getUserRepository();
    const user = await userRepository.findById(decoded.userId);

    if (!user) {
      return unauthorizedResponse('User not found');
    }

    return successResponse({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
            fullName: user.getFullName(),
      },
    });
  } catch (error) {
    console.error('Auth verification error:', error);
    return internalErrorResponse('An error occurred during authentication');
  }
}
