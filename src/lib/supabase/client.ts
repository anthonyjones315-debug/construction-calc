import { createClient } from '@supabase/supabase-js'

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? 'https://placeholder.supabase.co'
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder'

// Browser-only client — uses the public anon key, safe to import in Client Components.
// For server-side operations (API routes, Server Components), import from @/lib/supabase/server instead.
export const supabase = createClient(url, anon)

// ─── TypeScript interfaces for all tables ─────────────────────

export interface SavedEstimate {
  id: string
  user_id: string
  name: string
  calculator_id: string
  inputs: Record<string, unknown>
  results: { label: string; value: string | number; unit?: string; highlight?: boolean; description?: string }[]
  budget_items: Record<string, unknown>[] | null
  total_cost: number | null
  client_name: string | null
  job_site_address: string | null
  status: 'Draft' | 'Sent' | 'Approved' | 'Lost'
  created_at: string
  updated_at: string
}

export type SavedEstimateInsert = Omit<SavedEstimate, 'id' | 'created_at' | 'updated_at'>
export type SavedEstimateUpdate = Partial<SavedEstimateInsert>

export interface BusinessProfile {
  user_id: string
  business_name: string | null
  business_phone: string | null
  business_email: string | null
  business_address: string | null
  business_website: string | null
  logo_url: string | null
  created_at: string
  updated_at: string
}

export type BusinessProfileUpsert = Omit<BusinessProfile, 'created_at' | 'updated_at'>

export interface UserMaterial {
  id: string
  user_id: string
  material_name: string
  category: string | null
  unit_type: string | null
  unit_cost: number
  created_at: string
  updated_at: string
}

export type UserMaterialInsert = Omit<UserMaterial, 'id' | 'created_at' | 'updated_at'>
export type UserMaterialUpdate = Partial<UserMaterialInsert>

// ─── Legacy Database type (kept for adapter compat) ───────────
export type Database = {
  public: {
    Tables: {
      saved_estimates: {
        Row: SavedEstimate
        Insert: SavedEstimateInsert
        Update: SavedEstimateUpdate
      }
      business_profiles: {
        Row: BusinessProfile
        Insert: BusinessProfileUpsert
        Update: BusinessProfileUpsert
      }
      user_materials: {
        Row: UserMaterial
        Insert: UserMaterialInsert
        Update: UserMaterialUpdate
      }
    }
  }
}
