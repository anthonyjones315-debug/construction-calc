-- ============================================================
-- proconstructioncalc.com — Security Hardening Master Script
-- Run ONCE in Supabase SQL Editor
-- Safe to re-run (all ops are idempotent)
-- ============================================================


-- ─────────────────────────────────────────────────────────────
-- 1. FIX FOREIGN KEY CONSTRAINTS
--    saved_estimates and business_profiles still point to auth.users.
--    Drop and re-add pointing to public.users.
-- ─────────────────────────────────────────────────────────────

alter table saved_estimates
  drop constraint if exists saved_estimates_user_id_fkey;
alter table saved_estimates
  add constraint saved_estimates_user_id_fkey
  foreign key (user_id) references public.users(id) on delete cascade;

alter table business_profiles
  drop constraint if exists business_profiles_user_id_fkey;
alter table business_profiles
  add constraint business_profiles_user_id_fkey
  foreign key (user_id) references public.users(id) on delete cascade;

-- Verify — both rows should show "public.users"
select conname, confrelid::regclass as referenced_table
from pg_constraint
where conrelid in (
  'saved_estimates'::regclass,
  'business_profiles'::regclass,
  'user_materials'::regclass
)
and contype = 'f';


-- ─────────────────────────────────────────────────────────────
-- 2. FIX RLS POLICIES
--    Current policies use auth.uid() which always returns NULL
--    with NextAuth. They look like security but do nothing.
--    Replace with DENY ALL direct client access.
--    Real protection = API route session checks + service role key.
-- ─────────────────────────────────────────────────────────────

-- saved_estimates
drop policy if exists "Users can view own estimates"   on saved_estimates;
drop policy if exists "Users can insert own estimates" on saved_estimates;
drop policy if exists "Users can update own estimates" on saved_estimates;
drop policy if exists "Users can delete own estimates" on saved_estimates;

revoke all on saved_estimates from anon;
revoke all on saved_estimates from authenticated;
-- No grant back — only service_role (API routes) can touch this table

-- business_profiles
drop policy if exists "Users can view their own profile"   on business_profiles;
drop policy if exists "Users can insert their own profile" on business_profiles;
drop policy if exists "Users can update their own profile" on business_profiles;

revoke all on business_profiles from anon;
revoke all on business_profiles from authenticated;

-- user_materials
drop policy if exists "Users can view own materials"   on user_materials;
drop policy if exists "Users can insert own materials" on user_materials;
drop policy if exists "Users can update own materials" on user_materials;
drop policy if exists "Users can delete own materials" on user_materials;
drop policy if exists "Users can manage own materials" on user_materials;

revoke all on user_materials from anon;
revoke all on user_materials from authenticated;

-- RLS stays ENABLED + FORCED on all tables as a hard backstop
-- (already set in schema, confirming here)
alter table saved_estimates   enable row level security;
alter table saved_estimates   force row level security;
alter table business_profiles enable row level security;
alter table business_profiles force row level security;
alter table user_materials    enable row level security;
alter table user_materials    force row level security;


-- ─────────────────────────────────────────────────────────────
-- 3. FIX EMAIL SIGNUPS
--    Policy says "Anyone can sign up" but anon was revoked,
--    so the policy was blocked before it could run.
--    Grant anon INSERT so the sign-up form actually works.
-- ─────────────────────────────────────────────────────────────

revoke all on email_signups from anon;
revoke all on email_signups from authenticated;

grant insert on email_signups to anon;

-- Policy already exists but recreate cleanly
drop policy if exists "Anyone can sign up" on email_signups;
create policy "Anyone can sign up"
  on email_signups for insert with check (true);

-- Nobody can read the list (not even authenticated) — only service_role
alter table email_signups enable row level security;
alter table email_signups force row level security;


-- ─────────────────────────────────────────────────────────────
-- 4. FIX NEXT_AUTH → PUBLIC.USERS SYNC TRIGGER
--    Add DELETE handling so deleting a next_auth user also
--    removes the public.users row and cascades to their data.
-- ─────────────────────────────────────────────────────────────

create or replace function next_auth.sync_user_to_public()
returns trigger language plpgsql security definer as $$
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
$$;

-- Drop and recreate trigger to fire on DELETE too
drop trigger if exists on_next_auth_user_created on next_auth.users;
drop trigger if exists on_next_auth_user_synced   on next_auth.users;

create trigger on_next_auth_user_synced
  after insert or update or delete on next_auth.users
  for each row execute function next_auth.sync_user_to_public();


-- ─────────────────────────────────────────────────────────────
-- 5. LOCK DOWN next_auth SCHEMA
--    Anon and authenticated roles should never see these tables.
-- ─────────────────────────────────────────────────────────────

revoke all on next_auth.users               from anon, authenticated;
revoke all on next_auth.accounts            from anon, authenticated;
revoke all on next_auth.sessions            from anon, authenticated;
revoke all on next_auth.verification_tokens from anon, authenticated;


-- ─────────────────────────────────────────────────────────────
-- 6. LOCK DOWN public.users
--    Already revoked in schema, confirming here.
--    Users can only be written via ensurePublicUser (service role).
-- ─────────────────────────────────────────────────────────────

revoke all on public.users from anon;
revoke all on public.users from authenticated;


-- ─────────────────────────────────────────────────────────────
-- 7. VERIFY
-- ─────────────────────────────────────────────────────────────

-- Should show all 3 tables pointing to public.users
select conname, conrelid::regclass as "table", confrelid::regclass as referenced_table
from pg_constraint
where conrelid in (
  'saved_estimates'::regclass,
  'business_profiles'::regclass,
  'user_materials'::regclass
)
and contype = 'f'
order by conrelid::regclass::text;

-- Should show no rows for anon/authenticated on data tables
select table_name, grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name in ('saved_estimates','business_profiles','user_materials','public_users')
  and grantee in ('anon','authenticated')
order by table_name, grantee;

-- Should show anon INSERT only on email_signups
select table_name, grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name = 'email_signups'
order by grantee;
