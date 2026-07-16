# weknow

A private prediction market research dashboard. Phase 2 displays markets stored
in Supabase PostgreSQL. It does not connect to external market APIs or include
prediction, AI, or trading features.

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

Run these files in the Supabase SQL editor, in order:

1. [`lib/database/schema.sql`](lib/database/schema.sql) — creates the `markets`
   table and a public read policy (RLS).
2. [`lib/database/seed.sql`](lib/database/seed.sql) — inserts clearly labeled
   sample research rows (not live market data).

The app reads markets through `getMarkets()` in `lib/database/markets.ts` using
the Supabase client in `lib/database/supabase.ts`.

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
