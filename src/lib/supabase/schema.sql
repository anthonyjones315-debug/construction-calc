-- ============================================================
-- proconstructioncalc.com — Full Supabase Schema v2
-- Run ENTIRE file in Supabase SQL Editor
--
-- PREREQUISITE: Run nextauth-schema-fix.sql FIRST.
-- Auth.js adapter tables (users/accounts/sessions/verification_tokens)
-- live in the "next_auth" schema, not public.
-- That file also installs a trigger that syncs next_auth.users → public.users
-- so the foreign keys below continue to work.
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
  image           text
);

revoke all on public.users from anon, authenticated;

-- ─── Saved Estimates (with CRM fields) ────────────────────────
create table if not exists saved_estimates (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references users(id) on delete cascade,
  name             text not null default 'Untitled Estimate',
  calculator_id    text not null,
  inputs           jsonb not null default '{}',
  results          jsonb not null default '[]',
  budget_items     jsonb default null,
  total_cost       decimal(10,2) default null,
  -- CRM fields (from schema screenshot)
  client_name      text,
  job_site_address text,
  status           text default 'Draft' check (status in ('Draft','Sent','Approved','Lost')),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table saved_estimates enable row level security;
alter table saved_estimates force row level security;

drop policy if exists "Users can view own estimates"   on saved_estimates;
drop policy if exists "Users can insert own estimates" on saved_estimates;
drop policy if exists "Users can update own estimates" on saved_estimates;
drop policy if exists "Users can delete own estimates" on saved_estimates;

create policy "Users can view own estimates"
  on saved_estimates for select using (user_id = auth.uid()::uuid);
create policy "Users can insert own estimates"
  on saved_estimates for insert with check (user_id = auth.uid()::uuid);
create policy "Users can update own estimates"
  on saved_estimates for update using (user_id = auth.uid()::uuid) with check (user_id = auth.uid()::uuid);
create policy "Users can delete own estimates"
  on saved_estimates for delete using (user_id = auth.uid()::uuid);

revoke all on saved_estimates from anon;
revoke all on saved_estimates from authenticated;
grant select, insert, update, delete on saved_estimates to authenticated;

-- ─── Business Profiles (one per user, for PDF branding) ────────
create table if not exists business_profiles (
  user_id          uuid references users(id) primary key,
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

drop policy if exists "Users can view their own profile"   on business_profiles;
drop policy if exists "Users can insert their own profile" on business_profiles;
drop policy if exists "Users can update their own profile" on business_profiles;

create policy "Users can view their own profile"
  on business_profiles for select using (auth.uid()::uuid = user_id);
create policy "Users can insert their own profile"
  on business_profiles for insert with check (auth.uid()::uuid = user_id);
create policy "Users can update their own profile"
  on business_profiles for update using (auth.uid()::uuid = user_id) with check (auth.uid()::uuid = user_id);

revoke all on business_profiles from anon;
revoke all on business_profiles from authenticated;
grant select, insert, update on business_profiles to authenticated;

-- ─── User Materials / Price Book ──────────────────────────────
create table if not exists user_materials (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references users(id) on delete cascade,
  material_name text not null,
  category      text,
  unit_type     text,
  unit_cost     decimal(10,4) not null default 0,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

alter table user_materials enable row level security;
alter table user_materials force row level security;

drop policy if exists "Users can manage own materials" on user_materials;
create policy "Users can view own materials"
  on user_materials for select using (auth.uid()::uuid = user_id);
create policy "Users can insert own materials"
  on user_materials for insert with check (auth.uid()::uuid = user_id);
create policy "Users can update own materials"
  on user_materials for update using (auth.uid()::uuid = user_id) with check (auth.uid()::uuid = user_id);
create policy "Users can delete own materials"
  on user_materials for delete using (auth.uid()::uuid = user_id);

revoke all on user_materials from anon;
revoke all on user_materials from authenticated;
grant select, insert, update, delete on user_materials to authenticated;

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

-- ─── Storage bucket policy (run after creating bucket in dashboard)
-- Bucket name: business_logos (PUBLIC)
-- Bucket name: estimate_pdfs  (PRIVATE — user-scoped)
-- These bucket policies are set in the Supabase dashboard Storage UI.
-- Public bucket = anyone can read, authenticated users can write their own files.
