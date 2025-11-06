import { NextRequest } from 'next/server';
import {
  getGetDocumentUseCase,
  getDeleteDocumentUseCase,
} from '@/lib/di/container';
import {
  successResponse,
  notFoundResponse,
  forbiddenResponse,
    validationErrorResponse,
  internalErrorResponse,
    validateWithZod,
} from '@/lib/api/response';
import { NotFoundError, ForbiddenError } from '@extractiq/core';
import { z } from 'zod';
import { authenticateRequest } from '@/lib/middleware/auth';

interface RouteParams {
  params: {
    id: string;
  };
}

const DocumentIdSchema = z.string().uuid('Invalid document ID format');

/**
 * GET /api/documents/[id]
 * Get a single document by ID
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
    const authResult = await authenticateRequest(req);
    if (!authResult.success) {
        return authResult.response;
    }

    const { tenantId } = authResult.user;

  try {
    const { id } = params;

      const validation = validateWithZod(DocumentIdSchema, id);
      if (!validation.success) {
          return validationErrorResponse(validation.errors);
      }

      const documentId = validation.data;

    const getUseCase = getGetDocumentUseCase();
    const result = await getUseCase.execute({
        documentId,
      tenantId,
    });

    if (result.isFailure) {
      const error = result.getError();

      if (error instanceof NotFoundError) {
        return notFoundResponse(error.message);
      }

      if (error instanceof ForbiddenError) {
        return forbiddenResponse(error.message);
      }

      return internalErrorResponse(error.message);
    }

    const document = result.getValue();

    return successResponse({
      id: document.id,
      filePath: document.filePath,
      metadata: document.metadata,
      status: document.status,
      type: document.type,
      extractedData: document.extractedData,
      errorMessage: document.errorMessage,
      createdAt: document.createdAt.toISOString(),
      updatedAt: document.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('Get document error:', error);
    return internalErrorResponse('An error occurred while retrieving document');
  }
}

/**
 * DELETE /api/documents/[id]
 * Delete a document by ID
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
    const authResult = await authenticateRequest(req);
    if (!authResult.success) {
        return authResult.response;
    }

    const { tenantId } = authResult.user;

  try {
    const { id } = params;

      const validation = validateWithZod(DocumentIdSchema, id);
      if (!validation.success) {
          return validationErrorResponse(validation.errors);
      }

      const documentId = validation.data;

    const deleteUseCase = getDeleteDocumentUseCase();
    const result = await deleteUseCase.execute({
        documentId,
      tenantId,
    });

    if (result.isFailure) {
      const error = result.getError();

      if (error instanceof NotFoundError) {
        return notFoundResponse(error.message);
      }

      if (error instanceof ForbiddenError) {
        return forbiddenResponse(error.message);
      }

      return internalErrorResponse(error.message);
    }

    return successResponse({
      message: 'Document deleted successfully',
    });
  } catch (error) {
    console.error('Delete document error:', error);
    return internalErrorResponse('An error occurred while deleting document');
  }
}
