import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/schema/*',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5433'),
    user: process.env.DB_USER || 'extractiq',
    password: process.env.DB_PASSWORD || 'extractiq_dev',
    database: process.env.DB_NAME || 'extractiq',
    ssl: false,
  },
});
