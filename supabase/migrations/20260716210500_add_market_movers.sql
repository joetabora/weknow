-- Efficiently compare each market's latest snapshot with an as-of baseline.

create index market_snapshots_market_captured_at_idx
  on public.market_snapshots (market_id, captured_at desc);

create or replace function public.get_market_movers(
  lookback interval,
  result_limit integer default 20
)
returns table (
  market_id uuid,
  title text,
  current_yes_price numeric,
  previous_yes_price numeric,
  previous_captured_at timestamptz,
  change_abs numeric
)
language sql
stable
set search_path = public
as $$
  with latest as (
    select distinct on (snapshot.market_id)
      snapshot.market_id,
      snapshot.yes_price
    from public.market_snapshots as snapshot
    order by snapshot.market_id, snapshot.captured_at desc
  ),
  compared as (
    select
      latest.market_id,
      latest.yes_price as current_yes_price,
      baseline.yes_price as previous_yes_price,
      baseline.captured_at as previous_captured_at
    from latest
    join lateral (
      select snapshot.yes_price, snapshot.captured_at
      from public.market_snapshots as snapshot
      where snapshot.market_id = latest.market_id
        and snapshot.captured_at <= now() - lookback
      order by snapshot.captured_at desc
      limit 1
    ) as baseline on true
  )
  select
    market.id as market_id,
    market.title,
    compared.current_yes_price,
    compared.previous_yes_price,
    compared.previous_captured_at,
    abs(compared.current_yes_price - compared.previous_yes_price) as change_abs
  from compared
  join public.markets as market on market.id = compared.market_id
  where compared.current_yes_price <> compared.previous_yes_price
  order by change_abs desc, market.title asc
  limit greatest(result_limit, 0);
$$;

grant execute on function public.get_market_movers(interval, integer)
  to anon, authenticated;
