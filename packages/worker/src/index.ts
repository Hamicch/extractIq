import 'dotenv/config';
import { Worker } from 'bullmq';
import { connection } from './redis';
import { processDocumentJob } from './jobs/process-document';
import { setupOpenTelemetry } from './telemetry';

// Setup OpenTelemetry
setupOpenTelemetry();

const worker = new Worker(
  'document-processing',
  async (job) => {
    console.log(`Processing job ${job.id} of type ${job.data.action}`);

    switch (job.data.action) {
      case 'process':
        return await processDocumentJob(job.data);
      case 'extract':
        console.log('Extract job - not implemented yet');
        return { status: 'not_implemented' };
      case 'analyze':
        console.log('Analyze job - not implemented yet');
        return { status: 'not_implemented' };
      default:
        throw new Error(`Unknown job action: ${job.data.action}`);
    }
  },
  {
    connection,
    concurrency: Number(process.env.WORKER_CONCURRENCY) || 5,
  }
);

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err);
});

console.log('🔧 Docuflow Worker started');

// Graceful shutdown
process.on('SIGTERM', async () => {
  await worker.close();
  process.exit(0);
});
