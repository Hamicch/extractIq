import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/schema/*',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    host: 'localhost',
    port: 5433,
    user: 'docuflow',
    password: 'docuflow_dev',
    database: 'docuflow',
    ssl: false,
  },
});
