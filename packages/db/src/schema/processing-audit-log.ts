import { pgTable, uuid, text, integer, timestamp, pgEnum, index } from 'drizzle-orm/pg-core';
import { documents } from './documents';

export const processingStageEnum = pgEnum('processing_stage', [
  'upload',
  'ocr',
  'extract',
  'validate',
  'complete',
]);

export const processingAuditLog = pgTable('processing_audit_log', {
  id: uuid('id').defaultRandom().primaryKey(),
  documentId: uuid('document_id')
    .notNull()
    .references(() => documents.id, { onDelete: 'cascade' }),
  stage: processingStageEnum('stage').notNull(),
  status: text('status').notNull(), // 'started', 'completed', 'failed'
  durationMs: integer('duration_ms'),
  costCents: integer('cost_cents'),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  documentStageIdx: index('audit_document_stage_idx').on(table.documentId, table.stage),
  createdIdx: index('audit_created_idx').on(table.createdAt),
}));

export type ProcessingAuditLog = typeof processingAuditLog.$inferSelect;
export type NewProcessingAuditLog = typeof processingAuditLog.$inferInsert;
