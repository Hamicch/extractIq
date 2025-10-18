import { successResponse } from '@/lib/api/response';

/**
 * POST /api/auth/logout
 * Logout a user (client-side token removal)
 */
export async function POST() {
  return successResponse({
    message: 'Logged out successfully',
  });
}
