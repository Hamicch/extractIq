import {
  pgTable,
  uuid,
  text,
  bigint,
  integer,
  timestamp,
  pgEnum,
  index,
  jsonb,
} from 'drizzle-orm/pg-core';
import { tenants } from './tenants.schema';

export const documentStatusEnum = pgEnum('document_status', [
  'pending',
  'processing',
  'completed',
  'failed',
]);

export const documentTypeEnum = pgEnum('document_type', [
  'invoice',
  'contract',
  'receipt',
  'generic',
]);

export const documents = pgTable(
  'documents',
  {
    id: uuid('id').primaryKey(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    filePath: text('file_path').notNull(),

    // Metadata
    originalName: text('original_name').notNull(),
    size: bigint('size', { mode: 'number' }).notNull(),
    mimeType: text('mime_type').notNull(),
    uploadedBy: text('uploaded_by').notNull(),

    // Processing
    status: documentStatusEnum('status').notNull().default('pending'),
    type: documentTypeEnum('type'),

    // Extracted data (JSONB for flexibility)
    extractedData: jsonb('extracted_data'),

    // Error handling
    errorMessage: text('error_message'),

    // Timestamps
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    tenantCreatedIdx: index('documents_tenant_created_idx').on(
      table.tenantId,
      table.createdAt
    ),
    tenantStatusIdx: index('documents_tenant_status_idx').on(
      table.tenantId,
      table.status
    ),
    statusIdx: index('documents_status_idx').on(table.status),
  })
);

export type DocumentRow = typeof documents.$inferSelect;
export type NewDocumentRow = typeof documents.$inferInsert;
