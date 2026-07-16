-- Add expiration timeline support for markets.
-- status already exists on markets; resolution_time is derived from market_resolutions.resolved_at.

alter table public.markets
  add column expiration_time timestamptz;

create index markets_expiration_time_idx
  on public.markets (expiration_time);
