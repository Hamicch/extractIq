import { Job } from 'bullmq';
import { getProcessDocumentUseCase } from '../di/container';

/**
 * Background processor for document processing jobs
 * Integrates BullMQ with ProcessDocumentUseCase
 */

export interface DocumentProcessorJob {
  documentId: string;
  tenantId: string;
  userId: string;
}

export class DocumentProcessor {
  /**
   * Process a document job
   * Called by BullMQ worker for each job in the queue
   */
  async processJob(job: Job<DocumentProcessorJob>): Promise<void> {
    const { documentId, tenantId } = job.data;

    console.log(`📄 Processing document ${documentId} for tenant ${tenantId}`);

    // Update job progress
    await job.updateProgress(0);

    try {
      // Execute the use case
      const processUseCase = getProcessDocumentUseCase();
      const result = await processUseCase.execute({
        documentId,
      });

      if (result.isFailure) {
        const error = result.getError();
        console.error(`❌ Processing failed for document ${documentId}:`, error.message);
        throw error;
      }

      await job.updateProgress(100);
      console.log(`✅ Document ${documentId} processed successfully`);
    } catch (error) {
      console.error(`❌ Job failed for document ${documentId}:`, error);
      throw error;
    }
  }

  /**
   * Handle job completion
   */
  async onCompleted(job: Job<DocumentProcessorJob>): Promise<void> {
    const { documentId } = job.data;
    console.log(`✅ Job completed for document ${documentId}`);
  }

  /**
   * Handle job failure
   */
  async onFailed(job: Job<DocumentProcessorJob> | undefined, error: Error): Promise<void> {
    if (!job) {
      console.error('❌ Job failed with no job data:', error);
      return;
    }

    const { documentId } = job.data;
    console.error(`❌ Job failed for document ${documentId}:`, error.message);
  }
}
