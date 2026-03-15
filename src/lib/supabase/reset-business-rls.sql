-- ============================================================
-- RESET: Businesses + Memberships RLS (clean rebuild)
--
-- Purpose:
--   - Remove any existing conflicting policies on businesses/memberships
--   - Recreate helper functions used by RLS
--   - Recreate policies with first-owner bootstrap support
--   - Ensure grants are in place for authenticated users
--
-- Safe to run multiple times (idempotent).
-- ============================================================

begin;

-- 0) Ensure extension exists
create extension if not exists "uuid-ossp";

-- 1) Normalize role values to owner/member for current app flow
update memberships
set role = 'member'
where role in ('admin', 'editor');

alter table memberships
  drop constraint if exists memberships_role_check;

alter table memberships
  add constraint memberships_role_check
  check (role in ('owner', 'member'));

-- 2) Recreate helper predicates used by RLS
create or replace function is_business_member(target_business_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from memberships m
    where m.business_id = target_business_id
      and m.user_id = (select auth.uid())
  );
$$;

create or replace function has_business_role(
  target_business_id uuid,
  allowed_roles text[]
)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from memberships m
    where m.business_id = target_business_id
      and m.user_id = (select auth.uid())
      and m.role = any(allowed_roles)
  );
$$;

-- 3) Enable + force RLS
alter table businesses enable row level security;
alter table businesses force row level security;

alter table memberships enable row level security;
alter table memberships force row level security;

-- 4) Drop all related policy variants (from old/new migrations)
drop policy if exists "businesses_select_member" on businesses;
drop policy if exists "businesses_insert_owner_only" on businesses;
drop policy if exists "businesses_update_owner_only" on businesses;
drop policy if exists "businesses_delete_owner_only" on businesses;

drop policy if exists "memberships_select_member" on memberships;
drop policy if exists "memberships_insert_owner_only" on memberships;
drop policy if exists "memberships_update_owner_only" on memberships;
drop policy if exists "memberships_delete_owner_only" on memberships;

-- 5) Recreate businesses policies
create policy "businesses_select_member"
  on businesses
  for select
  using (is_business_member(id));

create policy "businesses_insert_owner_only"
  on businesses
  for insert
  with check (owner_id = (select auth.uid()));

create policy "businesses_update_owner_only"
  on businesses
  for update
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create policy "businesses_delete_owner_only"
  on businesses
  for delete
  using (owner_id = (select auth.uid()));

-- 6) Recreate memberships policies
create policy "memberships_select_member"
  on memberships
  for select
  using (is_business_member(business_id));

-- Important bootstrap clause:
-- Allows first owner-membership insert immediately after creating a business,
-- before any membership row exists.
create policy "memberships_insert_owner_only"
  on memberships
  for insert
  with check (
    (
      role = 'owner'
      and user_id = (select auth.uid())
      and exists (
        select 1
        from businesses b
        where b.id = business_id
          and b.owner_id = (select auth.uid())
      )
    )
    or has_business_role(business_id, array['owner'])
  );

create policy "memberships_update_owner_only"
  on memberships
  for update
  using (has_business_role(business_id, array['owner']))
  with check (has_business_role(business_id, array['owner']));

create policy "memberships_delete_owner_only"
  on memberships
  for delete
  using (has_business_role(business_id, array['owner']));

-- 7) Ensure role grants exist
grant usage on schema public to authenticated;
grant select, insert, update, delete on businesses to authenticated;
grant select, insert, update, delete on memberships to authenticated;

commit;
