import { NextRequest } from 'next/server';
import {
  successResponse,
  unauthorizedResponse,
  internalErrorResponse,
} from '@/lib/api/response';
import { getUserRepository } from '@/lib/di/container';
import jwt from 'jsonwebtoken';

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

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify JWT token
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    let decoded: any;

    try {
      decoded = jwt.verify(token, jwtSecret);
    } catch (error) {
      return unauthorizedResponse('Invalid or expired token');
    }

    // Fetch user from database using repository
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
        fullName: user.getFullName() || user.email,
      },
    });
  } catch (error) {
    console.error('Auth verification error:', error);
    return internalErrorResponse('An error occurred during authentication');
  }
}
