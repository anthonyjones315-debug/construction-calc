import { createClient } from "@supabase/supabase-js";

function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  }

  if (!serviceRoleKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  }

  return { url, serviceRoleKey };
}

// Server-only client — uses the service role key which bypasses RLS.
// NEVER import this in Client Components or files bundled for the browser.
// Safe to use in: API routes, Server Components, server actions.
export function createServerClient() {
  const { url, serviceRoleKey } = getSupabaseEnv();
  console.log("createServerClient URL initialized as:", `'${url}'`);
  return createClient(url, serviceRoleKey, { auth: { persistSession: false } });
}
