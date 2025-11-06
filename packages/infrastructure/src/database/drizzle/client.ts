import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

let _db: ReturnType<typeof drizzle> | null = null;
let _client: ReturnType<typeof postgres> | null = null;

function initializeDatabase() {
  if (_db) {
    return { db: _db, client: _client! };
  }

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  // Create postgres client
  const client = postgres(connectionString, {
    max: 10, // Maximum number of connections
    idle_timeout: 20, // Close idle connections after 20 seconds
    connect_timeout: 10, // Connection timeout in seconds
  });

  // Create drizzle instance
  const db = drizzle(client, { schema });

  _db = db;
  _client = client;

  return { db, client };
}

// Lazy-initialized database instance
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop) {
    const { db } = initializeDatabase();
    return (db as any)[prop];
  },
});

// Export types
export type Database = typeof db;

// Graceful shutdown
export async function closeDatabase() {
  if (_client) {
    await _client.end();
    _db = null;
    _client = null;
  }
}
