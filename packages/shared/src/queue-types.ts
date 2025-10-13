import { z } from 'zod';

// Job Queue Names
export const QueueNames = {
  DOCUMENT_PROCESSING: 'document-processing',
} as const;

// Job Names
export const JobNames = {
  DOCUMENT_UPLOAD: 'document.upload',
  DOCUMENT_OCR: 'document.ocr',
  DOCUMENT_EXTRACT: 'document.extract',
  DOCUMENT_VALIDATE: 'document.validate',
} as const;

// Job Data Schemas
export const DocumentUploadJobDataSchema = z.object({
  documentId: z.string().uuid(),
  tenantId: z.string().uuid(),
  fileUrl: z.string().url(),
  fileName: z.string(),
  mimeType: z.string(),
  fileSizeBytes: z.number(),
});

export const DocumentOcrJobDataSchema = z.object({
  documentId: z.string().uuid(),
  tenantId: z.string().uuid(),
  fileUrl: z.string().url(),
  fileName: z.string(),
  mimeType: z.string(),
});

export const DocumentExtractJobDataSchema = z.object({
  documentId: z.string().uuid(),
  tenantId: z.string().uuid(),
  extractedText: z.string(),
  extractionType: z.enum(['invoice', 'contract', 'receipt', 'form']),
  modelVersion: z.string().default('gpt-4-turbo'),
});

export const DocumentValidateJobDataSchema = z.object({
  documentId: z.string().uuid(),
  tenantId: z.string().uuid(),
  extractionId: z.string().uuid(),
});

// Job Data Types
export type DocumentUploadJobData = z.infer<typeof DocumentUploadJobDataSchema>;
export type DocumentOcrJobData = z.infer<typeof DocumentOcrJobDataSchema>;
export type DocumentExtractJobData = z.infer<
  typeof DocumentExtractJobDataSchema
>;
export type DocumentValidateJobData = z.infer<
  typeof DocumentValidateJobDataSchema
>;

// Job Result Schemas
export const DocumentUploadResultSchema = z.object({
  documentId: z.string().uuid(),
  status: z.literal('uploaded'),
  pageCount: z.number().optional(),
});

export const DocumentOcrResultSchema = z.object({
  documentId: z.string().uuid(),
  extractedText: z.string(),
  pageCount: z.number(),
  confidence: z.number().min(0).max(1),
});

export const DocumentExtractResultSchema = z.object({
  documentId: z.string().uuid(),
  extractionId: z.string().uuid(),
  data: z.record(z.unknown()),
  confidenceScore: z.string(),
  tokensUsed: z.object({
    prompt: z.number(),
    completion: z.number(),
    total: z.number(),
  }),
  costCents: z.number(),
});

export const DocumentValidateResultSchema = z.object({
  documentId: z.string().uuid(),
  isValid: z.boolean(),
  lowConfidenceFields: z.array(z.string()),
  validationErrors: z.array(z.string()),
});

// Job Result Types
export type DocumentUploadResult = z.infer<typeof DocumentUploadResultSchema>;
export type DocumentOcrResult = z.infer<typeof DocumentOcrResultSchema>;
export type DocumentExtractResult = z.infer<typeof DocumentExtractResultSchema>;
export type DocumentValidateResult = z.infer<
  typeof DocumentValidateResultSchema
>;

// WebSocket Event Types
export const WebSocketEvents = {
  DOCUMENT_STATUS: 'document:status',
  DOCUMENT_PROGRESS: 'document:progress',
  DOCUMENT_COMPLETED: 'document:completed',
  DOCUMENT_FAILED: 'document:failed',
} as const;

export interface DocumentStatusEvent {
  documentId: string;
  tenantId: string;
  status: 'uploaded' | 'queued' | 'processing' | 'completed' | 'failed';
  stage: 'upload' | 'ocr' | 'extract' | 'validate' | 'complete';
  timestamp: string;
}

export interface DocumentProgressEvent {
  documentId: string;
  tenantId: string;
  stage: 'upload' | 'ocr' | 'extract' | 'validate';
  progress: number; // 0-100
  message?: string;
  timestamp: string;
}

export interface DocumentCompletedEvent {
  documentId: string;
  tenantId: string;
  extractionId?: string;
  timestamp: string;
}

export interface DocumentFailedEvent {
  documentId: string;
  tenantId: string;
  stage: 'upload' | 'ocr' | 'extract' | 'validate';
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  timestamp: string;
}
