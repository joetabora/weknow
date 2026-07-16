import type { Metadata } from "next";

import { ResolvedMarkets } from "@/components/resolved/ResolvedMarkets";
import {
  getResolutionSummary,
  getResolvedMarkets,
} from "@/lib/database/resolutions";
import type { ResolvedMarket } from "@/types/market";

export const metadata: Metadata = {
  title: "Resolved Markets",
};

export const dynamic = "force-dynamic";

export default async function ResolvedPage() {
  let markets: ResolvedMarket[] = [];
  let loadError: string | null = null;

  try {
    markets = await getResolvedMarkets();
  } catch (error) {
    loadError =
      error instanceof Error
        ? error.message
        : "Unable to load resolved markets from Supabase.";
  }

  const summary = getResolutionSummary(markets);

  return (
    <section className="animate-enter">
      <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-cyan-700">
            Ground truth
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-[-0.04em] text-slate-950">
            Resolved Markets
          </h1>
        </div>
        <p className="max-w-sm text-sm leading-6 text-slate-500">
          Completed markets with recorded outcomes and the final stored YES
          probability before resolution.
        </p>
      </div>

      {loadError ? (
        <div
          role="alert"
          className="border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-800"
        >
          <p className="font-medium">Could not load resolved markets</p>
          <p className="mt-1 text-rose-700">{loadError}</p>
        </div>
      ) : (
        <ResolvedMarkets markets={markets} summary={summary} />
      )}
    </section>
  );
}
