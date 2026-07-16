# weknow

A private prediction market research dashboard. Markets are stored in Supabase
PostgreSQL (`markets` and `market_snapshots`). It collects read-only market data
from Kalshi's public API for research. It does not include prediction, AI, or
trading features.

## Requirements

- Node.js 22 or newer (CI uses Node.js 24)
- npm
- A Supabase project

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the environment template:

   ```bash
   cp .env.example .env.local
   ```

3. In the Supabase dashboard, open **Project Settings → API** and add the
   project URL, anon key, and service role key to `.env.local`:

   ```dotenv
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   ```

   The service role key is required for ingestion writes only. Never expose it
   in client-side code or commit it.

4. Set up the database (see below).

5. Start the development server:

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000).

## Database setup

Apply the migration in
[`supabase/migrations/20260716140000_create_markets_and_snapshots.sql`](supabase/migrations/20260716140000_create_markets_and_snapshots.sql):

- With the Supabase CLI: `supabase db push` (or run the SQL against your linked project)
- Or paste the migration contents into the Supabase SQL editor and run it

This creates:

- `markets` — id, external_id, title, description, category, status, timestamps
- `market_snapshots` — prices, volume, liquidity, captured_at (FK to markets)

Indexes: unique `markets.external_id`, `market_snapshots.market_id`,
`market_snapshots.captured_at`.

TypeScript row types live in [`types/database.ts`](types/database.ts).

Note: the Phase 2 files [`lib/database/schema.sql`](lib/database/schema.sql) and
[`lib/database/seed.sql`](lib/database/seed.sql) are superseded. The dashboard
query in `lib/database/markets.ts` still expects the old Phase 2 columns and
will need a follow-up UI update after this migration is applied.

## Market ingestion

The ingestion pipeline fetches markets from a collector, validates them, upserts
`markets` rows, and inserts `market_snapshots`.

### Collectors

| Source | Class | Notes |
| --- | --- | --- |
| `mock` (default local) | `MockMarketCollector` | Labeled sample research rows |
| `kalshi` | `KalshiMarketCollector` | Official public Kalshi market data |

Select the collector with `COLLECTOR_SOURCE=mock|kalshi`.

Local commands:

```bash
# mock data (default)
npm run ingest

# real Kalshi market data (read-only public endpoints, no API key)
npm run ingest:kalshi
```

Collector tests:

```bash
npm run test:collectors
```

### Kalshi (official, read-only)

Verified official documentation:

- [Market Data Quick Start](https://docs.kalshi.com/getting_started/quick_start_market_data)
- [Get Events](https://docs.kalshi.com/api-reference/events/get-events)
- [Get Series](https://docs.kalshi.com/api-reference/market/get-series)
- [Pagination](https://docs.kalshi.com/getting_started/pagination)

Production base URL: `https://external-api.kalshi.com/trade-api/v2`

Endpoints used (public, no authentication, no trading):

1. `GET /events?status=open&with_nested_markets=true&limit=200` (cursor pagination)
2. `GET /series/{series_ticker}` (series category)

Mapping into `CollectedMarket`:

| Internal field | Kalshi field |
| --- | --- |
| `externalId` | market `ticker` |
| `title` | event `title` + market `yes_sub_title` when needed |
| `description` | market `rules_primary` |
| `category` | series `category` |
| `status` | market `status` |
| `yesPrice` | `yes_bid_dollars` |
| `noPrice` | `no_bid_dollars` |
| `volume` | `volume_fp` |
| `liquidity` | `0` (Kalshi documents `liquidity_dollars` as deprecated and always `"0.0000"`) |

No trading, portfolio, orderbook, authentication, or API keys are implemented.

Pipeline entry points:

- Interface: [`collectors/types.ts`](collectors/types.ts)
- Kalshi collector: [`collectors/kalshi`](collectors/kalshi)
- Runner: [`scripts/ingest.ts`](scripts/ingest.ts) → [`lib/ingestion/run.ts`](lib/ingestion/run.ts)

## Scheduled collection

Hourly collection runs via GitHub Actions
([`.github/workflows/collector.yml`](.github/workflows/collector.yml)) using
`COLLECTOR_SOURCE=kalshi`.

1. In the GitHub repo, open **Settings → Secrets and variables → Actions**.
2. Add these repository secrets:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. The workflow runs every hour (UTC). To test manually, open
   **Actions → Collector → Run workflow**.

No Kalshi API key secret is required for public market-data endpoints. On
failure, the workflow logs a placeholder notification message (no
Slack/email/webhook wired yet).

If ingestion fails with `TypeError: fetch failed`:

1. Confirm `NEXT_PUBLIC_SUPABASE_URL` is exactly the Project URL from Supabase
   **Settings → API** (example: `https://abcdefgh.supabase.co`) — no quotes,
   no path, no trailing spaces.
2. Confirm the project is not **paused** in the Supabase dashboard.
3. Confirm `SUPABASE_SERVICE_ROLE_KEY` is the full `service_role` secret JWT.
4. Re-run the workflow and inspect **Test Supabase connectivity** plus the
   preflight lines in **Run collector ingestion**.

## Routes

- `/` — dashboard
- `/dashboard/markets` — markets table loaded from Supabase

## Production build

```bash
npm run build
npm start
```

## Deploy to Vercel

1. Import this repository into Vercel.
2. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` under
   **Project Settings → Environment Variables**.
3. Deploy. Vercel detects the Next.js build settings automatically.

Never commit `.env.local` or Supabase service-role credentials.
