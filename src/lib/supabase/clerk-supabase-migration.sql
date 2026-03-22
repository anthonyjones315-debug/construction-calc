-- ============================================================
-- Clerk + Supabase — optional hygiene (run in Supabase SQL Editor)
--
-- App auth is Clerk; server routes use the service role and sync
-- `public.users` from application code (`ensurePublicUserRecord`) +
-- Clerk `publicMetadata.appUserId`.
--
-- This file is OPTIONAL. Do not run if you are unsure.
-- ============================================================

-- 1) Optional: map Clerk user ids in the database for ops / debugging
-- alter table public.users
--   add column if not exists clerk_user_id text unique;
--
-- Backfill from Clerk Dashboard (manual) or leave null; the app can populate
-- this column later if you extend the sync.

-- 2) Stop syncing from legacy NextAuth (next_auth.users) if you no longer
--    write to that schema.
drop trigger if exists sync_user_to_public on next_auth.users;

-- 3) (Optional) Retain next_auth tables for historical reference; drop only
--    after backup and confirming no tooling depends on them.
