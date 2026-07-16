-- Single-user watchlist until authentication is added.
-- Mutations use the service-role client (no public write policies).

create table public.market_watchlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  market_id uuid not null references public.markets (id) on delete cascade,
  created_at timestamptz not null default now(),
  notes text not null default '',
  unique (user_id, market_id)
);

create index market_watchlist_user_created_at_idx
  on public.market_watchlist (user_id, created_at desc);

alter table public.market_watchlist enable row level security;

create policy "Public read access" on public.market_watchlist
  for select using (true);
