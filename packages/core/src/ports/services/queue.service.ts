import { Result } from '../../types/result';

export interface JobOptions {
  priority?: number;
  delay?: number;
  attempts?: number;
  backoff?: {
    type: 'exponential' | 'fixed';
    delay: number;
  };
}

export interface Job<T = any> {
  id: string;
  name: string;
  data: T;
  progress: number;
  attemptsMade: number;
  failedReason?: string;
}

/**
 * Queue Service interface (port)
 * Infrastructure layer will implement this with BullMQ
 */
export interface QueueService {
  /**
   * Add a job to the queue
   */
  add<T>(
    jobName: string,
    data: T,
    options?: JobOptions
  ): Promise<Result<Job<T>, Error>>;

  /**
   * Get job by ID
   */
  getJob<T>(jobId: string): Promise<Result<Job<T> | null, Error>>;

  /**
   * Remove job by ID
   */
  removeJob(jobId: string): Promise<Result<void, Error>>;

  /**
   * Get queue status
   */
  getQueueStatus(): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
  }>;

  /**
   * Retry failed job
   */
  retryJob(jobId: string): Promise<Result<void, Error>>;
}
