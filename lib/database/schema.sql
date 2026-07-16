-- Phase 2 markets table. Run this in the Supabase SQL editor first.

create table if not exists public.markets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  probability numeric not null,
  volume numeric not null,
  updated_at timestamptz not null default now()
);

alter table public.markets enable row level security;

create policy "Public read access" on public.markets
  for select using (true);
