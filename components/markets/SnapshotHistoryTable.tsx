import type { MarketPricePoint } from "@/types/market";

type SnapshotHistoryTableProps = {
  points: MarketPricePoint[];
};

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

export function SnapshotHistoryTable({ points }: SnapshotHistoryTableProps) {
  if (points.length === 0) {
    return (
      <div className="border border-dashed border-slate-300 bg-white/60 px-5 py-8 text-center text-sm text-slate-600">
        <p className="font-medium text-slate-900">No snapshots yet</p>
        <p className="mt-2">
          Snapshots appear after the collector writes market data.
        </p>
      </div>
    );
  }

  const rows = [...points].reverse();

  return (
    <div className="overflow-x-auto border-y border-slate-200">
      <table className="w-full min-w-[520px] border-collapse text-left">
        <thead>
          <tr className="text-xs uppercase tracking-[0.12em] text-slate-500">
            <th className="py-4 pr-6 font-medium">Captured</th>
            <th className="px-6 py-4 text-right font-medium">Probability</th>
            <th className="py-4 pl-6 text-right font-medium">Volume</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((point) => (
            <tr
              key={point.capturedAt}
              className="border-t border-slate-200 text-sm text-slate-700"
            >
              <td className="py-4 pr-6 font-mono text-xs">
                {timeFormatter.format(new Date(point.capturedAt))}
              </td>
              <td className="px-6 py-4 text-right font-mono text-slate-950">
                {point.probability}%
              </td>
              <td className="py-4 pl-6 text-right font-mono">
                {volumeFormatter.format(point.volume)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
