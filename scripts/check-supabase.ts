// scripts/check-supabase.ts
import { createServerClient } from "@/lib/supabase/server";

async function main() {
  try {
    const supabase = createServerClient();
    const { error } = await supabase.rpc("pg_sleep", { seconds: 0 }); // simple RPC to test connection
    // If pg_sleep not available, fallback to a simple query
    if (error) {
      // fallback query
      const { data: qData, error: qError } = await supabase.from("users").select("id").limit(1);
      if (qError) throw qError;
      console.log("Supabase connection successful, sample user ID:", qData?.[0]?.id);
    } else {
      console.log("Supabase connection successful via pg_sleep test.");
    }
  } catch (err) {
    console.error("Supabase health check failed:", err);
    process.exit(1);
  }
}

main();
