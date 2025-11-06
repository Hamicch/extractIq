import { NextResponse } from 'next/server';

/**
 * Standard API response formats for Next.js API routes
 */

export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Create success response
 */
export function successResponse<T>(data: T, status: number = 200): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  );
}

/**
 * Create error response
 */
export function errorResponse(
  code: string,
  message: string,
  status: number = 500,
  details?: any
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        details,
      },
    },
    { status }
  );
}

/**
 * Create validation error response
 */
export function validationErrorResponse(details: any): NextResponse<ApiErrorResponse> {
  return errorResponse('VALIDATION_ERROR', 'Invalid request data', 400, details);
}

/**
 * Create unauthorized error response
 */
export function unauthorizedResponse(message: string = 'Unauthorized'): NextResponse<ApiErrorResponse> {
  return errorResponse('UNAUTHORIZED', message, 401);
}

/**
 * Create forbidden error response
 */
export function forbiddenResponse(message: string = 'Forbidden'): NextResponse<ApiErrorResponse> {
  return errorResponse('FORBIDDEN', message, 403);
}

/**
 * Create not found error response
 */
export function notFoundResponse(message: string = 'Resource not found'): NextResponse<ApiErrorResponse> {
  return errorResponse('NOT_FOUND', message, 404);
}

/**
 * Create conflict error response
 */
export function conflictResponse(message: string): NextResponse<ApiErrorResponse> {
  return errorResponse('CONFLICT', message, 409);
}

/**
 * Create internal server error response
 */
export function internalErrorResponse(message: string = 'Internal server error'): NextResponse<ApiErrorResponse> {
  return errorResponse('INTERNAL_ERROR', message, 500);
}
