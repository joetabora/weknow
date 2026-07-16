import Link from "next/link";

import type { MarketMover } from "@/types/market";

type MarketMoversProps = {
  title: string;
  description: string;
  movers: MarketMover[];
};

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "UTC",
  timeZoneName: "short",
});

function formatChange(change: number): string {
  return `${change > 0 ? "+" : ""}${change}%`;
}

export function MarketMovers({
  title,
  description,
  movers,
}: MarketMoversProps) {
  return (
    <section aria-labelledby={`${title.replace(/\s+/g, "-").toLowerCase()}-title`}>
      <div className="mb-5">
        <h2
          id={`${title.replace(/\s+/g, "-").toLowerCase()}-title`}
          className="font-display text-2xl font-semibold tracking-[-0.03em] text-slate-950"
        >
          {title}
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
      </div>

      {movers.length === 0 ? (
        <div className="border border-dashed border-slate-300 bg-white/60 px-5 py-10 text-center text-sm text-slate-600">
          <p className="font-medium text-slate-900">
            Not enough snapshot history yet
          </p>
          <p className="mt-2">
            Movers appear when markets have comparable snapshots from this
            period.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto border-y border-slate-200">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead>
              <tr className="text-xs uppercase tracking-[0.12em] text-slate-500">
                <th className="py-4 pr-6 font-medium">Market</th>
                <th className="px-6 py-4 text-right font-medium">
                  Current YES
                </th>
                <th className="px-6 py-4 text-right font-medium">
                  Previous YES
                </th>
                <th className="px-6 py-4 text-right font-medium">Change</th>
                <th className="py-4 pl-6 text-right font-medium">Direction</th>
              </tr>
            </thead>
            <tbody>
              {movers.map((mover) => (
                <tr
                  key={mover.marketId}
                  className="border-t border-slate-200 text-sm text-slate-700 transition-colors duration-200 hover:bg-white/70"
                >
                  <td className="py-5 pr-6">
                    <Link
                      href={`/dashboard/markets/${mover.marketId}`}
                      className="font-medium text-slate-950 transition-colors hover:text-cyan-800 focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:ring-offset-2"
                    >
                      {mover.name}
                    </Link>
                  </td>
                  <td className="px-6 py-5 text-right font-mono text-slate-950">
                    {mover.currentYesProbability}%
                  </td>
                  <td className="px-6 py-5 text-right">
                    <span className="block font-mono text-slate-950">
                      {mover.previousYesProbability}%
                    </span>
                    <span className="mt-1 block text-xs text-slate-500">
                      {timeFormatter.format(
                        new Date(mover.previousCapturedAt),
                      )}
                    </span>
                  </td>
                  <td
                    className={`px-6 py-5 text-right font-mono font-medium ${
                      mover.change > 0 ? "text-cyan-800" : "text-rose-700"
                    }`}
                  >
                    {formatChange(mover.change)}
                  </td>
                  <td className="py-5 pl-6 text-right">{mover.direction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
