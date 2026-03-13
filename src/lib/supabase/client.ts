import { createClient } from '@supabase/supabase-js'

// ─── Browser Client (public anon key) ────────────────────────────────────────
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ─── Server Client (service role — server only) ───────────────────────────────
export function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

// ─── Database Types ───────────────────────────────────────────────────────────
export type Database = {
  public: {
    Tables: {
      saved_estimates: {
        Row: {
          id: string
          user_id: string
          name: string
          calculator_id: string
          inputs: Record<string, unknown>
          results: Record<string, unknown>[]
          budget_items: Record<string, unknown>[] | null
          total_cost: number | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['saved_estimates']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['saved_estimates']['Insert']>
      }
    }
  }
}
