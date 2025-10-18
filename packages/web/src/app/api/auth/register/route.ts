import { NextRequest } from 'next/server';
import { getRegisterUseCase } from '@/lib/di/container';
import {
  successResponse,
  validationErrorResponse,
  conflictResponse,
  internalErrorResponse,
} from '@/lib/api/response';
import { ConflictError, ValidationError } from '@extractiq/core';

/**
 * POST /api/auth/register
 * Register a new user
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, firstName, lastName, tenantId } = body;

    // Basic validation
    if (!email || !password) {
      return validationErrorResponse({
        email: !email ? ['Email is required'] : [],
        password: !password ? ['Password is required'] : [],
      });
    }

    // Execute use case
    const registerUseCase = getRegisterUseCase();
    const result = await registerUseCase.execute({
      email,
      password,
      tenantId: tenantId || 'default', // TODO: Implement proper tenant creation
      firstName,
      lastName,
    });

    if (result.isFailure) {
      const error = result.getError();

      if (error instanceof ConflictError) {
        return conflictResponse(error.message);
      }

      if (error instanceof ValidationError) {
        return validationErrorResponse({ [error.field || 'unknown']: [error.message] });
      }

      return internalErrorResponse(error.message);
    }

    const data = result.getValue();

    return successResponse(
      {
        user: {
          id: data.userId,
          email: data.email,
        },
      },
      201
    );
  } catch (error) {
    console.error('Registration error:', error);
    return internalErrorResponse('An error occurred during registration');
  }
}
