-- ============================================================
-- REQUIRED: Auth.js Supabase Adapter — next_auth schema
-- Run this ONCE in Supabase SQL Editor before deploying auth.
--
-- WHY: @auth/supabase-adapter v1.x hardcodes schema "next_auth".
-- All auth adapter tables (users/accounts/sessions/verification_tokens)
-- must live in next_auth, not public.
--
-- The trigger at the bottom syncs next_auth.users → public.users
-- so existing app tables (saved_estimates, business_profiles,
-- user_materials) and their foreign keys continue to work unchanged.
-- ============================================================

create extension if not exists "uuid-ossp";

-- ─── 1. Create schema and grant service_role full access ──────
create schema if not exists next_auth;

grant usage          on schema next_auth to service_role;
grant all privileges on schema next_auth to service_role;
alter default privileges in schema next_auth
  grant all on tables    to service_role;
alter default privileges in schema next_auth
  grant all on sequences to service_role;

-- ─── 2. Auth.js adapter tables ────────────────────────────────
create table if not exists next_auth.users (
  id              uuid not null default uuid_generate_v4() primary key,
  name            text,
  email           text unique,
  "emailVerified" timestamptz,
  image           text
);

create table if not exists next_auth.accounts (
  id                  uuid not null default uuid_generate_v4() primary key,
  type                text not null,
  provider            text not null,
  "providerAccountId" text not null,
  refresh_token       text,
  access_token        text,
  expires_at          bigint,
  token_type          text,
  scope               text,
  id_token            text,
  session_state       text,
  "userId"            uuid references next_auth.users(id) on delete cascade,
  unique (provider, "providerAccountId")
);

create table if not exists next_auth.sessions (
  id             uuid not null default uuid_generate_v4() primary key,
  "userId"       uuid not null references next_auth.users(id) on delete cascade,
  expires        timestamptz not null,
  "sessionToken" text not null unique
);

create table if not exists next_auth.verification_tokens (
  identifier text not null,
  expires    timestamptz not null,
  token      text not null,
  primary key (identifier, token)
);

-- Lock down next_auth tables — only service_role may touch them
revoke all on next_auth.users               from anon, authenticated;
revoke all on next_auth.accounts            from anon, authenticated;
revoke all on next_auth.sessions            from anon, authenticated;
revoke all on next_auth.verification_tokens from anon, authenticated;

-- ─── 3. Sync trigger: next_auth.users → public.users ─────────
-- Keeps public.users in sync so saved_estimates / business_profiles
-- / user_materials foreign keys continue to work without changes.
create or replace function next_auth.sync_user_to_public()
returns trigger as $$
begin
  if tg_op = 'DELETE' then
    delete from public.users where id = old.id;
    return old;
  end if;

  insert into public.users (id, name, email, "emailVerified", image)
  values (new.id, new.name, new.email, new."emailVerified", new.image)
  on conflict (id) do update
    set name            = excluded.name,
        email           = excluded.email,
        "emailVerified" = excluded."emailVerified",
        image           = excluded.image;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists sync_user_to_public on next_auth.users;
create trigger sync_user_to_public
  after insert or update or delete on next_auth.users
  for each row execute function next_auth.sync_user_to_public();
