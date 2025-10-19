import { QueueService, Job, JobOptions, Result } from '@extractiq/core';
import { Queue as BullQueue, QueueOptions } from 'bullmq';
import Redis from 'ioredis';

export class BullMQQueueService implements QueueService {
  private readonly queue: BullQueue;
  private readonly redis: Redis;

  constructor(queueName: string = 'document-processing', redisUrl?: string) {
    const url = redisUrl || process.env.REDIS_URL || 'redis://localhost:6379';

    this.redis = new Redis(url, {
      maxRetriesPerRequest: null,
    });

    const queueOptions: QueueOptions = {
      connection: this.redis,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: {
          count: 100, // Keep last 100 completed jobs
        },
        removeOnFail: {
          count: 500, // Keep last 500 failed jobs for debugging
        },
      },
    };

    this.queue = new BullQueue(queueName, queueOptions);
  }

  async add<T>(
    jobName: string,
    data: T,
    options?: JobOptions
  ): Promise<Result<Job<T>, Error>> {
    try {
      const bullJob = await this.queue.add(jobName, data, {
        priority: options?.priority,
        delay: options?.delay,
        attempts: options?.attempts,
        backoff: options?.backoff,
      });

      return Result.ok({
        id: bullJob.id!,
        name: bullJob.name,
        data: bullJob.data,
        progress: 0,
        attemptsMade: bullJob.attemptsMade,
      });
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  async getJob<T>(jobId: string): Promise<Result<Job<T> | null, Error>> {
    try {
      const bullJob = await this.queue.getJob(jobId);

      if (!bullJob) {
        return Result.ok(null);
      }

      return Result.ok({
        id: bullJob.id!,
        name: bullJob.name,
        data: bullJob.data,
        progress: typeof bullJob.progress === 'number' ? bullJob.progress : 0,
        attemptsMade: bullJob.attemptsMade,
        failedReason: bullJob.failedReason,
      });
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  async removeJob(jobId: string): Promise<Result<void, Error>> {
    try {
      const job = await this.queue.getJob(jobId);
      if (job) {
        await job.remove();
      }
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  async getQueueStatus(): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
  }> {
    const [waiting, active, completed, failed] = await Promise.all([
      this.queue.getWaitingCount(),
      this.queue.getActiveCount(),
      this.queue.getCompletedCount(),
      this.queue.getFailedCount(),
    ]);

    return { waiting, active, completed, failed };
  }

  async retryJob(jobId: string): Promise<Result<void, Error>> {
    try {
      const job = await this.queue.getJob(jobId);
      if (!job) {
        return Result.fail(new Error('Job not found'));
      }

      await job.retry();
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  async close(): Promise<void> {
    await this.queue.close();
    await this.redis.quit();
  }
}
