import postgres from "postgres";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function main() {
  const connectionString = process.env.SUPABASE_DB_SESSION_URL;
  if (!connectionString) {
    console.error("Missing SUPABASE_DB_SESSION_URL");
    process.exit(1);
  }

  const sql = postgres(connectionString);
  const query = fs.readFileSync("drizzle/0003_bumpy_peter_quill.sql", "utf8");

  try {
    console.log("Executing Drizzle Migration on local DB...");
    await sql.unsafe(query);
    console.log("Successfully executed.");
  } catch (err) {
    console.error("Error executing query:", err);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

main();
