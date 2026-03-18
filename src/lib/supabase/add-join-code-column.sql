-- ============================================================
-- Migration: businesses.join_code column + atomic seat-claim RPC
-- Run AFTER business-multi-tenant-migration.sql
-- Idempotent — safe to re-run.
-- ============================================================

-- ─── 1. Add join_code column to businesses ──────────────────────────────────

alter table businesses
  add column if not exists join_code text;

-- Unique index (nulls are NOT considered equal in Postgres, so two NULLs are
-- allowed by default — add a partial unique index to cover non-null values).
create unique index if not exists businesses_join_code_uidx
  on businesses(join_code)
  where join_code is not null;

-- ─── 2. Add seat_limit column (default 10) ──────────────────────────────────

alter table businesses
  add column if not exists seat_limit integer not null default 10;

-- ─── 3. Widen the memberships role constraint to include 'member' ────────────
-- The application join route assigns new users the 'member' role (read-only).
-- The prior migration narrowed the constraint to owner/admin/editor.
-- Re-widen it so the join flow doesn't hit a check-constraint violation.

alter table memberships
  drop constraint if exists memberships_role_check;

alter table memberships
  add constraint memberships_role_check
  check (role in ('owner', 'admin', 'editor', 'member'));

-- ─── 4. Atomic seat-claim RPC ────────────────────────────────────────────────
-- Calling code passes the business_id, user_id, and optional seat_limit.
-- The function acquires an advisory lock scoped to the business_id, counts
-- current members, rejects if full, then inserts the membership row.
-- Returns a JSONB result: { ok: bool, error?: text, business_name?: text }

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
  -- Advisory lock scoped to this business so concurrent calls serialize.
  -- We use the lower 32 bits of the UUID as a deterministic integer key.
  v_hashid := ('x' || substr(p_business_id::text, 1, 8))::bit(32)::bigint;
  perform pg_advisory_xact_lock(1299827, v_hashid);

  -- Resolve business name (also validates business exists).
  select name into v_business_name
  from businesses
  where id = p_business_id;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'Business not found.');
  end if;

  -- Check for existing membership (duplicate join attempt).
  if exists (
    select 1 from memberships
    where business_id = p_business_id and user_id = p_user_id
  ) then
    return jsonb_build_object('ok', false, 'error', 'already_member');
  end if;

  -- Count current seats while holding the lock.
  select count(*) into v_seat_count
  from memberships
  where business_id = p_business_id;

  if v_seat_count >= p_seat_limit then
    return jsonb_build_object(
      'ok', false,
      'error', format(
        'This team has reached its %s-seat limit. Contact the business owner to expand.',
        p_seat_limit
      ),
      'code', 'seat_limit_reached'
    );
  end if;

  -- Insert membership inside the same transaction / lock window.
  insert into memberships (business_id, user_id, role)
  values (p_business_id, p_user_id, 'member')
  on conflict (business_id, user_id) do nothing;

  -- Confirm the insert landed (handles the ON CONFLICT no-op case).
  if not exists (
    select 1 from memberships
    where business_id = p_business_id and user_id = p_user_id
  ) then
    return jsonb_build_object('ok', false, 'error', 'already_member');
  end if;

  return jsonb_build_object(
    'ok', true,
    'business_name', v_business_name
  );
end;
$$;

-- Grant execute to service_role only (API routes use service_role).
revoke execute on function claim_business_seat(uuid, uuid, integer) from public, anon, authenticated;
grant  execute on function claim_business_seat(uuid, uuid, integer) to service_role;

-- ─── 5. rotate_business_join_code RPC ────────────────────────────────────────
-- Atomically sets a new join code on the business.
-- Returns the new code string or raises if the business isn't found.
-- Caller is expected to have already verified owner/admin role before calling.

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
  set join_code = p_new_code
  where id = p_business_id
  returning join_code into v_stored;

  if not found then
    raise exception 'Business % not found', p_business_id;
  end if;

  return v_stored;
end;
$$;

revoke execute on function rotate_business_join_code(uuid, text) from public, anon, authenticated;
grant  execute on function rotate_business_join_code(uuid, text) to service_role;
