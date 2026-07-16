import type { CalibrationBucket } from "@/types/market";

type CalibrationTableProps = {
  buckets: CalibrationBucket[];
};

function formatPercent(value: number | null): string {
  return value === null ? "—" : `${value}%`;
}

export function CalibrationTable({ buckets }: CalibrationTableProps) {
  return (
    <div className="overflow-x-auto border-y border-slate-200">
      <table className="w-full min-w-[640px] border-collapse text-left">
        <thead>
          <tr className="text-xs uppercase tracking-[0.12em] text-slate-500">
            <th className="py-4 pr-6 font-medium">Probability bucket</th>
            <th className="px-6 py-4 text-right font-medium">Markets</th>
            <th className="px-6 py-4 text-right font-medium">
              Average probability
            </th>
            <th className="py-4 pl-6 text-right font-medium">
              Actual YES wins
            </th>
          </tr>
        </thead>
        <tbody>
          {buckets.map((bucket) => (
            <tr
              key={bucket.label}
              className="border-t border-slate-200 text-sm text-slate-700"
            >
              <td className="py-4 pr-6 font-medium text-slate-950">
                {bucket.label}
              </td>
              <td className="px-6 py-4 text-right font-mono text-slate-950">
                {bucket.marketCount}
              </td>
              <td className="px-6 py-4 text-right font-mono">
                {formatPercent(bucket.averageImpliedProbability)}
              </td>
              <td className="py-4 pl-6 text-right font-mono">
                {formatPercent(bucket.actualYesRate)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
