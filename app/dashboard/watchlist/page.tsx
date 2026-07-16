import type { Metadata } from "next";

import { WatchlistTable } from "@/components/watchlist/WatchlistTable";
import { getWatchlist } from "@/lib/database/watchlist";
import type { WatchlistItem } from "@/types/market";

export const metadata: Metadata = {
  title: "Watchlist",
};

export const dynamic = "force-dynamic";

export default async function WatchlistPage() {
  let items: WatchlistItem[] = [];
  let loadError: string | null = null;

  try {
    items = await getWatchlist();
  } catch (error) {
    loadError =
      error instanceof Error
        ? error.message
        : "Unable to load watchlist from Supabase.";
  }

  return (
    <section className="animate-enter">
      <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-cyan-700">
            Monitoring
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-[-0.04em] text-slate-950">
            Watchlist
          </h1>
        </div>
        <p className="max-w-sm text-sm leading-6 text-slate-500">
          Saved markets to monitor, with current YES probability, recent
          change, and personal notes.
        </p>
      </div>

      {loadError ? (
        <div
          role="alert"
          className="border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-800"
        >
          <p className="font-medium">Could not load watchlist</p>
          <p className="mt-1 text-rose-700">{loadError}</p>
        </div>
      ) : (
        <WatchlistTable items={items} />
      )}
    </section>
  );
}
