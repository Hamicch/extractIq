import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';

export const tenants = pgTable(
  'tenants',
  {
    id: uuid('id').primaryKey(),
    name: text('name').notNull(),
    apiKeyHash: text('api_key_hash').notNull().unique(),
    rateLimitPerHour: integer('rate_limit_per_hour').notNull().default(1000),
    monthlyQuotaPages: integer('monthly_quota_pages').notNull().default(10000),
    webhookUrl: text('webhook_url'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    nameIdx: index('tenants_name_idx').on(table.name),
    apiKeyHashIdx: index('tenants_api_key_hash_idx').on(table.apiKeyHash),
  })
);

export type TenantRow = typeof tenants.$inferSelect;
export type NewTenantRow = typeof tenants.$inferInsert;
