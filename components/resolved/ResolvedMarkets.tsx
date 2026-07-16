import Link from "next/link";

import type { ResolutionSummary, ResolvedMarket } from "@/types/market";

type ResolvedMarketsProps = {
  markets: ResolvedMarket[];
  summary: ResolutionSummary;
};

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "UTC",
  timeZoneName: "short",
});

export function ResolvedMarkets({ markets, summary }: ResolvedMarketsProps) {
  return (
    <div className="space-y-10">
      <dl className="grid gap-4 sm:grid-cols-3">
        <div className="border border-slate-200 bg-white/70 px-4 py-4">
          <dt className="text-xs uppercase tracking-[0.12em] text-slate-500">
            Total resolved
          </dt>
          <dd className="mt-2 font-mono text-2xl text-slate-950">
            {summary.total}
          </dd>
        </div>
        <div className="border border-slate-200 bg-white/70 px-4 py-4">
          <dt className="text-xs uppercase tracking-[0.12em] text-slate-500">
            Correct
          </dt>
          <dd className="mt-2 font-mono text-2xl text-cyan-800">
            {summary.correct}
          </dd>
        </div>
        <div className="border border-slate-200 bg-white/70 px-4 py-4">
          <dt className="text-xs uppercase tracking-[0.12em] text-slate-500">
            Incorrect
          </dt>
          <dd className="mt-2 font-mono text-2xl text-rose-700">
            {summary.incorrect}
          </dd>
        </div>
      </dl>

      <p className="text-sm leading-6 text-slate-500">
        Correct and Incorrect compare the final stored YES probability direction
        (≥50% → YES, &lt;50% → NO) with the recorded outcome. This is ground
        truth collection, not model accuracy.
      </p>

      {markets.length === 0 ? (
        <div className="border border-dashed border-slate-300 bg-white/60 px-5 py-10 text-center text-sm text-slate-600">
          <p className="font-medium text-slate-900">No resolved markets yet</p>
          <p className="mt-2">
            Record an outcome with{" "}
            <code className="font-mono text-xs">
              npm run resolve -- --market-id=&lt;uuid&gt; --outcome=yes|no
            </code>
            . Final prices are taken from the latest stored snapshot.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto border-y border-slate-200">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead>
              <tr className="text-xs uppercase tracking-[0.12em] text-slate-500">
                <th className="py-4 pr-6 font-medium">Market</th>
                <th className="px-6 py-4 text-right font-medium">
                  Final probability
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
    </div>
  );
}
