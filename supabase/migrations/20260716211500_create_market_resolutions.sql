-- Ground-truth outcomes for resolved markets.
-- Final prices are copied from the latest market_snapshots row at record time.

create table public.market_resolutions (
  id uuid primary key default gen_random_uuid(),
  market_id uuid not null references public.markets (id) on delete cascade,
  resolved_at timestamptz not null,
  winning_outcome text not null check (winning_outcome in ('yes', 'no')),
  final_yes_price numeric not null,
  final_no_price numeric not null,
  created_at timestamptz not null default now(),
  unique (market_id)
);

create index market_resolutions_resolved_at_idx
  on public.market_resolutions (resolved_at desc);

alter table public.market_resolutions enable row level security;

create policy "Public read access" on public.market_resolutions
  for select using (true);
