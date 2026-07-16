-- Research journal entries attached to markets (single-user; no public writes).

create table public.market_journal_entries (
  id uuid primary key default gen_random_uuid(),
  market_id uuid not null references public.markets (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  thesis text not null,
  confidence_level text not null
    check (confidence_level in ('Low', 'Medium', 'High')),
  expected_probability numeric not null
    check (expected_probability >= 0 and expected_probability <= 100),
  status text not null default 'Open'
    check (status in ('Open', 'Resolved', 'Archived'))
);

create index market_journal_entries_market_created_at_idx
  on public.market_journal_entries (market_id, created_at desc);

create index market_journal_entries_status_created_at_idx
  on public.market_journal_entries (status, created_at desc);

alter table public.market_journal_entries enable row level security;

create policy "Public read access" on public.market_journal_entries
  for select using (true);
