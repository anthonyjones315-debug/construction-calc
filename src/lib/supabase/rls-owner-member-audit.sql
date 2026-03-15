-- ============================================================
-- Owner/Member RLS Audit Patch
-- Run after business-multi-tenant-migration.sql
-- ============================================================

-- 1) Normalize role model to owner/member.
update memberships
set role = 'member'
where role in ('admin', 'editor');

alter table memberships
  drop constraint if exists memberships_role_check;

alter table memberships
  add constraint memberships_role_check
  check (role in ('owner', 'member'));

-- 2) Optional schema support for Business Settings screen.
alter table business_profiles
  add column if not exists business_tax_id text;

-- 3) Businesses RLS hardening: UPDATE allowed only for business owner.
drop policy if exists "businesses_update_owner_only" on businesses;

create policy "businesses_update_owner_only"
  on businesses
  for update
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

-- 4) Memberships RLS: owner can manage members, members are read-only.
drop policy if exists "memberships_select_member" on memberships;
drop policy if exists "memberships_insert_owner_only" on memberships;
drop policy if exists "memberships_update_owner_only" on memberships;
drop policy if exists "memberships_delete_owner_only" on memberships;

create policy "memberships_select_member"
  on memberships
  for select
  using (is_business_member(business_id));

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
