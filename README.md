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
   project URL and anon key to `.env.local`:

   ```dotenv
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

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
