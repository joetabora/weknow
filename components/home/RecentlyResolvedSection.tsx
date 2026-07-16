import Link from "next/link";

import type { ResolvedMarket } from "@/types/market";

type RecentlyResolvedSectionProps = {
  markets: ResolvedMarket[];
};

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

export function RecentlyResolvedSection({
  markets,
}: RecentlyResolvedSectionProps) {
  return (
    <section aria-labelledby="recently-resolved-title">
      <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <div>
          <h2
            id="recently-resolved-title"
            className="font-display text-2xl font-semibold tracking-[-0.03em] text-slate-950"
          >
            Recently Resolved
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Completed markets with recorded outcomes, newest first.
          </p>
        </div>
        <Link
          href="/dashboard/resolved"
          className="text-sm text-cyan-800 transition-colors hover:text-cyan-950"
        >
          View resolved
        </Link>
      </div>

      {markets.length === 0 ? (
        <div className="border border-dashed border-slate-300 bg-white/60 px-5 py-10 text-center text-sm text-slate-600">
          <p className="font-medium text-slate-900">No resolved markets yet</p>
          <p className="mt-2">
            Record outcomes with{" "}
            <code className="font-mono text-xs">npm run resolve</code> to
            populate this list.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto border-y border-slate-200">
          <table className="w-full min-w-[680px] border-collapse text-left">
            <thead>
              <tr className="text-xs uppercase tracking-[0.12em] text-slate-500">
                <th className="py-4 pr-6 font-medium">Market</th>
                <th className="px-6 py-4 text-right font-medium">
                  Final YES
                </th>
                <th className="px-6 py-4 text-right font-medium">Outcome</th>
                <th className="py-4 pl-6 text-right font-medium">Result</th>
              </tr>
            </thead>
            <tbody>
              {markets.map((market) => (
                <tr
                  key={market.id}
                  className="border-t border-slate-200 text-sm text-slate-700 transition-colors duration-200 hover:bg-white/70"
                >
                  <td className="py-5 pr-6">
                    <Link
                      href={`/dashboard/markets/${market.marketId}`}
                      className="font-medium text-slate-950 transition-colors hover:text-cyan-800 focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:ring-offset-2"
                    >
                      {market.title}
                    </Link>
                    <span className="mt-1 block font-mono text-xs text-slate-500">
                      {timeFormatter.format(new Date(market.resolvedAt))}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right font-mono text-slate-950">
                    {market.finalYesProbability}%
                  </td>
                  <td className="px-6 py-5 text-right font-medium uppercase tracking-wide text-slate-950">
                    {market.winningOutcome}
                  </td>
                  <td
                    className={`py-5 pl-6 text-right font-medium ${
                      market.result === "Correct"
                        ? "text-cyan-800"
                        : "text-rose-700"
                    }`}
                  >
                    {market.result}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
