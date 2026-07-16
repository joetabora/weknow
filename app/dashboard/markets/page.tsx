import type { Metadata } from "next";

import { MarketsTable } from "@/components/markets/MarketsTable";
import { getMarkets } from "@/lib/database/markets";
import type { Market } from "@/types/market";

export const metadata: Metadata = {
  title: "Markets",
};

export const dynamic = "force-dynamic";

export default async function MarketsPage() {
  let markets: Market[] = [];
  let loadError: string | null = null;

  try {
    markets = await getMarkets();
  } catch (error) {
    loadError =
      error instanceof Error
        ? error.message
        : "Unable to load markets from Supabase.";
  }

  return (
    <section className="animate-enter">
      <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-cyan-700">
            Research dataset
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-[-0.04em] text-slate-950">
            Markets
          </h1>
        </div>
        <p className="max-w-sm text-sm leading-6 text-slate-500">
          Markets loaded from the Supabase PostgreSQL table. Phase 2 is
          read-only and does not connect to external market APIs.
        </p>
      </div>

      {loadError ? (
        <div
          role="alert"
          className="border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-800"
        >
          <p className="font-medium">Could not load markets</p>
          <p className="mt-1 text-rose-700">{loadError}</p>
        </div>
      ) : markets.length === 0 ? (
        <div className="border border-dashed border-slate-300 bg-white/60 px-5 py-10 text-center text-sm text-slate-600">
          <p className="font-medium text-slate-900">No markets found</p>
          <p className="mt-2">
            Run <code className="font-mono text-xs">lib/database/seed.sql</code>{" "}
            in the Supabase SQL editor, or insert rows into the{" "}
            <code className="font-mono text-xs">markets</code> table.
          </p>
        </div>
      ) : (
        <MarketsTable markets={markets} />
      )}
    </section>
  );
}
