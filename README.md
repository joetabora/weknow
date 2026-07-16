# weknow

A private prediction market research dashboard. Markets are stored in Supabase
PostgreSQL (`markets` and `market_snapshots`). It does not connect to external
market APIs or include prediction, AI, or trading features.

## Requirements

- Node.js 20 or newer
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

Current collector: **mock only** (`collectors/mock`). No Kalshi or other live
API integrations yet.

1. Apply the migration and set `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`.
2. Run:

   ```bash
   npm run ingest
   ```

This uses `MockMarketCollector` test data (clearly labeled `mock-*` external
IDs). Re-running upserts the same markets by `external_id` and adds new
snapshot rows.

Pipeline entry points:

- Interface: [`collectors/types.ts`](collectors/types.ts)
- Runner: [`scripts/ingest.ts`](scripts/ingest.ts) → [`lib/ingestion/run.ts`](lib/ingestion/run.ts)

## Scheduled collection

Hourly collection runs via GitHub Actions
([`.github/workflows/collector.yml`](.github/workflows/collector.yml)).

1. In the GitHub repo, open **Settings → Secrets and variables → Actions**.
2. Add these repository secrets:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. The workflow runs every hour (UTC). To test manually, open
   **Actions → Collector → Run workflow**.

The scheduled job still uses `MockMarketCollector` until a live collector is
added. On failure, the workflow logs a placeholder notification message (no
Slack/email/webhook wired yet).

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
