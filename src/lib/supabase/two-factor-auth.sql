-- Email 2FA schema additions for Pro Construction Calc
-- Run in Supabase SQL editor.

alter table public.users
  add column if not exists two_factor_enabled boolean not null default false;

create table if not exists public.two_factor_tokens (
  id uuid primary key default uuid_generate_v4(),
  email text not null,
  token text not null,
  expires timestamptz not null
);

create index if not exists two_factor_tokens_email_idx
  on public.two_factor_tokens(email);

create index if not exists two_factor_tokens_expires_idx
  on public.two_factor_tokens(expires);

revoke all on public.two_factor_tokens from anon, authenticated;
