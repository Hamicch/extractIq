import { NextRequest } from 'next/server';
import { successResponse } from '@/lib/api/response';
import { getUserRepository } from '@/lib/di/container';
import jwt from 'jsonwebtoken';

/**
 * POST /api/auth/logout
 * Logout a user
 * Note: With JWT tokens, we can't truly invalidate them server-side without a blacklist.
 * This endpoint is mainly for analytics/logging purposes.
 */
export async function POST(req: NextRequest) {
  try {
    // Extract token from header (optional - logout works client-side regardless)
    const authHeader = req.headers.get('authorization');

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

      try {
        const decoded = jwt.verify(token, jwtSecret) as any;

        // Optional: Update user's last logout time or session info
        const userRepository = getUserRepository();
        const user = await userRepository.findById(decoded.userId);

        if (user) {
          // You could add a lastLogoutAt field to track this
          console.log(`User ${user.email} logged out`);
        }
      } catch (error) {
        // Invalid token - that's okay, still return success
        console.warn('Invalid token on logout:', error);
      }
    }

    return successResponse({
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    // Even on error, return success since logout is client-side
    return successResponse({
      message: 'Logged out successfully',
    });
  }
}
