import type { Metadata } from "next";

import { MarketMovers } from "@/components/movers/MarketMovers";
import { getMarketMovers } from "@/lib/database/movers";
import type { MarketMover } from "@/types/market";

export const metadata: Metadata = {
  title: "Market Movers",
};

export const dynamic = "force-dynamic";

export default async function MoversPage() {
  let dailyMovers: MarketMover[] = [];
  let weeklyMovers: MarketMover[] = [];
  let loadError: string | null = null;

  try {
    [dailyMovers, weeklyMovers] = await Promise.all([
      getMarketMovers("24h"),
      getMarketMovers("7d"),
    ]);
  } catch (error) {
    loadError =
      error instanceof Error
        ? error.message
        : "Unable to load market movers from Supabase.";
  }

  return (
    <section className="animate-enter">
      <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-cyan-700">
            Recent movement
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-[-0.04em] text-slate-950">
            Market Movers
          </h1>
        </div>
        <p className="max-w-sm text-sm leading-6 text-slate-500">
          Markets ranked by absolute change in stored YES probability. Values
          are calculated from historical snapshots.
        </p>
      </div>

      {loadError ? (
        <div
          role="alert"
          className="border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-800"
        >
          <p className="font-medium">Could not load market movers</p>
          <p className="mt-1 text-rose-700">{loadError}</p>
        </div>
      ) : (
        <div className="space-y-14">
          <MarketMovers
            title="Last 24 hours"
            description="Current YES probability compared with the latest snapshot at or before 24 hours ago."
            movers={dailyMovers}
          />
          <MarketMovers
            title="Last 7 days"
            description="Current YES probability compared with the latest snapshot at or before 7 days ago."
            movers={weeklyMovers}
          />
        </div>
      )}
    </section>
  );
}
