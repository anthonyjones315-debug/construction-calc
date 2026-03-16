-- Extend saved_estimates status values for the sign-and-return workflow.
-- Run in Supabase SQL Editor before using PENDING / SIGNED statuses in production.

alter table saved_estimates
  drop constraint if exists saved_estimates_status_check;

alter table saved_estimates
  add constraint saved_estimates_status_check
  check (status in ('Draft','Sent','Approved','Lost','PENDING','SIGNED'));
