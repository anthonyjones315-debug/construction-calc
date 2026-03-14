-- ============================================================
-- Build Calc Pro — NextAuth/Auth.js SAFE schema alignment
-- No DROP TABLE, no CASCADE
-- Re-runnable migration for existing Supabase projects
-- ============================================================

begin;

create extension if not exists "uuid-ossp";

-- -----------------------------------------------------------------
-- 1) Ensure base tables exist
-- -----------------------------------------------------------------
create table if not exists users (
  id              uuid primary key default uuid_generate_v4(),
  name            text,
  email           text,
  "emailVerified" timestamptz,
  image           text
);

create table if not exists accounts (
  id                  uuid default uuid_generate_v4(),
  type                text,
  provider            text,
  "providerAccountId" text,
  refresh_token       text,
  access_token        text,
  expires_at          bigint,
  token_type          text,
  scope               text,
  id_token            text,
  session_state       text,
  "userId"            uuid
);

create table if not exists sessions (
  id             uuid primary key default uuid_generate_v4(),
  "userId"       uuid,
  expires        timestamptz,
  "sessionToken" text
);

create table if not exists verification_tokens (
  identifier text,
  expires    timestamptz,
  token      text
);

-- -----------------------------------------------------------------
-- 2) Add missing columns for existing tables
-- -----------------------------------------------------------------
alter table users
  add column if not exists name text,
  add column if not exists email text,
  add column if not exists "emailVerified" timestamptz,
  add column if not exists image text;

alter table accounts
  add column if not exists id uuid default uuid_generate_v4(),
  add column if not exists type text,
  add column if not exists provider text,
  add column if not exists "providerAccountId" text,
  add column if not exists refresh_token text,
  add column if not exists access_token text,
  add column if not exists expires_at bigint,
  add column if not exists token_type text,
  add column if not exists scope text,
  add column if not exists id_token text,
  add column if not exists session_state text,
  add column if not exists "userId" uuid;

alter table sessions
  add column if not exists id uuid default uuid_generate_v4(),
  add column if not exists "userId" uuid,
  add column if not exists expires timestamptz,
  add column if not exists "sessionToken" text;

alter table verification_tokens
  add column if not exists identifier text,
  add column if not exists expires timestamptz,
  add column if not exists token text;

-- -----------------------------------------------------------------
-- 3) Backfill minimal required values where possible
-- -----------------------------------------------------------------
update accounts
set id = uuid_generate_v4()
where id is null;

update sessions
set id = uuid_generate_v4()
where id is null;

-- -----------------------------------------------------------------
-- 4) Primary keys / unique constraints (safe, conditional)
-- -----------------------------------------------------------------
do $$
begin
  if not exists (
    select 1
    from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    where t.relname = 'accounts' and c.contype = 'p'
  ) then
    alter table accounts add constraint accounts_pkey primary key (id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    where t.relname = 'verification_tokens' and c.contype = 'p'
  ) then
    alter table verification_tokens add constraint verification_tokens_pkey primary key (identifier, token);
  end if;
end $$;

create unique index if not exists users_email_key
  on users(email)
  where email is not null;

create unique index if not exists sessions_session_token_key
  on sessions("sessionToken")
  where "sessionToken" is not null;

create unique index if not exists accounts_provider_provider_account_id_key
  on accounts(provider, "providerAccountId")
  where provider is not null and "providerAccountId" is not null;

-- -----------------------------------------------------------------
-- 5) Foreign keys (safe add, no cascade drops)
-- -----------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'fk_accounts_user'
  ) then
    alter table accounts
      add constraint fk_accounts_user
      foreign key ("userId") references users(id) on delete cascade not valid;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'fk_sessions_user'
  ) then
    alter table sessions
      add constraint fk_sessions_user
      foreign key ("userId") references users(id) on delete cascade not valid;
  end if;
end $$;

-- -----------------------------------------------------------------
-- 6) Column nullability/default alignment (best-effort, non-destructive)
-- -----------------------------------------------------------------
alter table accounts alter column id set default uuid_generate_v4();
alter table sessions alter column id set default uuid_generate_v4();

-- Set NOT NULL only when no nulls exist, to avoid migration failure

do $$
begin
  if not exists (select 1 from accounts where type is null) then
    alter table accounts alter column type set not null;
  end if;
  if not exists (select 1 from accounts where provider is null) then
    alter table accounts alter column provider set not null;
  end if;
  if not exists (select 1 from accounts where "providerAccountId" is null) then
    alter table accounts alter column "providerAccountId" set not null;
  end if;
end $$;

do $$
begin
  if not exists (select 1 from sessions where "userId" is null) then
    alter table sessions alter column "userId" set not null;
  end if;
  if not exists (select 1 from sessions where expires is null) then
    alter table sessions alter column expires set not null;
  end if;
  if not exists (select 1 from sessions where "sessionToken" is null) then
    alter table sessions alter column "sessionToken" set not null;
  end if;
end $$;

do $$
begin
  if not exists (select 1 from verification_tokens where identifier is null) then
    alter table verification_tokens alter column identifier set not null;
  end if;
  if not exists (select 1 from verification_tokens where expires is null) then
    alter table verification_tokens alter column expires set not null;
  end if;
  if not exists (select 1 from verification_tokens where token is null) then
    alter table verification_tokens alter column token set not null;
  end if;
end $$;

-- -----------------------------------------------------------------
-- 7) Access hardening to mirror existing app approach
-- -----------------------------------------------------------------
revoke all on verification_tokens from anon, authenticated;
revoke all on accounts from anon, authenticated;
revoke all on sessions from anon, authenticated;
revoke all on users from anon, authenticated;

commit;
