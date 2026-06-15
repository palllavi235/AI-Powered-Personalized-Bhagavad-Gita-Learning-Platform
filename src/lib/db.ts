import "server-only";

import { Pool, type QueryResultRow } from "pg";

let pool: Pool | null = null;

export function getPool() {
  if (!process.env.DATABASE_URL) return null;
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL.includes("sslmode=require") ? { rejectUnauthorized: false } : undefined
    });
  }
  return pool;
}

export async function query<T extends QueryResultRow>(sql: string, params: unknown[] = []) {
  const db = getPool();
  if (!db) throw new Error("DATABASE_URL is not configured.");
  const result = await db.query<T>(sql, params);
  return result;
}
