import { defineConfig } from "drizzle-kit";

function getSessionPoolerUrl() {
  const url = process.env.SUPABASE_DB_SESSION_URL;

  if (!url) {
    throw new Error(
      "Missing SUPABASE_DB_SESSION_URL. Point it at the Supabase session pooler on port 5432 for migrations.",
    );
  }

  return url;
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: getSessionPoolerUrl(),
  },
  strict: true,
  verbose: true,
});
