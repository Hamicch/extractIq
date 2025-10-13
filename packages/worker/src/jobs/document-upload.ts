import { Job } from 'bullmq';
import { db, eq } from '@docuflow/db';
import { documents } from '@docuflow/db/schema';
import type {
  DocumentUploadJobData,
  DocumentUploadResult,
} from '@docuflow/shared';
import { wsClient } from '../websocket/client';

export async function processDocumentUpload(
  job: Job<DocumentUploadJobData>
): Promise<DocumentUploadResult> {
  const { documentId, tenantId, fileUrl, fileName, mimeType, fileSizeBytes } =
    job.data;

  try {
    // Emit progress: 0%
    wsClient.emitProgress({
      documentId,
      tenantId,
      stage: 'upload',
      progress: 0,
      message: 'Starting file validation',
      timestamp: new Date().toISOString(),
    });

    // Update job progress
    await job.updateProgress(0);

    // Validate file exists (in real scenario, check S3/storage)
    if (!fileUrl) {
      throw new Error('File URL is required');
    }

    // Emit progress: 25%
    wsClient.emitProgress({
      documentId,
      tenantId,
      stage: 'upload',
      progress: 25,
      message: 'Validating file format',
      timestamp: new Date().toISOString(),
    });

    await job.updateProgress(25);

    // Validate mime type
    const allowedTypes = [
      'application/pdf',
      'image/png',
      'image/jpeg',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowedTypes.includes(mimeType)) {
      throw new Error(`Unsupported file type: ${mimeType}`);
    }

    // Emit progress: 50%
    wsClient.emitProgress({
      documentId,
      tenantId,
      stage: 'upload',
      progress: 50,
      message: 'Creating database record',
      timestamp: new Date().toISOString(),
    });

    await job.updateProgress(50);

    // Update document record
    const [document] = await db
      .update(documents)
      .set({
        status: 'queued',
        fileUrl,
        fileName,
        mimeType,
        fileSizeBytes,
        updatedAt: new Date(),
      })
      .where(eq(documents.id, documentId))
      .returning();

    if (!document) {
      throw new Error('Document not found');
    }

    // Emit progress: 75%
    wsClient.emitProgress({
      documentId,
      tenantId,
      stage: 'upload',
      progress: 75,
      message: 'Finalizing upload',
      timestamp: new Date().toISOString(),
    });

    await job.updateProgress(75);

    // Simulate page count detection (in real scenario, analyze PDF)
    const pageCount =
      mimeType === 'application/pdf' ? Math.floor(Math.random() * 20) + 1 : 1;

    // Emit progress: 100%
    wsClient.emitProgress({
      documentId,
      tenantId,
      stage: 'upload',
      progress: 100,
      message: 'Upload completed',
      timestamp: new Date().toISOString(),
    });

    await job.updateProgress(100);

    // Emit status update
    wsClient.emitStatus({
      documentId,
      tenantId,
      status: 'queued',
      stage: 'upload',
      timestamp: new Date().toISOString(),
    });

    return {
      documentId,
      status: 'uploaded',
      pageCount,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    // Emit failed event
    wsClient.emitFailed({
      documentId,
      tenantId,
      stage: 'upload',
      error: {
        code: 'UPLOAD_FAILED',
        message: errorMessage,
      },
      timestamp: new Date().toISOString(),
    });

    // Update document status to failed
    await db
      .update(documents)
      .set({
        status: 'failed',
        updatedAt: new Date(),
      })
      .where(eq(documents.id, documentId));

    throw error;
  }
}
