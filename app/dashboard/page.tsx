import type { Metadata } from "next";

import { EndingSoonSection } from "@/components/home/EndingSoonSection";
import { NeedsResearchSection } from "@/components/home/NeedsResearchSection";
import { OpenResearchSection } from "@/components/home/OpenResearchSection";
import { RecentlyResolvedSection } from "@/components/home/RecentlyResolvedSection";
import { WatchlistMoversSection } from "@/components/home/WatchlistMoversSection";
import {
  getHomeEndingSoon,
  getHomeOpenResearch,
  getHomeRecentlyResolved,
  getHomeWatchlistMovers,
  getWatchlistNeedingResearch,
} from "@/lib/database/home";
import type {
  JournalEntry,
  Market,
  ResolvedMarket,
  WatchlistItem,
} from "@/types/market";

export const metadata: Metadata = {
  title: "Research",
};

export const dynamic = "force-dynamic";

export default async function ResearchDashboardPage() {
  let watchlistMovers: WatchlistItem[] = [];
  let endingSoon: Market[] = [];
  let openResearch: JournalEntry[] = [];
  let needsResearch: WatchlistItem[] = [];
  let recentlyResolved: ResolvedMarket[] = [];
  let loadError: string | null = null;

  try {
    [
      watchlistMovers,
      endingSoon,
      openResearch,
      needsResearch,
      recentlyResolved,
    ] = await Promise.all([
      getHomeWatchlistMovers(),
      getHomeEndingSoon(),
      getHomeOpenResearch(),
      getWatchlistNeedingResearch(),
      getHomeRecentlyResolved(),
    ]);
  } catch (error) {
    loadError =
      error instanceof Error
        ? error.message
        : "Unable to load research dashboard from Supabase.";
  }

  return (
    <section className="animate-enter">
      <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-cyan-700">
            Daily brief
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-[-0.04em] text-slate-950">
            Research
          </h1>
        </div>
        <p className="max-w-sm text-sm leading-6 text-slate-500">
          Personal homepage for watchlist movement, upcoming resolutions, open
          notes, and recent outcomes.
        </p>
      </div>

      {loadError ? (
        <div
          role="alert"
          className="border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-800"
        >
          <p className="font-medium">Could not load research dashboard</p>
          <p className="mt-1 text-rose-700">{loadError}</p>
        </div>
      ) : (
        <div className="space-y-14">
          <WatchlistMoversSection items={watchlistMovers} />
          <EndingSoonSection markets={endingSoon} />
          <OpenResearchSection entries={openResearch} />
          <NeedsResearchSection items={needsResearch} />
          <RecentlyResolvedSection markets={recentlyResolved} />
        </div>
      )}
    </section>
  );
}
