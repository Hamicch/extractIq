import { pgTable, uuid, varchar, bigint, timestamp, json } from 'drizzle-orm/pg-core';
import { users } from './users';

export const documents = pgTable('documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  size: bigint('size', { mode: 'number' }).notNull(),
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  status: varchar('status', { length: 50 }).notNull().default('uploading'),
  s3Key: varchar('s3_key', { length: 500 }).notNull(),
  metadata: json('metadata'),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  uploadedAt: timestamp('uploaded_at').defaultNow().notNull(),
  processedAt: timestamp('processed_at'),
});
