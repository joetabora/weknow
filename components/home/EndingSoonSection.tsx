import Link from "next/link";

import type { Market, TimelineStatus } from "@/types/market";

type EndingSoonSectionProps = {
  markets: Market[];
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

function TimelineBadge({ status }: { status: TimelineStatus }) {
  const className =
    status === "Resolved"
      ? "bg-slate-100 text-slate-700"
      : status === "Expiring Soon"
        ? "bg-amber-50 text-amber-800"
        : "bg-cyan-50 text-cyan-800";

  return (
    <span
      className={`inline-flex px-2 py-1 text-xs font-medium tracking-wide ${className}`}
    >
      {status}
    </span>
  );
}

export function EndingSoonSection({ markets }: EndingSoonSectionProps) {
  return (
    <section aria-labelledby="ending-soon-title">
      <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <div>
          <h2
            id="ending-soon-title"
            className="font-display text-2xl font-semibold tracking-[-0.03em] text-slate-950"
          >
            Ending Soon
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Open markets with the nearest resolution times.
          </p>
        </div>
        <Link
          href="/dashboard/markets"
          className="text-sm text-cyan-800 transition-colors hover:text-cyan-950"
        >
          View markets
        </Link>
      </div>

      {markets.length === 0 ? (
        <div className="border border-dashed border-slate-300 bg-white/60 px-5 py-10 text-center text-sm text-slate-600">
          <p className="font-medium text-slate-900">No upcoming expirations</p>
          <p className="mt-2">
            Markets with an expiration time will appear here once ingested.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto border-y border-slate-200">
          <table className="w-full min-w-[680px] border-collapse text-left">
            <thead>
              <tr className="text-xs uppercase tracking-[0.12em] text-slate-500">
                <th className="py-4 pr-6 font-medium">Market</th>
                <th className="px-6 py-4 font-medium">Expires</th>
                <th className="px-6 py-4 font-medium">Remaining</th>
                <th className="py-4 pl-6 font-medium">Status</th>
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
                      href={`/dashboard/markets/${market.id}`}
                      className="font-medium text-slate-950 transition-colors hover:text-cyan-800 focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:ring-offset-2"
                    >
                      {market.name}
                    </Link>
                  </td>
                  <td className="px-6 py-5 font-mono text-xs text-slate-600">
                    {market.expirationTime
                      ? dateFormatter.format(new Date(market.expirationTime))
                      : "—"}
                  </td>
                  <td className="px-6 py-5 text-slate-700">
                    {market.timeRemainingLabel}
                  </td>
                  <td className="py-5 pl-6">
                    <TimelineBadge status={market.timelineStatus} />
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
