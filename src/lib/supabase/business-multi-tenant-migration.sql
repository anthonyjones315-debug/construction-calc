-- ============================================================
-- Multi-User Business migration
-- Run AFTER nextauth-schema-fix.sql and schema.sql
-- ============================================================

create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────────────────────────
-- 1) Core business tables
-- ─────────────────────────────────────────────────────────────

create table if not exists businesses (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  owner_id   uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists memberships (
  id          uuid primary key default uuid_generate_v4(),
  business_id uuid not null references businesses(id) on delete cascade,
  user_id     uuid not null references public.users(id) on delete cascade,
  role        text not null check (role in ('owner', 'admin', 'editor')),
  created_at  timestamptz not null default now(),
  unique (business_id, user_id)
);

update memberships
set role = 'editor'
where role = 'member';

alter table memberships
  drop constraint if exists memberships_role_check;

alter table memberships
  add constraint memberships_role_check
  check (role in ('owner', 'admin', 'editor'));

create index if not exists businesses_owner_id_idx on businesses(owner_id);
create index if not exists memberships_business_id_idx on memberships(business_id);
create index if not exists memberships_user_id_idx on memberships(user_id);
create index if not exists memberships_business_user_role_idx
  on memberships(business_id, user_id, role);

-- ─────────────────────────────────────────────────────────────
-- 2) Add business_id to tenant-scoped tables
-- ─────────────────────────────────────────────────────────────

alter table saved_estimates
  add column if not exists business_id uuid references businesses(id) on delete cascade;

alter table user_materials
  add column if not exists business_id uuid references businesses(id) on delete cascade;

alter table business_profiles
  add column if not exists business_id uuid references businesses(id) on delete cascade;

-- Backfill: one default business per user (owner)
insert into businesses (id, name, owner_id)
select
  uuid_generate_v4(),
  coalesce(nullif(trim(u.name), ''), 'My Business'),
  u.id
from public.users u
where not exists (
  select 1
  from businesses b
  where b.owner_id = u.id
);

-- Backfill memberships for owners
insert into memberships (business_id, user_id, role)
select b.id, b.owner_id, 'owner'
from businesses b
where not exists (
  select 1
  from memberships m
  where m.business_id = b.id
    and m.user_id = b.owner_id
);

-- Backfill business_id on existing records by matching legacy user_id
update saved_estimates se
set business_id = b.id
from businesses b
where b.owner_id = se.user_id
  and se.business_id is null;

update user_materials um
set business_id = b.id
from businesses b
where b.owner_id = um.user_id
  and um.business_id is null;

update business_profiles bp
set business_id = b.id
from businesses b
where b.owner_id = bp.user_id
  and bp.business_id is null;

-- Enforce non-null after backfill
alter table saved_estimates
  alter column business_id set not null;

alter table user_materials
  alter column business_id set not null;

alter table business_profiles
  alter column business_id set not null;

-- One profile per business
create unique index if not exists business_profiles_business_id_uidx
  on business_profiles(business_id);

create index if not exists saved_estimates_business_id_idx
  on saved_estimates(business_id);
create index if not exists user_materials_business_id_idx
  on user_materials(business_id);

-- ─────────────────────────────────────────────────────────────
-- 3) RLS helper predicates
-- ─────────────────────────────────────────────────────────────

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

-- ─────────────────────────────────────────────────────────────
-- 4) Enable/refresh RLS policies
-- ─────────────────────────────────────────────────────────────

alter table businesses enable row level security;
alter table businesses force row level security;

alter table memberships enable row level security;
alter table memberships force row level security;

alter table saved_estimates enable row level security;
alter table saved_estimates force row level security;

alter table user_materials enable row level security;
alter table user_materials force row level security;

alter table business_profiles enable row level security;
alter table business_profiles force row level security;

-- Clean up previous policy names (idempotent)
drop policy if exists "Users can view own estimates" on saved_estimates;
drop policy if exists "Users can insert own estimates" on saved_estimates;
drop policy if exists "Users can update own estimates" on saved_estimates;
drop policy if exists "Users can delete own estimates" on saved_estimates;

drop policy if exists "Users can manage own materials" on user_materials;
drop policy if exists "Users can view own materials" on user_materials;
drop policy if exists "Users can insert own materials" on user_materials;
drop policy if exists "Users can update own materials" on user_materials;
drop policy if exists "Users can delete own materials" on user_materials;

drop policy if exists "Users can view their own profile" on business_profiles;
drop policy if exists "Users can insert their own profile" on business_profiles;
drop policy if exists "Users can update their own profile" on business_profiles;

drop policy if exists "businesses_select_member" on businesses;
drop policy if exists "businesses_insert_owner_only" on businesses;
drop policy if exists "businesses_update_owner_only" on businesses;
drop policy if exists "businesses_delete_owner_only" on businesses;

drop policy if exists "memberships_select_member" on memberships;
drop policy if exists "memberships_insert_owner_only" on memberships;
drop policy if exists "memberships_update_owner_only" on memberships;
drop policy if exists "memberships_delete_owner_only" on memberships;

drop policy if exists "saved_estimates_select_member" on saved_estimates;
drop policy if exists "saved_estimates_insert_member" on saved_estimates;
drop policy if exists "saved_estimates_update_owner_or_creator" on saved_estimates;
drop policy if exists "saved_estimates_delete_owner_or_creator" on saved_estimates;

drop policy if exists "user_materials_select_member" on user_materials;
drop policy if exists "user_materials_insert_member" on user_materials;
drop policy if exists "user_materials_update_owner_only" on user_materials;
drop policy if exists "user_materials_delete_owner_only" on user_materials;

drop policy if exists "business_profiles_select_member" on business_profiles;
drop policy if exists "business_profiles_insert_owner_only" on business_profiles;
drop policy if exists "business_profiles_update_owner_only" on business_profiles;
drop policy if exists "business_profiles_delete_owner_only" on business_profiles;

-- Businesses
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

-- Memberships
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

-- saved_estimates (business members can view/update, only owners/admins delete)
create policy "saved_estimates_select_member"
  on saved_estimates
  for select
  using (is_business_member(business_id));

create policy "saved_estimates_insert_member"
  on saved_estimates
  for insert
  with check (
    is_business_member(business_id)
    and ((select auth.uid()) = user_id)
  );

create policy "saved_estimates_update_owner_or_creator"
  on saved_estimates
  for update
  using (has_business_role(business_id, array['owner', 'admin', 'editor']))
  with check (has_business_role(business_id, array['owner', 'admin', 'editor']));

create policy "saved_estimates_delete_owner_or_creator"
  on saved_estimates
  for delete
  using (has_business_role(business_id, array['owner', 'admin']));

-- user_materials (members can view/insert/update; owners/admins delete)
create policy "user_materials_select_member"
  on user_materials
  for select
  using (is_business_member(business_id));

create policy "user_materials_insert_member"
  on user_materials
  for insert
  with check (
    is_business_member(business_id)
    and ((select auth.uid()) = user_id)
  );

create policy "user_materials_update_owner_only"
  on user_materials
  for update
  using (has_business_role(business_id, array['owner', 'admin', 'editor']))
  with check (has_business_role(business_id, array['owner', 'admin', 'editor']));

create policy "user_materials_delete_owner_only"
  on user_materials
  for delete
  using (has_business_role(business_id, array['owner', 'admin']));

-- business_profiles (members can read; owners/admins manage)
create policy "business_profiles_select_member"
  on business_profiles
  for select
  using (is_business_member(business_id));

create policy "business_profiles_insert_owner_only"
  on business_profiles
  for insert
  with check (
    has_business_role(business_id, array['owner', 'admin'])
    and ((select auth.uid()) = user_id)
  );

create policy "business_profiles_update_owner_only"
  on business_profiles
  for update
  using (has_business_role(business_id, array['owner', 'admin']))
  with check (has_business_role(business_id, array['owner', 'admin']));

create policy "business_profiles_delete_owner_only"
  on business_profiles
  for delete
  using (has_business_role(business_id, array['owner', 'admin']));

-- Ensure app roles can hit policies
grant usage on schema public to authenticated;
grant select, insert, update, delete on businesses to authenticated;
grant select, insert, update, delete on memberships to authenticated;
grant select, insert, update, delete on saved_estimates to authenticated;
grant select, insert, update, delete on user_materials to authenticated;
grant select, insert, update, delete on business_profiles to authenticated;
