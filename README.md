# weknow

A private prediction market research dashboard. Phase 1 provides the web
application shell, Supabase client configuration, and a placeholder market
table. It does not connect to external market APIs or include prediction, AI,
or trading features.

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

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000).

The Supabase client is configured in `lib/database/supabase.ts`. Phase 1 does
not query database tables; `lib/database/markets.ts` supplies clearly labeled
placeholder records for the UI.

## Routes

- `/` — dashboard
- `/dashboard/markets` — placeholder market table

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
