import { z } from 'zod';

/**
 * Docuflow API Zod Schemas
 * Runtime validation schemas generated from OpenAPI spec
 */

// Enums
export const DocumentStatusSchema = z.enum([
  'uploading',
  'queued',
  'processing',
  'completed',
  'failed',
]);

export const WebhookEventSchema = z.enum([
  'document.processing.completed',
  'document.processing.failed',
  'document.uploaded',
  'document.deleted',
]);

export const TenantPlanSchema = z.enum([
  'free',
  'starter',
  'pro',
  'enterprise',
]);

export const AnalyticsGranularitySchema = z.enum([
  'hour',
  'day',
  'week',
  'month',
]);

export const SortBySchema = z.enum([
  'uploadedAt',
  'processedAt',
  'name',
  'size',
]);

export const SortOrderSchema = z.enum(['asc', 'desc']);

// Base Schemas
export const ExtractionConfigSchema = z.object({
  fields: z.array(z.string()).optional(),
  language: z.string().default('en'),
  customPrompt: z.string().optional(),
});

export const ProcessingErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.record(z.unknown()).optional(),
});

export const BoundingBoxSchema = z.object({
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
});

export const ExtractedFieldSchema = z.object({
  value: z.unknown(),
  confidence: z.number().min(0).max(1),
  boundingBox: BoundingBoxSchema.optional(),
  page: z.number().int().optional(),
});

export const ExtractedDataSchema = z.object({
  documentId: z.string().uuid(),
  extractedAt: z.string().datetime(),
  fields: z.record(ExtractedFieldSchema),
  rawText: z.string().optional(),
  confidence: z.number().min(0).max(1),
  pageCount: z.number().int().optional(),
});

export const ExtractedDataUpdateSchema = z.object({
  fields: z.record(z.unknown()),
});

export const DocumentSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  name: z.string(),
  size: z.number().int().positive(),
  mimeType: z.string(),
  status: DocumentStatusSchema,
  uploadedAt: z.string().datetime(),
  processedAt: z.string().datetime().optional(),
  s3Key: z.string(),
  downloadUrl: z.string().url().optional(),
  metadata: z.record(z.unknown()).optional(),
  extractionConfig: ExtractionConfigSchema.optional(),
  error: ProcessingErrorSchema.optional(),
});

export const DocumentUploadResponseSchema = z.object({
  documentId: z.string().uuid(),
  uploadUrl: z.string().url(),
  expiresAt: z.string().datetime(),
  status: DocumentStatusSchema,
});

export const DocumentStatusResponseSchema = z.object({
  documentId: z.string().uuid(),
  status: DocumentStatusSchema,
  progress: z.number().int().min(0).max(100).optional(),
  estimatedCompletionAt: z.string().datetime().optional(),
  error: ProcessingErrorSchema.optional(),
});

export const CursorPaginationSchema = z.object({
  nextCursor: z.string().nullable(),
  prevCursor: z.string().nullable(),
  hasNext: z.boolean(),
  hasPrev: z.boolean(),
  nextUrl: z.string().url().nullable().optional(),
  prevUrl: z.string().url().nullable().optional(),
});

export const DocumentListResponseSchema = z.object({
  data: z.array(DocumentSchema),
  pagination: CursorPaginationSchema,
});

export const WebhookConfigSchema = z.object({
  url: z.string().url(),
  events: z.array(WebhookEventSchema).min(1),
  secret: z.string().optional(),
  enabled: z.boolean().default(true),
});

export const WebhookSchema = WebhookConfigSchema.extend({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  createdAt: z.string().datetime(),
  lastTriggeredAt: z.string().datetime().nullable().optional(),
});

export const WebhookPayloadSchema = z.object({
  event: z.string(),
  timestamp: z.string().datetime(),
  data: z.record(z.unknown()),
  signature: z.string().optional(),
});

export const TenantQuotaSchema = z.object({
  maxDocumentsPerMonth: z.number().int(),
  maxStorageGB: z.number().int(),
  maxRequestsPerMinute: z.number().int().optional(),
});

export const TenantUsageSchema = z.object({
  documentsThisMonth: z.number().int(),
  storageUsedGB: z.number(),
  requestsThisMinute: z.number().int().optional(),
});

export const TenantSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  createdAt: z.string().datetime(),
  plan: TenantPlanSchema,
  quota: TenantQuotaSchema.optional(),
  usage: TenantUsageSchema.optional(),
});

export const TenantListResponseSchema = z.object({
  data: z.array(TenantSchema),
  pagination: CursorPaginationSchema,
});

export const AnalyticsTimeSeriesSchema = z.object({
  timestamp: z.string().datetime(),
  count: z.number().int(),
  cost: z.number().optional(),
  successCount: z.number().int().optional(),
  failureCount: z.number().int().optional(),
});

export const AnalyticsSchema = z.object({
  period: z.object({
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    granularity: AnalyticsGranularitySchema,
  }),
  metrics: z.object({
    documentsProcessed: z.number().int(),
    totalCost: z.number(),
    successRate: z.number().min(0).max(1),
    averageProcessingTime: z.number().optional(),
    totalPages: z.number().int().optional(),
  }),
  timeSeries: z.array(AnalyticsTimeSeriesSchema).optional(),
});

export const ErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.record(z.unknown()).optional(),
    field: z.string().optional(),
  }),
});

export const QuotaExceededErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    quota: TenantQuotaSchema.optional(),
    usage: TenantUsageSchema.optional(),
    upgradeUrl: z.string().url().optional(),
  }),
});

// Request Schemas
export const UploadDocumentRequestSchema = z.object({
  file: z.instanceof(File),
  extractionConfig: ExtractionConfigSchema.optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const ListDocumentsRequestSchema = z.object({
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(20),
  status: z.array(DocumentStatusSchema).optional(),
  uploadedAfter: z.string().datetime().optional(),
  uploadedBefore: z.string().datetime().optional(),
  sortBy: SortBySchema.default('uploadedAt'),
  sortOrder: SortOrderSchema.default('desc'),
});

export const GetAnalyticsRequestSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  granularity: AnalyticsGranularitySchema.default('day'),
});

export const ListTenantsRequestSchema = z.object({
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(20),
});

// Type exports
export type DocumentStatus = z.infer<typeof DocumentStatusSchema>;
export type WebhookEvent = z.infer<typeof WebhookEventSchema>;
export type TenantPlan = z.infer<typeof TenantPlanSchema>;
export type AnalyticsGranularity = z.infer<typeof AnalyticsGranularitySchema>;
export type SortBy = z.infer<typeof SortBySchema>;
export type SortOrder = z.infer<typeof SortOrderSchema>;

export type ExtractionConfig = z.infer<typeof ExtractionConfigSchema>;
export type ProcessingError = z.infer<typeof ProcessingErrorSchema>;
export type BoundingBox = z.infer<typeof BoundingBoxSchema>;
export type ExtractedField = z.infer<typeof ExtractedFieldSchema>;
export type ExtractedData = z.infer<typeof ExtractedDataSchema>;
export type ExtractedDataUpdate = z.infer<typeof ExtractedDataUpdateSchema>;

export type Document = z.infer<typeof DocumentSchema>;
export type DocumentUploadResponse = z.infer<
  typeof DocumentUploadResponseSchema
>;
export type DocumentStatusResponse = z.infer<
  typeof DocumentStatusResponseSchema
>;
export type CursorPagination = z.infer<typeof CursorPaginationSchema>;
export type DocumentListResponse = z.infer<typeof DocumentListResponseSchema>;

export type WebhookConfig = z.infer<typeof WebhookConfigSchema>;
export type Webhook = z.infer<typeof WebhookSchema>;
export type WebhookPayload = z.infer<typeof WebhookPayloadSchema>;

export type TenantQuota = z.infer<typeof TenantQuotaSchema>;
export type TenantUsage = z.infer<typeof TenantUsageSchema>;
export type Tenant = z.infer<typeof TenantSchema>;
export type TenantListResponse = z.infer<typeof TenantListResponseSchema>;

export type AnalyticsTimeSeries = z.infer<typeof AnalyticsTimeSeriesSchema>;
export type Analytics = z.infer<typeof AnalyticsSchema>;

export type ApiError = z.infer<typeof ErrorSchema>;
export type QuotaExceededError = z.infer<typeof QuotaExceededErrorSchema>;

export type UploadDocumentRequest = z.infer<typeof UploadDocumentRequestSchema>;
export type ListDocumentsRequest = z.infer<typeof ListDocumentsRequestSchema>;
export type GetAnalyticsRequest = z.infer<typeof GetAnalyticsRequestSchema>;
export type ListTenantsRequest = z.infer<typeof ListTenantsRequestSchema>;

// Job Data Types
export const JobDataSchema = z.object({
  documentId: z.string().uuid(),
  userId: z.string(),
  tenantId: z.string().uuid(),
});

export type JobData = z.infer<typeof JobDataSchema>;
