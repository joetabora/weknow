import Link from "next/link";

import type { JournalEntry } from "@/types/market";

type ActiveJournalTableProps = {
  entries: JournalEntry[];
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

function excerpt(text: string, max = 140): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) {
    return trimmed;
  }
  return `${trimmed.slice(0, max - 1)}…`;
}

export function ActiveJournalTable({ entries }: ActiveJournalTableProps) {
  if (entries.length === 0) {
    return (
      <div className="border border-dashed border-slate-300 bg-white/60 px-5 py-10 text-center text-sm text-slate-600">
        <p className="font-medium text-slate-900">No active research notes</p>
        <p className="mt-2">
          Open a market detail page and add a Research Journal entry.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border-y border-slate-200">
      <table className="w-full min-w-[780px] border-collapse text-left">
        <thead>
          <tr className="text-xs uppercase tracking-[0.12em] text-slate-500">
            <th className="py-4 pr-6 font-medium">Market</th>
            <th className="px-6 py-4 font-medium">Thesis</th>
            <th className="px-6 py-4 text-right font-medium">Estimate</th>
            <th className="px-6 py-4 font-medium">Confidence</th>
            <th className="py-4 pl-6 text-right font-medium">Created</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr
              key={entry.id}
              className="border-t border-slate-200 text-sm text-slate-700 align-top"
            >
              <td className="py-5 pr-6 font-medium text-slate-950">
                <Link
                  href={`/dashboard/markets/${entry.marketId}`}
                  className="transition-colors hover:text-cyan-800 focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:ring-offset-2"
                >
                  {entry.marketTitle ?? "Unknown market"}
                </Link>
              </td>
              <td className="px-6 py-5 leading-6 text-slate-700">
                {excerpt(entry.thesis)}
              </td>
              <td className="px-6 py-5 text-right font-mono text-slate-950">
                {entry.expectedProbability}%
              </td>
              <td className="px-6 py-5">{entry.confidenceLevel}</td>
              <td className="py-5 pl-6 text-right font-mono text-xs text-slate-600">
                {timeFormatter.format(new Date(entry.createdAt))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
