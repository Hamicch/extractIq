import { z } from 'zod';

export const DocumentStatusEnum = z.enum([
  'uploading',
  'processing',
  'completed',
  'failed',
]);

export const DocumentSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  size: z.number().positive(),
  mimeType: z.string(),
  status: DocumentStatusEnum,
  uploadedAt: z.date(),
  processedAt: z.date().optional(),
  userId: z.string().uuid(),
  s3Key: z.string(),
  metadata: z.record(z.unknown()).optional(),
});

export const CreateDocumentSchema = z.object({
  name: z.string().min(1).max(255),
  size: z.number().positive(),
  mimeType: z.string(),
});

export const UpdateDocumentSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  status: DocumentStatusEnum.optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type Document = z.infer<typeof DocumentSchema>;
export type DocumentStatus = z.infer<typeof DocumentStatusEnum>;
export type CreateDocument = z.infer<typeof CreateDocumentSchema>;
export type UpdateDocument = z.infer<typeof UpdateDocumentSchema>;
