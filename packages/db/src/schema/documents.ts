import {
  pgTable,
  uuid,
  text,
  bigint,
  integer,
  timestamp,
  pgEnum,
  index,
} from 'drizzle-orm/pg-core';
import { tenants } from './tenants';

export const documentStatusEnum = pgEnum('document_status', [
  'queued',
  'uploaded',
  'processing',
  'completed',
  'failed',
]);

export const documents = pgTable(
  'documents',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    status: documentStatusEnum('status').notNull().default('uploaded'),
    fileUrl: text('file_url').notNull(),
    fileName: text('file_name').notNull(),
    fileSizeBytes: bigint('file_size_bytes', { mode: 'number' }).notNull(),
    mimeType: text('mime_type').notNull(),
    pageCount: integer('page_count'),
    uploadedBy: text('uploaded_by'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    processedAt: timestamp('processed_at'),
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
  })
);

export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;
