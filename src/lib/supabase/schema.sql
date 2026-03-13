-- ============================================================
-- proconstructioncalc.com — Supabase Schema
-- Run this in your Supabase SQL editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── Saved Estimates ─────────────────────────────────────────────────────────
create table if not exists saved_estimates (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null default 'Untitled Estimate',
  calculator_id text not null,
  inputs      jsonb not null default '{}',
  results     jsonb not null default '[]',
  budget_items jsonb default null,
  total_cost  decimal(10,2) default null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- RLS: users can only see their own estimates
alter table saved_estimates enable row level security;

create policy "Users can view own estimates"
  on saved_estimates for select
  using (auth.uid() = user_id);

create policy "Users can insert own estimates"
  on saved_estimates for insert
  with check (auth.uid() = user_id);

create policy "Users can update own estimates"
  on saved_estimates for update
  using (auth.uid() = user_id);

create policy "Users can delete own estimates"
  on saved_estimates for delete
  using (auth.uid() = user_id);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger saved_estimates_updated_at
  before update on saved_estimates
  for each row execute function update_updated_at();

-- Index for fast user lookups
create index if not exists saved_estimates_user_id_idx
  on saved_estimates(user_id);

-- ─── Email Signups (beta list) ────────────────────────────────────────────────
create table if not exists email_signups (
  id         uuid primary key default uuid_generate_v4(),
  email      text unique not null,
  source     text default 'splash',
  created_at timestamptz not null default now()
);

alter table email_signups enable row level security;

-- Anyone can insert (public signup), only service role can read
create policy "Anyone can sign up"
  on email_signups for insert
  with check (true);
