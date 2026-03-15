-- Add share_code to saved_estimates for client-facing share links.
-- Run in Supabase SQL Editor if your schema does not yet have this column.
alter table saved_estimates
  add column if not exists share_code text unique;

create index if not exists saved_estimates_share_code_idx
  on saved_estimates(share_code)
  where share_code is not null;

comment on column saved_estimates.share_code is 'Optional short code for public/share link; regeneratable by owner.';
