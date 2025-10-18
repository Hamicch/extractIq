import { NextRequest } from 'next/server';
import {
  getUploadDocumentUseCase,
  getListDocumentsUseCase,
} from '@/lib/di/container';
import {
  successResponse,
  validationErrorResponse,
  internalErrorResponse,
} from '@/lib/api/response';

/**
 * GET /api/documents
 * List documents with pagination
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') as any;

    // TODO: Get tenantId from authenticated user
    const tenantId = 'default';

    // Execute use case
    const listUseCase = getListDocumentsUseCase();
    const result = await listUseCase.execute({
      tenantId,
      pagination: { page, limit },
      status,
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

/**
 * POST /api/documents
 * Upload a new document
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return validationErrorResponse({
        file: ['File is required'],
      });
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // TODO: Get tenantId and userId from authenticated user
    const tenantId = 'default';
    const uploadedBy = 'user';

    // Execute use case
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
