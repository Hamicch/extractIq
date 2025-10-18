import { Worker, Queue, Job } from 'bullmq';
import { QueueNames, JobNames } from '@extractiq/shared';
import { queueConfig, workerConfig } from './queue/config';
import { wsClient } from './websocket/client';
import { processDocumentUpload } from './jobs/document-upload';
import { processDocumentOcr } from './jobs/document-ocr';
import { processDocumentExtract } from './jobs/document-extract';
import { processDocumentValidate } from './jobs/document-validate';
import { setupOpenTelemetry } from './telemetry';

// Setup OpenTelemetry
setupOpenTelemetry();

// Initialize WebSocket connection
wsClient.connect();

// Create queue for adding jobs programmatically
export const documentQueue = new Queue(
  QueueNames.DOCUMENT_PROCESSING,
  queueConfig
);

// Create worker to process jobs
const worker = new Worker(
  QueueNames.DOCUMENT_PROCESSING,
  async (job: Job) => {
    console.log(`\n📋 Processing job: ${job.name} (ID: ${job.id})`);
    console.log(`   Data:`, job.data);

    try {
      let result;

      switch (job.name) {
        case JobNames.DOCUMENT_UPLOAD:
          result = await processDocumentUpload(job);

          // Chain to OCR job
          await documentQueue.add(
            JobNames.DOCUMENT_OCR,
            {
              documentId: job.data.documentId,
              tenantId: job.data.tenantId,
              fileUrl: job.data.fileUrl,
              fileName: job.data.fileName,
              mimeType: job.data.mimeType,
            },
            {
              delay: 1000, // 1 second delay
            }
          );
          break;

        case JobNames.DOCUMENT_OCR:
          result = await processDocumentOcr(job);

          // Chain to extraction job
          await documentQueue.add(
            JobNames.DOCUMENT_EXTRACT,
            {
              documentId: job.data.documentId,
              tenantId: job.data.tenantId,
              extractedText: result.extractedText,
              extractionType: 'invoice', // TODO: Auto-detect document type
              modelVersion: 'gpt-4-turbo',
            },
            {
              attempts: 3,
              backoff: {
                type: 'exponential',
                delay: 1000,
              },
            }
          );
          break;

        case JobNames.DOCUMENT_EXTRACT:
          result = await processDocumentExtract(job);

          // Chain to validation job
          await documentQueue.add(
            JobNames.DOCUMENT_VALIDATE,
            {
              documentId: job.data.documentId,
              tenantId: job.data.tenantId,
              extractionId: result.extractionId,
            },
            {
              delay: 500,
            }
          );
          break;

        case JobNames.DOCUMENT_VALIDATE:
          result = await processDocumentValidate(job);
          break;

        default:
          throw new Error(`Unknown job type: ${job.name}`);
      }

      console.log(`✅ Job ${job.name} completed successfully`);
      console.log(`   Result:`, result);

      return result;
    } catch (error) {
      console.error(`❌ Job ${job.name} failed:`, error);
      throw error;
    }
  },
  workerConfig
);

// Worker event handlers
worker.on('completed', (job: Job) => {
  console.log(`\n✅ Job ${job.id} (${job.name}) completed`);
});

worker.on('failed', (job: Job | undefined, error: Error) => {
  if (job) {
    console.error(
      `\n❌ Job ${job.id} (${job.name}) failed after ${job.attemptsMade} attempts`
    );
    console.error(`   Error:`, error.message);
  } else {
    console.error(`\n❌ Job failed:`, error.message);
  }
});

worker.on('active', (job: Job) => {
  console.log(`\n⚡ Job ${job.id} (${job.name}) is now active`);
});

worker.on('stalled', (jobId: string) => {
  console.warn(`\n⚠️  Job ${jobId} has stalled`);
});

worker.on('progress', (job: Job, progress: any) => {
  console.log(`📊 Job ${job.id} progress: ${JSON.stringify(progress)}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('\n🛑 SIGTERM received, shutting down gracefully...');
  await worker.close();
  wsClient.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\n🛑 SIGINT received, shutting down gracefully...');
  await worker.close();
  wsClient.disconnect();
  process.exit(0);
});

console.log('🔧 Docuflow Worker started');
console.log(`📡 WebSocket connected: ${wsClient ? 'Yes' : 'No'}`);
console.log(`⚙️  Concurrency: ${workerConfig.concurrency}`);
console.log(
  `🔄 Listening for jobs on queue: ${QueueNames.DOCUMENT_PROCESSING}`
);
console.log(`\n📋 Supported jobs:`);
console.log(`   - ${JobNames.DOCUMENT_UPLOAD}`);
console.log(`   - ${JobNames.DOCUMENT_OCR}`);
console.log(`   - ${JobNames.DOCUMENT_EXTRACT}`);
console.log(`   - ${JobNames.DOCUMENT_VALIDATE}`);
console.log(`\n✨ Ready to process documents!\n`);

// Export for testing
export { worker };
