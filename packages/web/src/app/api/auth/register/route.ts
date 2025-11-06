import { NextRequest } from 'next/server';
import { getRegisterUseCase } from '@/lib/di/container';
import {
  successResponse,
  validationErrorResponse,
  conflictResponse,
  internalErrorResponse,
    validateWithZod,
} from '@/lib/api/response';
import { ConflictError, ValidationError } from '@extractiq/core';
import { z } from 'zod';

const RegisterRequestSchema = z.object({
    email: z.string().email('Invalid email format').min(1, 'Email is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    tenantId: z.string().uuid('Invalid tenant ID format').optional(),
});

/**
 * POST /api/auth/register
 * Register a new user
 */
export async function POST(req: NextRequest) {
  try {
      const body = await req.json();

      // Validate request body with Zod
      const validation = validateWithZod(RegisterRequestSchema, body);
      if (!validation.success) {
          return validationErrorResponse(validation.errors);
    }

      const { email, password, firstName, lastName, tenantId } = validation.data;

    // Get or create tenant for user
    let userTenantId = tenantId;
    if (!userTenantId) {
      // Use default tenant for new registrations (in production, create a new tenant per organization)
        // This is the ID of the 'acme-legal' tenant from our default tenant data
      userTenantId = process.env.DEFAULT_TENANT_ID || '61079324-b102-42e8-aec3-3aad2f2233e4';
    }

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
