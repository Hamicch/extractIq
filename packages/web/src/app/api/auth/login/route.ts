import { NextRequest } from 'next/server';
import { getLoginUseCase } from '@/lib/di/container';
import {
  successResponse,
  validationErrorResponse,
  unauthorizedResponse,
  internalErrorResponse,
} from '@/lib/api/response';
import { UnauthorizedError } from '@extractiq/core';

/**
 * POST /api/auth/login
 * Authenticate a user
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // Basic validation
    if (!email || !password) {
      return validationErrorResponse({
        email: !email ? ['Email is required'] : [],
        password: !password ? ['Password is required'] : [],
      });
    }

    // Execute use case
    const loginUseCase = getLoginUseCase();
    const result = await loginUseCase.execute({
      email,
      password,
    });

    if (result.isFailure) {
      const error = result.getError();

      if (error instanceof UnauthorizedError) {
        return unauthorizedResponse(error.message);
      }

      return internalErrorResponse(error.message);
    }

    const data = result.getValue();

    return successResponse({
      user: data.user,
      token: data.accessToken,
      refreshToken: data.refreshToken,
    });
  } catch (error) {
    console.error('Login error:', error);
    return internalErrorResponse('An error occurred during login');
  }
}
