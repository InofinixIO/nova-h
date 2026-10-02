import { neon, NeonQueryFunction } from '@neondatabase/serverless';
import { drizzle, NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL || '';

export const isDatabaseConfigured = (): boolean => {
  return Boolean(
    connectionString && 
    connectionString.trim().length > 0 && 
    (connectionString.startsWith('postgres://') || connectionString.startsWith('postgresql://'))
  );
};

let sqlClient: NeonQueryFunction<false, false> | null = null;
let db: NeonHttpDatabase<typeof schema> | null = null;

if (isDatabaseConfigured()) {
  try {
    sqlClient = neon(connectionString);
    db = drizzle(sqlClient, { schema });
    console.log('[Neon PostgreSQL] Database client initialized successfully with connection string.');
  } catch (err) {
    console.error('[Neon PostgreSQL] Failed to initialize database client:', err);
    sqlClient = null;
    db = null;
  }
} else {
  console.log('[Neon PostgreSQL] No valid DATABASE_URL found in environment. Server will use local memory/JSON fallback.');
}

export { db, sqlClient, schema };
