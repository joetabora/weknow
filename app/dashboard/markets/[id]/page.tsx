import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ContractCalculator } from "@/components/markets/ContractCalculator";
import { JournalEntryForm } from "@/components/journal/JournalEntryForm";
import { JournalEntryList } from "@/components/journal/JournalEntryList";
import { PriceChart } from "@/components/markets/PriceChart";
import { ResolutionTimeline } from "@/components/markets/ResolutionTimeline";
import { SnapshotHistoryTable } from "@/components/markets/SnapshotHistoryTable";
import { WatchlistToggle } from "@/components/watchlist/WatchlistToggle";
import { getJournalEntriesForMarket } from "@/lib/database/journal";
import {
  getMarketById,
  getMarketPriceHistory,
} from "@/lib/database/markets";
import { isMarketWatched } from "@/lib/database/watchlist";
import type {
  JournalEntry,
  MarketDetail,
  MarketPricePoint,
} from "@/types/market";

type MarketDetailPageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

const volumeFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "UTC",
  timeZoneName: "short",
});

export async function generateMetadata({
  params,
}: MarketDetailPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const market = await getMarketById(id);
    if (!market) {
      return { title: "Market not found" };
    }
    return { title: market.title };
  } catch {
    return { title: "Market" };
  }
}

export default async function MarketDetailPage({
  params,
}: MarketDetailPageProps) {
  const { id } = await params;

  let loadError: string | null = null;
  let market: MarketDetail | null = null;
  let history: MarketPricePoint[] = [];
  let journalEntries: JournalEntry[] = [];
  let watched = false;

  try {
    market = await getMarketById(id);
    if (market) {
      [history, watched, journalEntries] = await Promise.all([
        getMarketPriceHistory(id),
        isMarketWatched(id),
        getJournalEntriesForMarket(id),
      ]);
    }
  } catch (error) {
    loadError =
      error instanceof Error
        ? error.message
        : "Unable to load market from Supabase.";
  }

  if (!loadError && !market) {
    notFound();
  }

  return (
    <section className="animate-enter">
      <div className="mb-8">
        <Link
          href="/dashboard/markets"
          className="text-sm text-cyan-800 transition-colors hover:text-cyan-950"
        >
          ← Back to markets
        </Link>
      </div>

      {loadError ? (
        <div
          role="alert"
          className="border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-800"
        >
          <p className="font-medium">Could not load market</p>
          <p className="mt-1 text-rose-700">{loadError}</p>
        </div>
      ) : market ? (
        <>
          <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-cyan-700">
                Market detail
              </p>
              <h1 className="mt-3 max-w-4xl font-display text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl">
                {market.title}
              </h1>
              {market.description ? (
                <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">
                  {market.description}
                </p>
              ) : null}
            </div>
            <WatchlistToggle marketId={market.id} isWatched={watched} />
          </div>

          <dl className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="border border-slate-200 bg-white/70 px-4 py-4">
              <dt className="text-xs uppercase tracking-[0.12em] text-slate-500">
                YES probability
              </dt>
              <dd className="mt-2 font-mono text-2xl text-slate-950">
                {market.yesProbability}%
              </dd>
            </div>
            <div className="border border-slate-200 bg-white/70 px-4 py-4">
              <dt className="text-xs uppercase tracking-[0.12em] text-slate-500">
                NO probability
              </dt>
              <dd className="mt-2 font-mono text-2xl text-slate-950">
                {market.noProbability}%
              </dd>
            </div>
            <div className="border border-slate-200 bg-white/70 px-4 py-4">
              <dt className="text-xs uppercase tracking-[0.12em] text-slate-500">
                Volume
              </dt>
              <dd className="mt-2 font-mono text-2xl text-slate-950">
                {volumeFormatter.format(market.volume)}
              </dd>
            </div>
            <div className="border border-slate-200 bg-white/70 px-4 py-4">
              <dt className="text-xs uppercase tracking-[0.12em] text-slate-500">
                Liquidity
              </dt>
              <dd className="mt-2 font-mono text-2xl text-slate-950">
                {volumeFormatter.format(market.liquidity)}
              </dd>
            </div>
            <div className="border border-slate-200 bg-white/70 px-4 py-4">
              <dt className="text-xs uppercase tracking-[0.12em] text-slate-500">
                Category
              </dt>
              <dd className="mt-2 text-lg text-slate-950">{market.category}</dd>
            </div>
            <div className="border border-slate-200 bg-white/70 px-4 py-4">
              <dt className="text-xs uppercase tracking-[0.12em] text-slate-500">
                Status
              </dt>
              <dd className="mt-2 text-lg capitalize text-slate-950">
                {market.status}
              </dd>
            </div>
            <div className="border border-slate-200 bg-white/70 px-4 py-4">
              <dt className="text-xs uppercase tracking-[0.12em] text-slate-500">
                Updated
              </dt>
              <dd className="mt-2 font-mono text-sm text-slate-950">
                {timeFormatter.format(new Date(market.updatedAt))}
              </dd>
            </div>
          </dl>

          <div className="mb-10 space-y-4">
            <div>
              <h2 className="font-display text-xl font-semibold tracking-[-0.03em] text-slate-950">
                Resolution Timeline
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Market created, current time, expiration, and remaining time
                until trading closes.
              </p>
            </div>
            <ResolutionTimeline
              createdAt={market.createdAt}
              currentAt={new Date().toISOString()}
              expirationTime={market.expirationTime}
              resolvedAt={market.resolvedAt}
              timelineStatus={market.timelineStatus}
              timeRemainingLabel={market.timeRemainingLabel}
            />
          </div>

          <div className="mb-10 space-y-4">
            <div>
              <h2 className="font-display text-xl font-semibold tracking-[-0.03em] text-slate-950">
                Contract calculator
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Explore hypothetical YES or NO outcomes at the current market
                price. Calculator only — no trading.
              </p>
            </div>
            <ContractCalculator
              defaultYesPrice={market.yesProbability / 100}
              defaultNoPrice={market.noProbability / 100}
            />
          </div>

          <div className="mb-10 space-y-4">
            <h2 className="font-display text-xl font-semibold tracking-[-0.03em] text-slate-950">
              Historical probability
            </h2>
            <PriceChart points={history} />
          </div>

          <div className="mb-10 space-y-4">
            <h2 className="font-display text-xl font-semibold tracking-[-0.03em] text-slate-950">
              Snapshot history
            </h2>
            <SnapshotHistoryTable points={history} />
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="font-display text-xl font-semibold tracking-[-0.03em] text-slate-950">
                Research Journal
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Record your reasoning before the market resolves. Your estimate
                is stored separately from the Kalshi price shown for comparison.
              </p>
            </div>
            <JournalEntryForm
              marketId={market.id}
              kalshiYesProbability={market.yesProbability}
            />
            <div className="space-y-3">
              <h3 className="text-sm font-medium uppercase tracking-[0.12em] text-slate-500">
                Previous entries
              </h3>
              <JournalEntryList entries={journalEntries} />
            </div>
          </div>
        </>
      ) : null}
    </section>
  );
}
