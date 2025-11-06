import { Worker, Queue } from 'bullmq';
import { DocumentProcessor, DocumentProcessorJob } from './document-processor';

/**
 * Background Worker Manager
 * Manages BullMQ worker lifecycle in Next.js process
 */

let worker: Worker | null = null;
let isShuttingDown = false;

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);
const REDIS_PASSWORD = process.env.REDIS_PASSWORD;

const redisConnection = {
  host: REDIS_HOST,
  port: REDIS_PORT,
  password: REDIS_PASSWORD,
};

const QUEUE_NAME = 'document-processing';

const documentProcessor = new DocumentProcessor();

/**
 * Start the background worker
 * Should be called once when Next.js starts
 */
export async function startWorker(): Promise<void> {
  if (worker) {
    console.log('⚠️  Worker already running');
    return;
  }

  console.log('🔧 Starting background worker...');

  try {
    worker = new Worker<DocumentProcessorJob>(
      QUEUE_NAME,
      async (job) => {
        await documentProcessor.processJob(job);
      },
      {
        connection: redisConnection,
        concurrency: parseInt(process.env.WORKER_CONCURRENCY || '5', 10),
        limiter: {
          max: parseInt(process.env.WORKER_RATE_LIMIT_MAX || '10', 10),
          duration: parseInt(process.env.WORKER_RATE_LIMIT_DURATION || '1000', 10),
        },
      }
    );

    // Event handlers
    worker.on('completed', async (job) => {
      await documentProcessor.onCompleted(job);
    });

    worker.on('failed', async (job, error) => {
      await documentProcessor.onFailed(job, error);
    });

    worker.on('error', (error) => {
      console.error('❌ Worker error:', error);
    });

    console.log('✅ Background worker started successfully');
  } catch (error) {
    console.error('❌ Failed to start worker:', error);
    throw error;
  }
}

/**
 * Stop the background worker gracefully
 * Should be called on process shutdown
 */
export async function stopWorker(): Promise<void> {
  if (!worker || isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  console.log('🛑 Stopping background worker...');

  try {
    await worker.close();
    worker = null;
    console.log('✅ Background worker stopped');
  } catch (error) {
    console.error('❌ Error stopping worker:', error);
  } finally {
    isShuttingDown = false;
  }
}

/**
 * Get worker status
 */
export function getWorkerStatus(): {
  isRunning: boolean;
  isShuttingDown: boolean;
} {
  return {
    isRunning: worker !== null,
    isShuttingDown,
  };
}

/**
 * Get queue instance for monitoring
 */
export function getQueue(): Queue<DocumentProcessorJob> {
  return new Queue<DocumentProcessorJob>(QUEUE_NAME, {
    connection: redisConnection,
  });
}
