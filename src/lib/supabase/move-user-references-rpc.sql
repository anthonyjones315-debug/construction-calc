-- ============================================================
-- Atomic reference migration for public user reconciliation
-- Run AFTER schema.sql and business-multi-tenant-migration.sql
-- ============================================================

create or replace function public.move_user_references(
  from_user_id uuid,
  to_user_id uuid
)
returns void
language plpgsql
as $$
begin
  update saved_estimates
  set user_id = to_user_id
  where user_id = from_user_id;

  update business_profiles
  set user_id = to_user_id
  where user_id = from_user_id;

  update user_materials
  set user_id = to_user_id
  where user_id = from_user_id;

  update businesses
  set owner_id = to_user_id
  where owner_id = from_user_id;

  update memberships
  set user_id = to_user_id
  where user_id = from_user_id;

  update organizations
  set owner_user_id = to_user_id
  where owner_user_id = from_user_id;

  update leads
  set created_by_user_id = to_user_id
  where created_by_user_id = from_user_id;
end;
$$;
