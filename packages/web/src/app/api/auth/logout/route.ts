import { NextRequest } from 'next/server';
import { successResponse } from '@/lib/api/response';
import { getUserRepository } from '@/lib/di/container';
import jwt from 'jsonwebtoken';
import { authConfig } from '@extractiq/infrastructure';

/**
 * POST /api/auth/logout
 * Logout a user
 *
 * Current implementation: Only logs logout event. Tokens remain valid until expiration.
 * TODO: Implement refresh token revocation (Milestone 2) to enable true server-side invalidation.
 */
export async function POST(req: NextRequest) {
    try {
    const authHeader = req.headers.get('authorization');

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
        const jwtSecret = authConfig.jwt.secret;

      try {
          const decoded = jwt.verify(token, jwtSecret) as any;
        const userRepository = getUserRepository();
        const user = await userRepository.findById(decoded.userId);

          if (user) {
          console.log(`User ${user.email} logged out`);
        }
      } catch (error) {
        console.warn('Invalid token on logout:', error);
      }
    }

    return successResponse({
      message: 'Logged out successfully',
    });
  } catch (error) {
        console.error('Logout error:', error);
    return successResponse({
      message: 'Logged out successfully',
    });
  }
}
