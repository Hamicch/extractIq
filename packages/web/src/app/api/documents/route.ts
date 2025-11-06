import { NextRequest } from 'next/server';
import {
  getUploadDocumentUseCase,
  getListDocumentsUseCase,
} from '@/lib/di/container';
import {
  successResponse,
  validationErrorResponse,
  internalErrorResponse,
    validateWithZod,
} from '@/lib/api/response';
import { z } from 'zod';
import { DocumentStatus } from '@extractiq/core';
import { authenticateRequest } from '@/lib/middleware/auth';

const statusMap: Record<string, DocumentStatus> = {
    pending: DocumentStatus.PENDING,
    processing: DocumentStatus.PROCESSING,
    completed: DocumentStatus.COMPLETED,
    failed: DocumentStatus.FAILED,
};

const ListDocumentsQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    status: z
        .enum(['pending', 'processing', 'completed', 'failed'])
        .optional()
        .transform((val): DocumentStatus | undefined => {
            if (!val) return undefined;
            return statusMap[val];
        }),
});

/**
 * GET /api/documents
 * List documents with pagination
 */
export async function GET(req: NextRequest) {
    const authResult = await authenticateRequest(req);
    if (!authResult.success) {
        return authResult.response;
    }

    const { tenantId } = authResult.user;

  try {
    const searchParams = req.nextUrl.searchParams;

      const queryParams = {
          page: searchParams.get('page'),
          limit: searchParams.get('limit'),
          status: searchParams.get('status'),
      };

      const validation = validateWithZod(ListDocumentsQuerySchema, queryParams);
      if (!validation.success) {
          return validationErrorResponse(validation.errors);
      }

      const { page, limit, status } = validation.data;

      const pageNum = page ?? 1;
      const limitNum = limit ?? 10;

    const listUseCase = getListDocumentsUseCase();
    const result = await listUseCase.execute({
      tenantId,
        pagination: { page: pageNum, limit: limitNum },
        status: status as DocumentStatus | undefined,
    });

    if (result.isFailure) {
      return internalErrorResponse(result.getError().message);
    }

    const data = result.getValue();

    return successResponse({
      items: data.data.map((doc) => ({
        id: doc.id,
        filePath: doc.filePath,
        metadata: doc.metadata,
        status: doc.status,
        type: doc.type,
        extractedData: doc.extractedData,
        errorMessage: doc.errorMessage,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
      })),
      pagination: data.pagination,
    });
  } catch (error) {
    console.error('List documents error:', error);
    return internalErrorResponse('An error occurred while listing documents');
  }
}

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const ALLOWED_MIME_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/jpg',
    'text/plain',
];

/**
 * POST /api/documents
 * Upload a new document
 */
export async function POST(req: NextRequest) {
    const authResult = await authenticateRequest(req);
    if (!authResult.success) {
        return authResult.response;
    }

    const { tenantId, userId } = authResult.user;

  try {
    const formData = await req.formData();
      const file = formData.get('file') as File | null;

    if (!file) {
      return validationErrorResponse({
        file: ['File is required'],
      });
    }

      if (file.size > MAX_FILE_SIZE) {
          return validationErrorResponse({
              file: [`File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`],
          });
      }

      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
          return validationErrorResponse({
              file: [`File type not allowed. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`],
          });
      }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

      const uploadedBy = userId;

    const uploadUseCase = getUploadDocumentUseCase();
    const result = await uploadUseCase.execute({
      file: {
        originalName: file.name,
        size: file.size,
        mimeType: file.type,
        buffer,
      },
      tenantId,
      uploadedBy,
    });

    if (result.isFailure) {
      return internalErrorResponse(result.getError().message);
    }

    const data = result.getValue();

    return successResponse(
      {
        documentId: data.documentId,
        status: data.status,
      },
      201
    );
  } catch (error) {
    console.error('Upload document error:', error);
    return internalErrorResponse('An error occurred while uploading document');
  }
}
