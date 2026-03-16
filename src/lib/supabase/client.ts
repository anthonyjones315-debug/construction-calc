import { createClient } from "@supabase/supabase-js";

const url =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co";
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder";

// Browser-only client — uses the public anon key, safe to import in Client Components.
// For server-side operations (API routes, Server Components), import from @/lib/supabase/server instead.
export const supabase = createClient(url, anon);

// ─── TypeScript interfaces for all tables ─────────────────────

export interface SavedEstimate {
  id: string;
  user_id: string;
  business_id: string;
  name: string;
  calculator_id: string;
  inputs: Record<string, unknown>;
  results: {
    label: string;
    value: string | number;
    unit?: string;
    highlight?: boolean;
    description?: string;
  }[];
  budget_items: Record<string, unknown>[] | null;
  total_cost: number | null;
  client_name: string | null;
  job_site_address: string | null;
  status: "Draft" | "Sent" | "Approved" | "Lost" | "PENDING" | "SIGNED";
  share_code?: string | null;
  created_at: string;
  updated_at: string;
}

export type SavedEstimateInsert = Omit<
  SavedEstimate,
  "id" | "created_at" | "updated_at"
>;
export type SavedEstimateUpdate = Partial<SavedEstimateInsert>;

export interface BusinessProfile {
  user_id: string;
  business_id: string;
  business_name: string | null;
  business_tax_id: string | null;
  business_phone: string | null;
  business_email: string | null;
  business_address: string | null;
  business_website: string | null;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}

export type BusinessProfileUpsert = Omit<
  BusinessProfile,
  "created_at" | "updated_at"
>;

export interface UserMaterial {
  id: string;
  user_id: string;
  business_id: string;
  material_name: string;
  category: string | null;
  unit_type: string | null;
  unit_cost: number;
  created_at: string;
  updated_at: string;
}

export type UserMaterialInsert = Omit<
  UserMaterial,
  "id" | "created_at" | "updated_at"
>;
export type UserMaterialUpdate = Partial<UserMaterialInsert>;

export interface Business {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export type BusinessInsert = Omit<Business, "id" | "created_at" | "updated_at">;
export type BusinessUpdate = Partial<BusinessInsert>;

export interface Membership {
  id: string;
  business_id: string;
  user_id: string;
  role: "owner" | "admin" | "editor";
  created_at: string;
}

export type MembershipInsert = Omit<Membership, "id" | "created_at">;
export type MembershipUpdate = Partial<MembershipInsert>;

// ─── Legacy Database type (kept for adapter compat) ───────────
export type Database = {
  public: {
    Tables: {
      saved_estimates: {
        Row: SavedEstimate;
        Insert: SavedEstimateInsert;
        Update: SavedEstimateUpdate;
      };
      businesses: {
        Row: Business;
        Insert: BusinessInsert;
        Update: BusinessUpdate;
      };
      memberships: {
        Row: Membership;
        Insert: MembershipInsert;
        Update: MembershipUpdate;
      };
      business_profiles: {
        Row: BusinessProfile;
        Insert: BusinessProfileUpsert;
        Update: BusinessProfileUpsert;
      };
      user_materials: {
        Row: UserMaterial;
        Insert: UserMaterialInsert;
        Update: UserMaterialUpdate;
      };
    };
  };
};
