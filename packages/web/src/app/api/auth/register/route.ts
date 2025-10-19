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

    // Get or create tenant for user
    let userTenantId = tenantId;
    if (!userTenantId) {
      // Use default tenant for new registrations (in production, create a new tenant per organization)
      // This is the ID of the 'acme-legal' tenant from the seed data
      userTenantId = process.env.DEFAULT_TENANT_ID || '61079324-b102-42e8-aec3-3aad2f2233e4';
    }

    // Execute use case
    const registerUseCase = getRegisterUseCase();
    const useCaseResult = await registerUseCase.execute({
      email,
      password,
      tenantId: userTenantId,
      firstName,
      lastName,
    });

    if (useCaseResult.isFailure) {
      const error = useCaseResult.getError();

      if (error instanceof ConflictError) {
        return conflictResponse(error.message);
      }

      if (error instanceof ValidationError) {
        return validationErrorResponse({ [error.field || 'unknown']: [error.message] });
      }

      return internalErrorResponse(error.message);
    }

    const data = useCaseResult.getValue();

    return successResponse(
      {
        user: data.user,
        token: data.accessToken,
        refreshToken: data.refreshToken,
      },
      201
    );
  } catch (error) {
    console.error('Registration error:', error);
    return internalErrorResponse('An error occurred during registration');
  }
}
