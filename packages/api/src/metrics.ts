import promClient from 'prom-client';

// Create a Registry
export const register = new promClient.Registry();

// Add default metrics (CPU, memory, etc.)
promClient.collectDefaultMetrics({ register });

// Custom metrics

// Documents processed counter
export const documentsProcessedCounter = new promClient.Counter({
  name: 'documents_processed_total',
  help: 'Total number of documents processed',
  labelNames: ['tenant_id', 'status', 'document_type'],
  registers: [register],
});

// Document processing duration histogram
export const documentProcessingDuration = new promClient.Histogram({
  name: 'document_processing_duration_seconds',
  help: 'Duration of document processing in seconds',
  labelNames: ['tenant_id', 'stage', 'document_type'],
  buckets: [0.1, 0.5, 1, 2, 5, 10, 30, 60, 120], // seconds
  registers: [register],
});

// API request counter
export const apiRequestsCounter = new promClient.Counter({
  name: 'api_requests_total',
  help: 'Total number of API requests',
  labelNames: ['method', 'endpoint', 'status_code'],
  registers: [register],
});

// API request duration histogram
export const apiRequestDuration = new promClient.Histogram({
  name: 'api_request_duration_seconds',
  help: 'Duration of API requests in seconds',
  labelNames: ['method', 'endpoint', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5], // seconds
  registers: [register],
});

// WebSocket connections gauge
export const websocketConnections = new promClient.Gauge({
  name: 'websocket_connections',
  help: 'Current number of WebSocket connections',
  labelNames: ['tenant_id'],
  registers: [register],
});

// Queue size gauge
export const queueSize = new promClient.Gauge({
  name: 'queue_size',
  help: 'Number of jobs in queue',
  labelNames: ['queue_name', 'status'],
  registers: [register],
});

// Active worker jobs gauge
export const activeWorkerJobs = new promClient.Gauge({
  name: 'worker_jobs_active',
  help: 'Number of currently active worker jobs',
  labelNames: ['queue_name', 'job_type'],
  registers: [register],
});

// OpenAI API latency histogram
export const openaiApiLatency = new promClient.Histogram({
  name: 'openai_api_latency_seconds',
  help: 'Latency of OpenAI API calls in seconds',
  labelNames: ['model', 'operation', 'status'],
  buckets: [0.1, 0.5, 1, 2, 5, 10, 20, 30], // seconds
  registers: [register],
});

// OpenAI cost counter
export const openaiCost = new promClient.Counter({
  name: 'openai_cost_dollars',
  help: 'Total cost of OpenAI API calls in dollars',
  labelNames: ['tenant_id', 'model', 'operation'],
  registers: [register],
});

// Database query duration histogram
export const dbQueryDuration = new promClient.Histogram({
  name: 'db_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['operation', 'table'],
  buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1], // seconds
  registers: [register],
});

// Redis operation duration histogram
export const redisOperationDuration = new promClient.Histogram({
  name: 'redis_operation_duration_seconds',
  help: 'Duration of Redis operations in seconds',
  labelNames: ['operation', 'status'],
  buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1], // seconds
  registers: [register],
});

// Cache hit/miss counter
export const cacheCounter = new promClient.Counter({
  name: 'cache_requests_total',
  help: 'Total number of cache requests',
  labelNames: ['cache_name', 'result'], // result: hit/miss
  registers: [register],
});

// Helper functions for recording metrics

export function recordDocumentProcessed(
  tenantId: string,
  status: 'success' | 'failed',
  documentType: string
) {
  documentsProcessedCounter.inc({
    tenant_id: tenantId,
    status,
    document_type: documentType,
  });
}

export function recordDocumentProcessingTime(
  tenantId: string,
  stage: string,
  documentType: string,
  durationSeconds: number
) {
  documentProcessingDuration.observe(
    {
      tenant_id: tenantId,
      stage,
      document_type: documentType,
    },
    durationSeconds
  );
}

export function recordApiRequest(
  method: string,
  endpoint: string,
  statusCode: number,
  durationSeconds: number
) {
  apiRequestsCounter.inc({
    method,
    endpoint,
    status_code: statusCode.toString(),
  });

  apiRequestDuration.observe(
    {
      method,
      endpoint,
      status_code: statusCode.toString(),
    },
    durationSeconds
  );
}

export function setWebSocketConnections(tenantId: string, count: number) {
  websocketConnections.set({ tenant_id: tenantId }, count);
}

export function recordOpenAICall(
  tenantId: string,
  model: string,
  operation: string,
  costDollars: number,
  durationSeconds: number,
  status: 'success' | 'error'
) {
  openaiCost.inc(
    {
      tenant_id: tenantId,
      model,
      operation,
    },
    costDollars
  );

  openaiApiLatency.observe(
    {
      model,
      operation,
      status,
    },
    durationSeconds
  );
}

export function recordCacheAccess(cacheName: string, hit: boolean) {
  cacheCounter.inc({
    cache_name: cacheName,
    result: hit ? 'hit' : 'miss',
  });
}
