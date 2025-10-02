import { pgTable, uuid, text, integer, timestamp, index } from 'drizzle-orm/pg-core';

export const tenants = pgTable('tenants', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  apiKeyHash: text('api_key_hash').notNull().unique(),
  rateLimitPerHour: integer('rate_limit_per_hour').notNull().default(1000),
  monthlyQuotaPages: integer('monthly_quota_pages').notNull().default(10000),
  webhookUrl: text('webhook_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  nameIdx: index('tenants_name_idx').on(table.name),
}));

export type Tenant = typeof tenants.$inferSelect;
export type NewTenant = typeof tenants.$inferInsert;
