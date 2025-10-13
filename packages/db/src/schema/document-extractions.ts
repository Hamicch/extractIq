import {
  pgTable,
  uuid,
  text,
  decimal,
  timestamp,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';
import { documents } from './documents';

export const documentExtractions = pgTable(
  'document_extractions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    documentId: uuid('document_id')
      .notNull()
      .references(() => documents.id, { onDelete: 'cascade' }),
    extractionType: text('extraction_type').notNull(), // e.g., 'invoice', 'contract', 'receipt'
    data: jsonb('data').notNull(), // Extracted structured data
    confidenceScore: decimal('confidence_score', {
      precision: 3,
      scale: 2,
    }).notNull(), // 0.00 to 1.00
    modelVersion: text('model_version').notNull(),
    metadata: jsonb('metadata'),
    extractedAt: timestamp('extracted_at').defaultNow().notNull(),
  },
  (table) => ({
    documentIdx: index('extractions_document_idx').on(table.documentId),
    typeIdx: index('extractions_type_idx').on(table.extractionType),
  })
);

export type DocumentExtraction = typeof documentExtractions.$inferSelect;
export type NewDocumentExtraction = typeof documentExtractions.$inferInsert;
