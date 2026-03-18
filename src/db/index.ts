import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

declare global {
  // Reuse the process-local pool during dev hot reloads.
  var __constructionCalcSql__: ReturnType<typeof postgres> | undefined;
}

function getTransactionPoolerUrl() {
  const url =
    process.env.SUPABASE_DB_TRANSACTION_URL ??
    process.env.DATABASE_URL ??
    process.env.POSTGRES_URL;

  if (!url) {
    throw new Error(
      "Missing SUPABASE_DB_TRANSACTION_URL. Point it at the Supabase transaction pooler on port 6543.",
    );
  }

  return url;
}

const sql =
  globalThis.__constructionCalcSql__ ??
  postgres(getTransactionPoolerUrl(), {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false,
    ssl: "require",
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__constructionCalcSql__ = sql;
}

export const db = drizzle(sql, { schema });
export { sql };
