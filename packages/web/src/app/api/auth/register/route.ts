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
import {
    createRateLimitMiddleware,
    AUTH_RATE_LIMITS,
    addRateLimitHeaders,
} from '@/lib/middleware/rate-limit';

const rateLimitMiddleware = createRateLimitMiddleware(AUTH_RATE_LIMITS.register, 'register');

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
    const rateLimitCheck = await rateLimitMiddleware(req);
    if (!rateLimitCheck.success) {
        return rateLimitCheck.response;
    }

  try {
      const body = await req.json();

      // Validate request body with Zod
      const validation = validateWithZod(RegisterRequestSchema, body);
      if (!validation.success) {
          return validationErrorResponse(validation.errors);
    }

      const { email, password, firstName, lastName } = validation.data;

      // Always use default tenant for new registrations (hardcoded for now)
      // tenantId field is accepted but ignored - always use default
      // This is the ID of the 'acme-legal' tenant from our default tenant data
      const defaultTenantId = process.env.DEFAULT_TENANT_ID || '61079324-b102-42e8-aec3-3aad2f2233e4';

    const registerUseCase = getRegisterUseCase();
    const useCaseResult = await registerUseCase.execute({
      email,
      password,
        tenantId: defaultTenantId,
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

      const response = successResponse(
      {
        user: data.user,
        token: data.accessToken,
        refreshToken: data.refreshToken,
      },
      201
    );

      return addRateLimitHeaders(response, AUTH_RATE_LIMITS.register, rateLimitCheck.result);
  } catch (error) {
    console.error('Registration error:', error);
    return internalErrorResponse('An error occurred during registration');
  }
}
