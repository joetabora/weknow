-- Replace Phase 2 markets shape with markets + market_snapshots.

drop table if exists public.markets cascade;

create table public.markets (
  id uuid primary key default gen_random_uuid(),
  external_id text not null,
  title text not null,
  description text,
  category text not null,
  status text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index markets_external_id_idx on public.markets (external_id);

create table public.market_snapshots (
  id uuid primary key default gen_random_uuid(),
  market_id uuid not null references public.markets (id) on delete cascade,
  yes_price numeric not null,
  no_price numeric not null,
  volume numeric not null,
  liquidity numeric not null,
  captured_at timestamptz not null default now()
);

create index market_snapshots_market_id_idx on public.market_snapshots (market_id);
create index market_snapshots_captured_at_idx on public.market_snapshots (captured_at);

alter table public.markets enable row level security;
alter table public.market_snapshots enable row level security;

create policy "Public read access" on public.markets
  for select using (true);

create policy "Public read access" on public.market_snapshots
  for select using (true);
