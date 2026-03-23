create table if not exists estimate_revisions (
  id uuid primary key default uuid_generate_v4(),
  estimate_id uuid not null references saved_estimates(id) on delete cascade,
  author_id text references public.users(id) on delete set null,
  author_name text,
  revision_number integer not null,
  change_summary text,
  snapshot jsonb not null,
  created_at timestamptz not null default now()
);

alter table estimate_revisions enable row level security;
alter table estimate_revisions force row level security;

-- Only organization users should view this, but since it's accessed via Service Role API we just revoke for anon/auth
revoke all on estimate_revisions from anon;
revoke all on estimate_revisions from authenticated;

create index if not exists estimate_revisions_estimate_id_idx on estimate_revisions(estimate_id);

alter table saved_estimates
  add column if not exists version integer not null default 1;
