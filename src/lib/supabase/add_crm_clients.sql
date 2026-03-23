-- ============================================================
-- proconstructioncalc.com — CRM Clients Migration
-- Run ENTIRE file in Supabase SQL Editor
-- ============================================================

create extension if not exists "uuid-ossp";

-- ─── Clients (CRM Core) ───────────────────────────────────────
create table if not exists clients (
  id               uuid primary key default uuid_generate_v4(),
  user_id          text not null references public.users(id) on delete cascade,
  business_id      text, -- For multi-tenant support if applicable
  name             text not null,
  email            text,
  phone            text,
  address          text,
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Note: In this system, user_materials/business_profiles bypass RLS because auth.uid() is null in NextAuth.
-- BUT, saved_estimates has RLS and uses auth.uid() = user_id for authenticated access.
-- We will follow saved_estimates' lead for clients.

alter table clients enable row level security;
alter table clients force row level security;

drop policy if exists "Users can manage their own clients" on clients;
drop policy if exists "Users can only see their own clients" on clients;

revoke all on clients from anon;
grant select, insert, update, delete on clients to authenticated;

create policy "Users can only see their own clients"
  on clients
  for all
  to authenticated
  using (auth.uid()::text = user_id)
  with check (auth.uid()::text = user_id);

-- ─── Triggers: auto-update updated_at ─────────────────────────
drop trigger if exists clients_updated_at on clients;

create trigger clients_updated_at
  before update on clients
  for each row execute function update_updated_at();

-- ─── Link Estimates to Clients ─────────────────────────────────
alter table saved_estimates
  add column if not exists client_id uuid references clients(id) on delete set null;

-- ─── Indexes ───────────────────────────────────────────────────
create index if not exists clients_user_id_idx on clients(user_id);
create index if not exists clients_business_id_idx on clients(business_id);
create index if not exists saved_estimates_client_id_idx on saved_estimates(client_id);
