# Command Center SaaS Roadmap

## Why this matters

The current Command Center can already serve as a strong owner dashboard, but the next competitive jump for a contractor-focused SaaS is:

1. A real client pipeline
2. Job-level workflow tracking
3. Follow-up tasks and reminders
4. A more durable operations timeline than "recent estimates" alone

## Recommended next pages

1. `Client Hub`
   A searchable place for homeowners, GCs, builders, and repeat accounts.

2. `Jobs Board`
   A Kanban-style board for `Lead`, `Quoted`, `Approved`, `In Progress`, `Invoiced`, `Closed`.

3. `Follow-Ups`
   A queue for callback dates, unanswered proposals, expiring quotes, and internal handoffs.

4. `Daily Planner`
   A contractor-first daily brief with crew notes, quote deadlines, and critical jobs.

## Recommended database additions

These tables would give the Command Center a much stronger SaaS backbone without forcing a full rewrite.

```sql
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  name text not null,
  company_name text,
  email text,
  phone text,
  address_line_1 text,
  address_line_2 text,
  city text,
  state text,
  postal_code text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists clients_business_id_idx on clients (business_id);
create index if not exists clients_name_idx on clients (business_id, name);
```

```sql
create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  client_id uuid references clients(id) on delete set null,
  title text not null,
  status text not null default 'lead',
  location text,
  target_start_date date,
  target_end_date date,
  budget_cents integer,
  notes text,
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint jobs_status_check
    check (status in ('lead', 'quoted', 'approved', 'in_progress', 'invoiced', 'closed', 'lost'))
);

create index if not exists jobs_business_id_status_idx on jobs (business_id, status);
create index if not exists jobs_client_id_idx on jobs (client_id);
```

```sql
create table if not exists job_estimates (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs(id) on delete cascade,
  estimate_id uuid not null references saved_estimates(id) on delete cascade,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  unique (job_id, estimate_id)
);

create index if not exists job_estimates_job_id_idx on job_estimates (job_id);
```

```sql
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  job_id uuid references jobs(id) on delete cascade,
  assigned_to uuid references users(id) on delete set null,
  title text not null,
  description text,
  status text not null default 'open',
  priority text not null default 'normal',
  due_at timestamptz,
  completed_at timestamptz,
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tasks_status_check
    check (status in ('open', 'in_progress', 'blocked', 'done')),
  constraint tasks_priority_check
    check (priority in ('low', 'normal', 'high', 'urgent'))
);

create index if not exists tasks_business_id_status_idx on tasks (business_id, status);
create index if not exists tasks_due_at_idx on tasks (business_id, due_at);
```

```sql
create table if not exists reminders (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  client_id uuid references clients(id) on delete cascade,
  job_id uuid references jobs(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  type text not null default 'follow_up',
  title text not null,
  remind_at timestamptz not null,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint reminders_type_check
    check (type in ('follow_up', 'proposal', 'invoice', 'site_visit', 'internal'))
);

create index if not exists reminders_business_id_remind_at_idx on reminders (business_id, remind_at);
```

## UX goals for the next iteration

1. `Morning Brief`
   Show overdue follow-ups, proposals waiting on response, jobs starting this week, and open tasks.

2. `Client-first workflow`
   Every estimate should optionally belong to a client and a job.

3. `Operator speed`
   Owners should reach `Drafts`, `Quote Follow-Up`, `Invite Crew`, and `Quick Calculator Launch` in one click.

4. `Mobile truck-seat usability`
   The dashboard should be fully useful on a phone without relying on the desktop sidebar.

## Recommendation

The UI work shipped in this pass improves the current Command Center substantially without needing a migration. If we want to become truly competitive in the contractor SaaS category, the best next build is:

1. Add `clients`
2. Add `jobs`
3. Add `tasks` + `reminders`
4. Build `Client Hub` and `Jobs Board`
