import Link from "next/link";

import type { WatchlistItem } from "@/types/market";

type WatchlistMoversSectionProps = {
  items: WatchlistItem[];
};

function formatChange(change: number): string {
  return `${change > 0 ? "+" : ""}${change}%`;
}

function direction(change: number): "Increased" | "Decreased" {
  return change >= 0 ? "Increased" : "Decreased";
}

export function WatchlistMoversSection({ items }: WatchlistMoversSectionProps) {
  return (
    <section aria-labelledby="watchlist-movers-title">
      <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <div>
          <h2
            id="watchlist-movers-title"
            className="font-display text-2xl font-semibold tracking-[-0.03em] text-slate-950"
          >
            Watchlist Movers
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Watched markets sorted by largest probability change between the
            latest two snapshots.
          </p>
        </div>
        <Link
          href="/dashboard/watchlist"
          className="text-sm text-cyan-800 transition-colors hover:text-cyan-950"
        >
          View watchlist
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="border border-dashed border-slate-300 bg-white/60 px-5 py-10 text-center text-sm text-slate-600">
          <p className="font-medium text-slate-900">No watchlist movers yet</p>
          <p className="mt-2">
            Add markets to your watchlist and wait for snapshot history.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto border-y border-slate-200">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr className="text-xs uppercase tracking-[0.12em] text-slate-500">
                <th className="py-4 pr-6 font-medium">Market</th>
                <th className="px-6 py-4 text-right font-medium">YES</th>
                <th className="px-6 py-4 text-right font-medium">Change</th>
                <th className="py-4 pl-6 text-right font-medium">Direction</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const change = item.lastProbabilityChange;
                return (
                  <tr
                    key={item.id}
                    className="border-t border-slate-200 text-sm text-slate-700 transition-colors duration-200 hover:bg-white/70"
                  >
                    <td className="py-5 pr-6">
                      <Link
                        href={`/dashboard/markets/${item.marketId}`}
                        className="font-medium text-slate-950 transition-colors hover:text-cyan-800 focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:ring-offset-2"
                      >
                        {item.title}
                      </Link>
                    </td>
                    <td className="px-6 py-5 text-right font-mono text-slate-950">
                      {item.currentYesProbability}%
                    </td>
                    <td className="px-6 py-5 text-right font-mono text-slate-950">
                      {change === null ? "—" : formatChange(change)}
                    </td>
                    <td
                      className={`py-5 pl-6 text-right font-medium ${
                        change === null
                          ? "text-slate-500"
                          : change >= 0
                            ? "text-cyan-800"
                            : "text-rose-700"
                      }`}
                    >
                      {change === null ? "—" : direction(change)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
