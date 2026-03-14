import { createClient } from '@supabase/supabase-js'

// Server-only client — uses the service role key which bypasses RLS.
// NEVER import this in Client Components or files bundled for the browser.
// Safe to use in: API routes, Server Components, server actions.
export function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL  ?? 'https://placeholder.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? 'placeholder',
    { auth: { persistSession: false } }
  )
}
