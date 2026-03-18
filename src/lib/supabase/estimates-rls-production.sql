-- Production RLS for contractor-owned saved estimates.
-- Current trusted API routes use service_role and bypass RLS by design.
-- This policy is for authenticated direct access paths and future Drizzle adoption.

alter table public.saved_estimates enable row level security;
alter table public.saved_estimates force row level security;

revoke all on public.saved_estimates from anon;
grant select, insert, update, delete on public.saved_estimates to authenticated;

drop policy if exists "Users can only see their own estimates" on public.saved_estimates;

create policy "Users can only see their own estimates"
  on public.saved_estimates
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
