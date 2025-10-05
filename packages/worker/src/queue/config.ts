import { QueueOptions, WorkerOptions } from 'bullmq';
import Redis from 'ioredis';

const redisConnection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

export const queueConfig: QueueOptions = {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: {
      count: 100,
      age: 24 * 3600, // 24 hours
    },
    removeOnFail: {
      count: 1000,
      age: 7 * 24 * 3600, // 7 days
    },
  },
};

export const workerConfig: WorkerOptions = {
  connection: redisConnection,
  concurrency: parseInt(process.env.WORKER_CONCURRENCY || '5', 10),
  limiter: {
    max: 10,
    duration: 1000,
  },
};

export { redisConnection };
