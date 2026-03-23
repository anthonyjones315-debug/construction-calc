-- ============================================================
-- proconstructioncalc.com — Full Supabase Schema v2
-- Run ENTIRE file in Supabase SQL Editor
--
-- PREREQUISITE: Run nextauth-schema-fix.sql FIRST.
-- Auth.js adapter tables (users/accounts/sessions/verification_tokens)
-- live in the "next_auth" schema, not public.
-- That file also installs a trigger that syncs next_auth.users → public.users
-- so the foreign keys below continue to work.
--
-- MULTI-TENANT NOTE:
-- To migrate from single-user to business-scoped data, also run:
-- src/lib/supabase/business-multi-tenant-migration.sql
-- ============================================================

create extension if not exists "uuid-ossp";

-- ─── public.users — synced from next_auth.users via trigger ──
-- Exists so saved_estimates / business_profiles / user_materials
-- can foreign-key to a stable public-schema table.
create table if not exists public.users (
  id              uuid not null default uuid_generate_v4() primary key,
  name            text,
  email           text unique,
  "emailVerified" timestamptz,
  image           text,
  pro_mode_enabled boolean,
  two_factor_enabled boolean not null default false
);

revoke all on public.users from anon, authenticated;

-- ─── Email 2FA Tokens ─────────────────────────────────────────
create table if not exists two_factor_tokens (
  id         uuid primary key default uuid_generate_v4(),
  email      text not null,
  token      text not null,
  expires    timestamptz not null
);

revoke all on two_factor_tokens from anon;
revoke all on two_factor_tokens from authenticated;

create index if not exists two_factor_tokens_email_idx on two_factor_tokens(email);
create index if not exists two_factor_tokens_expires_idx on two_factor_tokens(expires);

-- ─── Saved Estimates (with CRM fields) ────────────────────────
create table if not exists saved_estimates (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references public.users(id) on delete cascade,
  name             text not null default 'Untitled Estimate',
  calculator_id    text not null,
  inputs           jsonb not null default '{}',
  results          jsonb not null default '[]',
  budget_items     jsonb default null,
  total_cost       decimal(10,2) default null,
  subtotal_cents   bigint,
  tax_cents        bigint,
  total_cents      bigint,
  tax_basis_points integer,
  verified_county  text,
  verification_status text not null default 'unverified' check (verification_status in ('unverified','verified','corrected')),
  -- CRM fields (from schema screenshot)
  client_name      text,
  job_site_address text,
  status           text default 'Draft' check (status in ('Draft','Sent','Approved','Lost','PENDING','SIGNED')),
  share_code       text unique,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table saved_estimates
  add column if not exists subtotal_cents bigint,
  add column if not exists tax_cents bigint,
  add column if not exists total_cents bigint,
  add column if not exists tax_basis_points integer,
  add column if not exists verified_county text,
  add column if not exists verification_status text not null default 'unverified',
  add column if not exists share_code text,
  add column if not exists version integer not null default 1;

create index if not exists saved_estimates_share_code_idx
  on saved_estimates(share_code)
  where share_code is not null;

alter table saved_estimates
  drop constraint if exists saved_estimates_verification_status_check;

alter table saved_estimates
  add constraint saved_estimates_verification_status_check
  check (verification_status in ('unverified','verified','corrected'));

alter table saved_estimates
  drop constraint if exists saved_estimates_total_cents_consistency;

alter table saved_estimates
  add constraint saved_estimates_total_cents_consistency
  check (
    (
      subtotal_cents is null
      and tax_cents is null
      and total_cents is null
    )
    or total_cents = subtotal_cents + tax_cents
  );

alter table saved_estimates enable row level security;
alter table saved_estimates force row level security;

-- Trusted server routes still use service_role and bypass RLS.
-- This policy protects any future direct authenticated access path.
drop policy if exists "Users can view own estimates"   on saved_estimates;
drop policy if exists "Users can insert own estimates" on saved_estimates;
drop policy if exists "Users can update own estimates" on saved_estimates;
drop policy if exists "Users can delete own estimates" on saved_estimates;
drop policy if exists "Users can only see their own estimates" on saved_estimates;

revoke all on saved_estimates from anon;
grant select, insert, update, delete on saved_estimates to authenticated;

create policy "Users can only see their own estimates"
  on saved_estimates
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── Business Profiles (one per user, for PDF branding) ────────
create table if not exists business_profiles (
  user_id          uuid references public.users(id) primary key,
  business_name    text,
  business_phone   text,
  business_email   text,
  business_address text,
  business_website text,
  logo_url         text,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

alter table business_profiles enable row level security;
alter table business_profiles force row level security;

-- No RLS policies — auth.uid() is always NULL with NextAuth.
-- All access is via server-side API routes using service_role key.
drop policy if exists "Users can view their own profile"   on business_profiles;
drop policy if exists "Users can insert their own profile" on business_profiles;
drop policy if exists "Users can update their own profile" on business_profiles;

revoke all on business_profiles from anon;
revoke all on business_profiles from authenticated;

-- ─── User Materials / Price Book ──────────────────────────────
create table if not exists user_materials (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references public.users(id) on delete cascade,
  material_name text not null,
  category      text,
  unit_type     text,
  unit_cost     decimal(10,4) not null default 0,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

alter table user_materials enable row level security;
alter table user_materials force row level security;

-- No RLS policies — auth.uid() is always NULL with NextAuth.
-- All access is via server-side API routes using service_role key.
drop policy if exists "Users can manage own materials"  on user_materials;
drop policy if exists "Users can view own materials"    on user_materials;
drop policy if exists "Users can insert own materials"  on user_materials;
drop policy if exists "Users can update own materials"  on user_materials;
drop policy if exists "Users can delete own materials"  on user_materials;

revoke all on user_materials from anon;
revoke all on user_materials from authenticated;

-- ─── Email Signups ─────────────────────────────────────────────
create table if not exists email_signups (
  id         uuid primary key default uuid_generate_v4(),
  email      text unique not null,
  source     text default 'splash',
  created_at timestamptz not null default now()
);

alter table email_signups
  add column if not exists marketing_consent boolean not null default false,
  add column if not exists consent_text text,
  add column if not exists consent_version text,
  add column if not exists consent_recorded_at timestamptz,
  add column if not exists ip_address text,
  add column if not exists user_agent text,
  add column if not exists unsubscribed_at timestamptz;

alter table email_signups enable row level security;
alter table email_signups force row level security;
drop policy if exists "Anyone can sign up" on email_signups;
create policy "Anyone can sign up"
  on email_signups for insert with check (true);

revoke all on email_signups from anon;
revoke all on email_signups from authenticated;
grant insert on email_signups to anon;
-- anon can insert (sign up) but cannot read the list

-- ─── Triggers: auto-update updated_at ─────────────────────────
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists saved_estimates_updated_at  on saved_estimates;
drop trigger if exists business_profiles_updated_at on business_profiles;
drop trigger if exists user_materials_updated_at    on user_materials;

create trigger saved_estimates_updated_at
  before update on saved_estimates
  for each row execute function update_updated_at();

create trigger business_profiles_updated_at
  before update on business_profiles
  for each row execute function update_updated_at();

create trigger user_materials_updated_at
  before update on user_materials
  for each row execute function update_updated_at();

-- ─── Indexes ───────────────────────────────────────────────────
create index if not exists saved_estimates_user_id_idx  on saved_estimates(user_id);
create index if not exists saved_estimates_created_at_idx on saved_estimates(created_at desc);
create index if not exists saved_estimates_status_idx   on saved_estimates(status);
create index if not exists user_materials_user_id_idx   on user_materials(user_id);

-- =====================================================================
-- Multi-tenant CRM foundation (organizations, price book, leads, projects)
-- =====================================================================

-- Organizations (tenants)
create table if not exists organizations (
  id                  uuid primary key default uuid_generate_v4(),
  name                text not null,
  slug                text unique,
  plan_tier           text not null default 'free',
  timezone            text default 'America/New_York',
  billing_email       text,
  owner_user_id       uuid references public.users(id) on delete set null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

alter table organizations enable row level security;
alter table organizations force row level security;

revoke all on organizations from anon;
revoke all on organizations from authenticated;

-- Business profiles linked to organizations instead of only a single user
alter table business_profiles
  add column if not exists organization_id uuid references organizations(id) on delete cascade;

create index if not exists organizations_owner_user_id_idx on organizations(owner_user_id);

-- Centralized price book (per-organization SKUs).
create table if not exists price_book (
  id                    uuid primary key default uuid_generate_v4(),
  organization_id       uuid not null references organizations(id) on delete cascade,
  sku                   text not null,
  description           text,
  category              text,
  uom                   text not null, -- unit of measure (e.g. 'sq_ft', 'lf', 'each')
  unit_price            numeric(12,4) not null,
  waste_factor_default  numeric(5,2) not null default 0,
  active                boolean not null default true,
  last_synced_at        timestamptz,
  metadata              jsonb default '{}'::jsonb,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- Guard: table may already exist from a previous run without organization_id.
alter table price_book
  add column if not exists organization_id uuid references organizations(id) on delete cascade;

alter table price_book enable row level security;
alter table price_book force row level security;

revoke all on price_book from anon;
revoke all on price_book from authenticated;

create index if not exists price_book_org_sku_idx
  on price_book(organization_id, sku);

-- Leads table for early-funnel CRM.
create table if not exists leads (
  id                uuid primary key default uuid_generate_v4(),
  organization_id   uuid not null references organizations(id) on delete cascade,
  created_by_user_id uuid references public.users(id) on delete set null,
  client_name       text not null,
  client_email      text,
  client_phone      text,
  project_address   text,
  source            text, -- e.g. 'website', 'referral', 'yard_sign'
  interest_score    numeric(5,2),
  notes             text,
  status            text not null default 'lead', -- lead, qualified, archived
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Guard: table may already exist from a previous run without organization_id.
alter table leads
  add column if not exists organization_id uuid references organizations(id) on delete cascade;

alter table leads enable row level security;
alter table leads force row level security;

revoke all on leads from anon;
revoke all on leads from authenticated;

create index if not exists leads_org_status_idx
  on leads(organization_id, status);

-- Projects pipeline (Kanban-compatible).
-- Guard: CREATE TYPE errors if the type already exists; use DO block instead.
do $$ begin
  create type project_status as enum ('lead','quoted','won','lost','completed');
exception when duplicate_object then null;
end $$;

create table if not exists projects (
  id                 uuid primary key default uuid_generate_v4(),
  organization_id    uuid not null references organizations(id) on delete cascade,
  lead_id            uuid references leads(id) on delete set null,
  estimate_id        uuid references saved_estimates(id) on delete set null,
  name               text not null,
  status             project_status not null default 'lead',
  pipeline_value     numeric(12,2), -- expected contract value
  close_probability  numeric(5,2), -- 0-100
  start_date         date,
  end_date           date,
  last_contact_date  timestamptz,
  metadata           jsonb default '{}'::jsonb,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- Guard: table may already exist from a previous run without organization_id.
alter table projects
  add column if not exists organization_id uuid references organizations(id) on delete cascade;

alter table projects enable row level security;
alter table projects force row level security;

revoke all on projects from anon;
revoke all on projects from authenticated;

create index if not exists projects_org_status_idx
  on projects(organization_id, status);

-- Takeoff measurements captured from digital takeoff tools.
create table if not exists takeoff_measurements (
  id                uuid primary key default uuid_generate_v4(),
  organization_id   uuid not null references organizations(id) on delete cascade,
  project_id        uuid references projects(id) on delete cascade,
  drawing_name      text,
  measurement_type  text not null, -- 'polyline', 'polygon', 'counter'
  unit              text not null, -- 'ft', 'sq_ft', 'count', etc.
  value             numeric(14,4) not null,
  raw_points        jsonb not null, -- array of points used for reconstruction
  label             text,
  metadata          jsonb default '{}'::jsonb,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Guard: table may already exist from a previous run without organization_id.
alter table takeoff_measurements
  add column if not exists organization_id uuid references organizations(id) on delete cascade;

alter table takeoff_measurements enable row level security;
alter table takeoff_measurements force row level security;

revoke all on takeoff_measurements from anon;
revoke all on takeoff_measurements from authenticated;

create index if not exists takeoff_measurements_project_idx
  on takeoff_measurements(project_id);

-- ─── Storage bucket policy (run after creating bucket in dashboard)
-- Bucket name: business_logos (PUBLIC)
-- Bucket name: estimate_pdfs  (PRIVATE — user-scoped)
-- These bucket policies are set in the Supabase dashboard Storage UI.
-- Public bucket = anyone can read, authenticated users can write their own files.
