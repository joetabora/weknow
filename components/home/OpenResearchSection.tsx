import Link from "next/link";

import type { JournalEntry } from "@/types/market";

type OpenResearchSectionProps = {
  entries: JournalEntry[];
};

function excerpt(text: string, max = 120): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) {
    return trimmed;
  }
  return `${trimmed.slice(0, max - 1)}…`;
}

export function OpenResearchSection({ entries }: OpenResearchSectionProps) {
  return (
    <section aria-labelledby="open-research-title">
      <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <div>
          <h2
            id="open-research-title"
            className="font-display text-2xl font-semibold tracking-[-0.03em] text-slate-950"
          >
            Open Research
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Journal entries still marked Open, newest first.
          </p>
        </div>
        <Link
          href="/dashboard/journal"
          className="text-sm text-cyan-800 transition-colors hover:text-cyan-950"
        >
          View journal
        </Link>
      </div>

      {entries.length === 0 ? (
        <div className="border border-dashed border-slate-300 bg-white/60 px-5 py-10 text-center text-sm text-slate-600">
          <p className="font-medium text-slate-900">No open research notes</p>
          <p className="mt-2">
            Add a thesis from any market detail page Research Journal section.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto border-y border-slate-200">
          <table className="w-full min-w-[680px] border-collapse text-left">
            <thead>
              <tr className="text-xs uppercase tracking-[0.12em] text-slate-500">
                <th className="py-4 pr-6 font-medium">Market</th>
                <th className="px-6 py-4 font-medium">Thesis</th>
                <th className="px-6 py-4 text-right font-medium">Estimate</th>
                <th className="py-4 pl-6 font-medium">Confidence</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr
                  key={entry.id}
                  className="border-t border-slate-200 text-sm text-slate-700 align-top transition-colors duration-200 hover:bg-white/70"
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
                  <td className="py-5 pl-6">{entry.confidenceLevel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
