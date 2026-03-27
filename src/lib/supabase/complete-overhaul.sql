-- ============================================================
-- proconstructioncalc.com — COMPLETE OVERHAUL SQL
-- Single idempotent script — run this ONE file in Supabase SQL Editor.
--
-- PREREQUISITE: Run nextauth-schema-fix.sql FIRST (one time only).
-- That file creates the next_auth schema + sync trigger.
--
-- This file replaces running schema.sql + business-multi-tenant-migration.sql
-- + add-join-code-column.sql separately. Safe to re-run at any time.
-- ============================================================

-- ─── Extensions ─────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────────────────────────
-- 1. public.users — synced from next_auth.users via trigger
-- ─────────────────────────────────────────────────────────────
create table if not exists public.users (
  id                 uuid not null default uuid_generate_v4() primary key,
  name               text,
  email              text unique,
  "emailVerified"    timestamptz,
  image              text,
  pro_mode_enabled   boolean,
  two_factor_enabled boolean not null default false
);

revoke all on public.users from anon, authenticated;

-- ─────────────────────────────────────────────────────────────
-- 2. Email 2FA tokens
-- ─────────────────────────────────────────────────────────────
create table if not exists two_factor_tokens (
  id      uuid        primary key default uuid_generate_v4(),
  email   text        not null,
  token   text        not null,
  expires timestamptz not null
);

revoke all on two_factor_tokens from anon;
revoke all on two_factor_tokens from authenticated;

create index if not exists two_factor_tokens_email_idx   on two_factor_tokens(email);
create index if not exists two_factor_tokens_expires_idx on two_factor_tokens(expires);

-- ─────────────────────────────────────────────────────────────
-- 3. Saved Estimates
-- ─────────────────────────────────────────────────────────────
create table if not exists saved_estimates (
  id                  uuid        primary key default uuid_generate_v4(),
  user_id             uuid        not null references public.users(id) on delete cascade,
  name                text        not null default 'Untitled Estimate',
  calculator_id       text        not null,
  inputs              jsonb       not null default '{}',
  results             jsonb       not null default '[]',
  budget_items        jsonb       default null,
  total_cost          decimal(10,2) default null,
  subtotal_cents      bigint,
  tax_cents           bigint,
  total_cents         bigint,
  tax_basis_points    integer,
  verified_county     text,
  verification_status text        not null default 'unverified',
  client_name         text,
  job_site_address    text,
  status              text        default 'Draft',
  share_code          text        unique,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- Idempotent column additions (safe if columns already exist)
alter table saved_estimates
  add column if not exists subtotal_cents      bigint,
  add column if not exists tax_cents           bigint,
  add column if not exists total_cents         bigint,
  add column if not exists tax_basis_points    integer,
  add column if not exists verified_county     text,
  add column if not exists verification_status text not null default 'unverified',
  add column if not exists share_code          text,
  add column if not exists client_name         text,
  add column if not exists job_site_address    text;

-- Refresh constraints (drop + recreate = idempotent)
alter table saved_estimates
  drop constraint if exists saved_estimates_verification_status_check;
alter table saved_estimates
  add constraint saved_estimates_verification_status_check
  check (verification_status in ('unverified', 'verified', 'corrected'));

alter table saved_estimates
  drop constraint if exists saved_estimates_status_check;
alter table saved_estimates
  add constraint saved_estimates_status_check
  check (status in ('Draft', 'Sent', 'Approved', 'Lost', 'PENDING', 'SIGNED'));

alter table saved_estimates
  drop constraint if exists saved_estimates_total_cents_consistency;
alter table saved_estimates
  add constraint saved_estimates_total_cents_consistency
  check (
    (subtotal_cents is null and tax_cents is null and total_cents is null)
    or total_cents = subtotal_cents + tax_cents
  );

create index if not exists saved_estimates_user_id_idx    on saved_estimates(user_id);
create index if not exists saved_estimates_created_at_idx on saved_estimates(created_at desc);
create index if not exists saved_estimates_status_idx     on saved_estimates(status);
create index if not exists saved_estimates_share_code_idx on saved_estimates(share_code)
  where share_code is not null;

alter table saved_estimates enable  row level security;
alter table saved_estimates force   row level security;

-- ─────────────────────────────────────────────────────────────
-- 4. Business Profiles
-- ─────────────────────────────────────────────────────────────
create table if not exists business_profiles (
  user_id          uuid references public.users(id) primary key,
  business_name    text,
  business_phone   text,
  business_email   text,
  business_address text,
  business_website text,
  logo_url         text,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

alter table business_profiles enable row level security;
alter table business_profiles force  row level security;

revoke all on business_profiles from anon;
revoke all on business_profiles from authenticated;

-- ─────────────────────────────────────────────────────────────
-- 5. User Materials / Per-user Price Book
-- ─────────────────────────────────────────────────────────────
create table if not exists user_materials (
  id            uuid           primary key default uuid_generate_v4(),
  user_id       uuid           not null references public.users(id) on delete cascade,
  material_name text           not null,
  category      text,
  unit_type     text,
  unit_cost     decimal(10,4)  not null default 0,
  created_at    timestamptz    default now(),
  updated_at    timestamptz    default now()
);

create index if not exists user_materials_user_id_idx on user_materials(user_id);

alter table user_materials enable row level security;
alter table user_materials force  row level security;

revoke all on user_materials from anon;
revoke all on user_materials from authenticated;

-- ─────────────────────────────────────────────────────────────
-- 6. Email Signups
-- ─────────────────────────────────────────────────────────────
create table if not exists email_signups (
  id         uuid        primary key default uuid_generate_v4(),
  email      text        unique not null,
  source     text        default 'splash',
  created_at timestamptz not null default now()
);

alter table email_signups
  add column if not exists marketing_consent    boolean     not null default false,
  add column if not exists consent_text         text,
  add column if not exists consent_version      text,
  add column if not exists consent_recorded_at  timestamptz,
  add column if not exists ip_address           text,
  add column if not exists user_agent           text,
  add column if not exists unsubscribed_at      timestamptz;

alter table email_signups enable row level security;
alter table email_signups force  row level security;

drop policy if exists "Anyone can sign up" on email_signups;
create policy "Anyone can sign up"
  on email_signups for insert to anon with check (true);

revoke all on email_signups from anon;
revoke all on email_signups from authenticated;
grant insert on email_signups to anon;

-- ─────────────────────────────────────────────────────────────
-- 7. updated_at trigger function + triggers
-- ─────────────────────────────────────────────────────────────
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists saved_estimates_updated_at  on saved_estimates;
drop trigger if exists business_profiles_updated_at on business_profiles;
drop trigger if exists user_materials_updated_at    on user_materials;

create trigger saved_estimates_updated_at
  before update on saved_estimates
  for each row execute function update_updated_at();

create trigger business_profiles_updated_at
  before update on business_profiles
  for each row execute function update_updated_at();

create trigger user_materials_updated_at
  before update on user_materials
  for each row execute function update_updated_at();

-- ─────────────────────────────────────────────────────────────
-- 8. Businesses + Memberships (multi-tenant core)
-- ─────────────────────────────────────────────────────────────
create table if not exists businesses (
  id         uuid        primary key default uuid_generate_v4(),
  name       text        not null,
  owner_id   uuid        not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- join_code & seat_limit columns (from add-join-code-column.sql)
alter table businesses
  add column if not exists join_code   text,
  add column if not exists seat_limit  integer not null default 10;

create unique index if not exists businesses_join_code_uidx
  on businesses(join_code)
  where join_code is not null;

create index if not exists businesses_owner_id_idx on businesses(owner_id);

drop trigger if exists businesses_updated_at on businesses;
create trigger businesses_updated_at
  before update on businesses
  for each row execute function update_updated_at();

-- Memberships (role check widened to include 'member')
create table if not exists memberships (
  id          uuid        primary key default uuid_generate_v4(),
  business_id uuid        not null references businesses(id) on delete cascade,
  user_id     uuid        not null references public.users(id) on delete cascade,
  role        text        not null,
  created_at  timestamptz not null default now(),
  unique (business_id, user_id)
);

-- Widen constraint to include 'member' (idempotent: drop + re-add)
alter table memberships
  drop constraint if exists memberships_role_check;
alter table memberships
  add constraint memberships_role_check
  check (role in ('owner', 'admin', 'editor', 'member'));

create index if not exists memberships_business_id_idx       on memberships(business_id);
create index if not exists memberships_user_id_idx           on memberships(user_id);
create index if not exists memberships_business_user_role_idx on memberships(business_id, user_id, role);

-- ─────────────────────────────────────────────────────────────
-- 9. Wire business_id into tenant-scoped tables
-- ─────────────────────────────────────────────────────────────
alter table saved_estimates
  add column if not exists business_id uuid references businesses(id) on delete cascade;

alter table user_materials
  add column if not exists business_id uuid references businesses(id) on delete cascade;

alter table business_profiles
  add column if not exists business_id uuid references businesses(id) on delete cascade;

-- Backfill: one default business per user who doesn't already have one
insert into businesses (id, name, owner_id)
select
  uuid_generate_v4(),
  coalesce(nullif(trim(u.name), ''), 'My Business'),
  u.id
from public.users u
where not exists (
  select 1 from businesses b where b.owner_id = u.id
);

-- Backfill owner memberships
insert into memberships (business_id, user_id, role)
select b.id, b.owner_id, 'owner'
from businesses b
where not exists (
  select 1 from memberships m
  where m.business_id = b.id and m.user_id = b.owner_id
);

-- Backfill business_id on existing data rows
update saved_estimates se
set    business_id = b.id
from   businesses b
where  b.owner_id = se.user_id
  and  se.business_id is null;

update user_materials um
set    business_id = b.id
from   businesses b
where  b.owner_id = um.user_id
  and  um.business_id is null;

update business_profiles bp
set    business_id = b.id
from   businesses b
where  b.owner_id = bp.user_id
  and  bp.business_id is null;

-- Enforce NOT NULL only if every row now has a value
-- (skipped if there are still null rows — prevents migration failure on fresh DB)
do $$ begin
  if not exists (
    select 1 from saved_estimates where business_id is null
  ) then
    alter table saved_estimates alter column business_id set not null;
  end if;

  if not exists (
    select 1 from user_materials where business_id is null
  ) then
    alter table user_materials alter column business_id set not null;
  end if;

  if not exists (
    select 1 from business_profiles where business_id is null
  ) then
    alter table business_profiles alter column business_id set not null;
  end if;
end $$;

create unique index if not exists business_profiles_business_id_uidx
  on business_profiles(business_id);

create index if not exists saved_estimates_business_id_idx on saved_estimates(business_id);
create index if not exists user_materials_business_id_idx  on user_materials(business_id);

-- ─────────────────────────────────────────────────────────────
-- 10. Organizations (multi-tenant CRM foundation)
-- ─────────────────────────────────────────────────────────────
create table if not exists organizations (
  id            uuid        primary key default uuid_generate_v4(),
  name          text        not null,
  slug          text        unique,
  plan_tier     text        not null default 'free',
  timezone      text        default 'America/New_York',
  billing_email text,
  owner_user_id uuid        references public.users(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists organizations_owner_user_id_idx on organizations(owner_user_id);

alter table organizations enable row level security;
alter table organizations force  row level security;

revoke all on organizations from anon;
revoke all on organizations from authenticated;

-- Link business_profiles → organizations
alter table business_profiles
  add column if not exists organization_id uuid references organizations(id) on delete cascade;

-- ─────────────────────────────────────────────────────────────
-- 11. Price Book (per-organization SKUs)
-- ─────────────────────────────────────────────────────────────
create table if not exists price_book (
  id                   uuid          primary key default uuid_generate_v4(),
  organization_id      uuid          not null references organizations(id) on delete cascade,
  sku                  text          not null,
  description          text,
  category             text,
  uom                  text          not null,
  unit_price           numeric(12,4) not null,
  waste_factor_default numeric(5,2)  not null default 0,
  active               boolean       not null default true,
  last_synced_at       timestamptz,
  metadata             jsonb         default '{}'::jsonb,
  created_at           timestamptz   not null default now(),
  updated_at           timestamptz   not null default now()
);

-- Guard for tables pre-existing without organization_id
alter table price_book
  add column if not exists organization_id uuid references organizations(id) on delete cascade;

create index if not exists price_book_org_sku_idx on price_book(organization_id, sku);

alter table price_book enable row level security;
alter table price_book force  row level security;

revoke all on price_book from anon;
revoke all on price_book from authenticated;

-- ─────────────────────────────────────────────────────────────
-- 12. Leads
-- ─────────────────────────────────────────────────────────────
create table if not exists leads (
  id                 uuid          primary key default uuid_generate_v4(),
  organization_id    uuid          not null references organizations(id) on delete cascade,
  created_by_user_id uuid          references public.users(id) on delete set null,
  client_name        text          not null,
  client_email       text,
  client_phone       text,
  project_address    text,
  source             text,
  interest_score     numeric(5,2),
  notes              text,
  status             text          not null default 'lead',
  created_at         timestamptz   not null default now(),
  updated_at         timestamptz   not null default now()
);

alter table leads
  add column if not exists organization_id uuid references organizations(id) on delete cascade;

create index if not exists leads_org_status_idx on leads(organization_id, status);

alter table leads enable row level security;
alter table leads force  row level security;

revoke all on leads from anon;
revoke all on leads from authenticated;

-- ─────────────────────────────────────────────────────────────
-- 13. Projects
-- ─────────────────────────────────────────────────────────────

-- Guard: CREATE TYPE fails if enum already exists
do $$ begin
  create type project_status as enum ('lead', 'quoted', 'won', 'lost', 'completed');
exception when duplicate_object then null;
end $$;

create table if not exists projects (
  id                uuid          primary key default uuid_generate_v4(),
  organization_id   uuid          not null references organizations(id) on delete cascade,
  lead_id           uuid          references leads(id) on delete set null,
  estimate_id       uuid          references saved_estimates(id) on delete set null,
  name              text          not null,
  status            project_status not null default 'lead',
  pipeline_value    numeric(12,2),
  close_probability numeric(5,2),
  start_date        date,
  end_date          date,
  last_contact_date timestamptz,
  metadata          jsonb         default '{}'::jsonb,
  created_at        timestamptz   not null default now(),
  updated_at        timestamptz   not null default now()
);

alter table projects
  add column if not exists organization_id uuid references organizations(id) on delete cascade;

create index if not exists projects_org_status_idx on projects(organization_id, status);

alter table projects enable row level security;
alter table projects force  row level security;

revoke all on projects from anon;
revoke all on projects from authenticated;

-- ─────────────────────────────────────────────────────────────
-- 14. Takeoff Measurements
-- ─────────────────────────────────────────────────────────────
create table if not exists takeoff_measurements (
  id               uuid          primary key default uuid_generate_v4(),
  organization_id  uuid          not null references organizations(id) on delete cascade,
  project_id       uuid          references projects(id) on delete cascade,
  drawing_name     text,
  measurement_type text          not null,
  unit             text          not null,
  value            numeric(14,4) not null,
  raw_points       jsonb         not null,
  label            text,
  metadata         jsonb         default '{}'::jsonb,
  created_at       timestamptz   not null default now(),
  updated_at       timestamptz   not null default now()
);

alter table takeoff_measurements
  add column if not exists organization_id uuid references organizations(id) on delete cascade;

create index if not exists takeoff_measurements_project_idx on takeoff_measurements(project_id);

alter table takeoff_measurements enable row level security;
alter table takeoff_measurements force  row level security;

revoke all on takeoff_measurements from anon;
revoke all on takeoff_measurements from authenticated;

-- ─────────────────────────────────────────────────────────────
-- 15. RLS helper functions
-- ─────────────────────────────────────────────────────────────
create or replace function is_business_member(target_business_id uuid)
returns boolean
language sql stable as $$
  select exists (
    select 1 from memberships m
    where m.business_id = target_business_id
      and m.user_id = (select auth.uid())
  );
$$;

create or replace function has_business_role(
  target_business_id uuid,
  allowed_roles      text[]
)
returns boolean
language sql stable as $$
  select exists (
    select 1 from memberships m
    where m.business_id = target_business_id
      and m.user_id = (select auth.uid())
      and m.role = any(allowed_roles)
  );
$$;

-- ─────────────────────────────────────────────────────────────
-- 16. RLS policies — businesses
-- ─────────────────────────────────────────────────────────────
alter table businesses enable row level security;
alter table businesses force  row level security;

drop policy if exists "businesses_select_member"     on businesses;
drop policy if exists "businesses_insert_owner_only" on businesses;
drop policy if exists "businesses_update_owner_only" on businesses;
drop policy if exists "businesses_delete_owner_only" on businesses;

create policy "businesses_select_member"
  on businesses for select
  using (is_business_member(id));

create policy "businesses_insert_owner_only"
  on businesses for insert
  with check (owner_id = (select auth.uid()));

create policy "businesses_update_owner_only"
  on businesses for update
  using  (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create policy "businesses_delete_owner_only"
  on businesses for delete
  using (owner_id = (select auth.uid()));

-- ─────────────────────────────────────────────────────────────
-- 17. RLS policies — memberships
-- ─────────────────────────────────────────────────────────────
alter table memberships enable row level security;
alter table memberships force  row level security;

drop policy if exists "memberships_select_member"     on memberships;
drop policy if exists "memberships_insert_owner_only" on memberships;
drop policy if exists "memberships_update_owner_only" on memberships;
drop policy if exists "memberships_delete_owner_only" on memberships;

create policy "memberships_select_member"
  on memberships for select
  using (is_business_member(business_id));

create policy "memberships_insert_owner_only"
  on memberships for insert
  with check (
    (
      role = 'owner'
      and user_id = (select auth.uid())
      and exists (
        select 1 from businesses b
        where b.id = business_id and b.owner_id = (select auth.uid())
      )
    )
    or has_business_role(business_id, array['owner'])
  );

create policy "memberships_update_owner_only"
  on memberships for update
  using  (has_business_role(business_id, array['owner']))
  with check (has_business_role(business_id, array['owner']));

create policy "memberships_delete_owner_only"
  on memberships for delete
  using (has_business_role(business_id, array['owner']));

-- ─────────────────────────────────────────────────────────────
-- 18. RLS policies — saved_estimates (business-scoped)
-- ─────────────────────────────────────────────────────────────
drop policy if exists "Users can view own estimates"           on saved_estimates;
drop policy if exists "Users can insert own estimates"         on saved_estimates;
drop policy if exists "Users can update own estimates"         on saved_estimates;
drop policy if exists "Users can delete own estimates"         on saved_estimates;
drop policy if exists "Users can only see their own estimates" on saved_estimates;
drop policy if exists "saved_estimates_select_member"          on saved_estimates;
drop policy if exists "saved_estimates_insert_member"          on saved_estimates;
drop policy if exists "saved_estimates_update_owner_or_creator" on saved_estimates;
drop policy if exists "saved_estimates_delete_owner_or_creator" on saved_estimates;

create policy "saved_estimates_select_member"
  on saved_estimates for select
  using (is_business_member(business_id));

create policy "saved_estimates_insert_member"
  on saved_estimates for insert
  with check (
    is_business_member(business_id)
    and ((select auth.uid()) = user_id)
  );

create policy "saved_estimates_update_owner_or_creator"
  on saved_estimates for update
  using  (has_business_role(business_id, array['owner', 'admin', 'editor']))
  with check (has_business_role(business_id, array['owner', 'admin', 'editor']));

create policy "saved_estimates_delete_owner_or_creator"
  on saved_estimates for delete
  using (has_business_role(business_id, array['owner', 'admin']));

-- ─────────────────────────────────────────────────────────────
-- 19. RLS policies — user_materials (business-scoped)
-- ─────────────────────────────────────────────────────────────
drop policy if exists "Users can manage own materials"   on user_materials;
drop policy if exists "Users can view own materials"     on user_materials;
drop policy if exists "Users can insert own materials"   on user_materials;
drop policy if exists "Users can update own materials"   on user_materials;
drop policy if exists "Users can delete own materials"   on user_materials;
drop policy if exists "user_materials_select_member"     on user_materials;
drop policy if exists "user_materials_insert_member"     on user_materials;
drop policy if exists "user_materials_update_owner_only" on user_materials;
drop policy if exists "user_materials_delete_owner_only" on user_materials;

create policy "user_materials_select_member"
  on user_materials for select
  using (is_business_member(business_id));

create policy "user_materials_insert_member"
  on user_materials for insert
  with check (
    is_business_member(business_id)
    and ((select auth.uid()) = user_id)
  );

create policy "user_materials_update_owner_only"
  on user_materials for update
  using  (has_business_role(business_id, array['owner', 'admin', 'editor']))
  with check (has_business_role(business_id, array['owner', 'admin', 'editor']));

create policy "user_materials_delete_owner_only"
  on user_materials for delete
  using (has_business_role(business_id, array['owner', 'admin']));

-- ─────────────────────────────────────────────────────────────
-- 20. RLS policies — business_profiles (business-scoped)
-- ─────────────────────────────────────────────────────────────
drop policy if exists "Users can view their own profile"   on business_profiles;
drop policy if exists "Users can insert their own profile" on business_profiles;
drop policy if exists "Users can update their own profile" on business_profiles;
drop policy if exists "business_profiles_select_member"     on business_profiles;
drop policy if exists "business_profiles_insert_owner_only" on business_profiles;
drop policy if exists "business_profiles_update_owner_only" on business_profiles;
drop policy if exists "business_profiles_delete_owner_only" on business_profiles;

create policy "business_profiles_select_member"
  on business_profiles for select
  using (is_business_member(business_id));

create policy "business_profiles_insert_owner_only"
  on business_profiles for insert
  with check (
    has_business_role(business_id, array['owner', 'admin'])
    and ((select auth.uid()) = user_id)
  );

create policy "business_profiles_update_owner_only"
  on business_profiles for update
  using  (has_business_role(business_id, array['owner', 'admin']))
  with check (has_business_role(business_id, array['owner', 'admin']));

create policy "business_profiles_delete_owner_only"
  on business_profiles for delete
  using (has_business_role(business_id, array['owner', 'admin']));

-- ─────────────────────────────────────────────────────────────
-- 21. Grants — authenticated role (for RLS policies to fire)
-- ─────────────────────────────────────────────────────────────
grant usage on schema public to authenticated;
grant select, insert, update, delete on businesses        to authenticated;
grant select, insert, update, delete on memberships       to authenticated;
grant select, insert, update, delete on saved_estimates   to authenticated;
grant select, insert, update, delete on user_materials    to authenticated;
grant select, insert, update, delete on business_profiles to authenticated;

-- ─────────────────────────────────────────────────────────────
-- 22. Atomic seat-claim RPC
-- ─────────────────────────────────────────────────────────────
create or replace function claim_business_seat(
  p_business_id uuid,
  p_user_id     uuid,
  p_seat_limit  integer default 10
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_business_name text;
  v_seat_count    integer;
  v_hashid        bigint;
begin
  -- Advisory lock scoped to this business (serializes concurrent join attempts)
  v_hashid := ('x' || substr(p_business_id::text, 1, 8))::bit(32)::bigint;
  perform pg_advisory_xact_lock(1299827, v_hashid);

  -- Validate business exists
  select name into v_business_name
  from businesses
  where id = p_business_id;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'Business not found.');
  end if;

  -- Duplicate-join guard
  if exists (
    select 1 from memberships
    where business_id = p_business_id and user_id = p_user_id
  ) then
    return jsonb_build_object('ok', false, 'error', 'already_member');
  end if;

  -- Seat count (while holding advisory lock)
  select count(*) into v_seat_count
  from memberships
  where business_id = p_business_id;

  if v_seat_count >= p_seat_limit then
    return jsonb_build_object(
      'ok',   false,
      'error', format(
        'This team has reached its %s-seat limit. Contact the business owner to expand.',
        p_seat_limit
      ),
      'code', 'seat_limit_reached'
    );
  end if;

  -- Insert membership atomically
  insert into memberships (business_id, user_id, role)
  values (p_business_id, p_user_id, 'member')
  on conflict (business_id, user_id) do nothing;

  -- Verify the insert landed (handles ON CONFLICT no-op)
  if not exists (
    select 1 from memberships
    where business_id = p_business_id and user_id = p_user_id
  ) then
    return jsonb_build_object('ok', false, 'error', 'already_member');
  end if;

  return jsonb_build_object('ok', true, 'business_name', v_business_name);
end;
$$;

revoke execute on function claim_business_seat(uuid, uuid, integer) from public, anon, authenticated;
grant  execute on function claim_business_seat(uuid, uuid, integer) to service_role;

-- ─────────────────────────────────────────────────────────────
-- 23. Join-code rotation RPC
-- ─────────────────────────────────────────────────────────────
create or replace function rotate_business_join_code(
  p_business_id uuid,
  p_new_code    text
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_stored text;
begin
  update businesses
  set    join_code = p_new_code
  where  id = p_business_id
  returning join_code into v_stored;

  if not found then
    raise exception 'Business % not found', p_business_id;
  end if;

  return v_stored;
end;
$$;

revoke execute on function rotate_business_join_code(uuid, text) from public, anon, authenticated;
grant  execute on function rotate_business_join_code(uuid, text) to service_role;

-- ============================================================
-- Done. All tables, columns, indexes, RLS, and RPCs are set.
-- ============================================================
