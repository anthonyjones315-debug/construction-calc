-- Persist signed-in Pro Mode preference across devices.
-- Run in Supabase SQL Editor before enabling server-backed pro mode sync.

alter table public.users
  add column if not exists pro_mode_enabled boolean;
