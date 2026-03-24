import { createClient } from "@supabase/supabase-js";
import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("URL:", "'" + url + "'");
console.log("KEY:", "'" + key + "'");

const db = createClient(url, key, { auth: { persistSession: false } });

db.from("clients").select("*").limit(1).then(res => {
  console.log("DB response", res.error ? "ERROR: " + res.error.message : "SUCCESS");
}).catch(err => console.error("Caught error:", err));
