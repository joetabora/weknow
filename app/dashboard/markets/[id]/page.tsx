import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PriceChart } from "@/components/markets/PriceChart";
import { SnapshotHistoryTable } from "@/components/markets/SnapshotHistoryTable";
import {
  getMarketById,
  getMarketPriceHistory,
} from "@/lib/database/markets";
import type { MarketDetail, MarketPricePoint } from "@/types/market";

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

  try {
    market = await getMarketById(id);
    if (market) {
      history = await getMarketPriceHistory(id);
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
          <div className="mb-10">
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

          <dl className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="border border-slate-200 bg-white/70 px-4 py-4">
              <dt className="text-xs uppercase tracking-[0.12em] text-slate-500">
                Probability
              </dt>
              <dd className="mt-2 font-mono text-2xl text-slate-950">
                {market.probability}%
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
            <h2 className="font-display text-xl font-semibold tracking-[-0.03em] text-slate-950">
              Historical probability
            </h2>
            <PriceChart points={history} />
          </div>

          <div className="space-y-4">
            <h2 className="font-display text-xl font-semibold tracking-[-0.03em] text-slate-950">
              Snapshot history
            </h2>
            <SnapshotHistoryTable points={history} />
          </div>
        </>
      ) : null}
    </section>
  );
}
