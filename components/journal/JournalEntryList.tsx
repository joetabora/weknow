import type { JournalEntry } from "@/types/market";

type JournalEntryListProps = {
  entries: JournalEntry[];
  emptyMessage?: string;
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

export function JournalEntryList({
  entries,
  emptyMessage = "No journal entries yet for this market.",
}: JournalEntryListProps) {
  if (entries.length === 0) {
    return (
      <div className="border border-dashed border-slate-300 bg-white/60 px-5 py-8 text-center text-sm text-slate-600">
        <p className="font-medium text-slate-900">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {entries.map((entry) => (
        <li
          key={entry.id}
          className="border border-slate-200 bg-white/70 px-5 py-4"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <p className="text-xs uppercase tracking-[0.12em] text-slate-500">
              {timeFormatter.format(new Date(entry.createdAt))}
            </p>
            <p className="text-xs uppercase tracking-[0.12em] text-slate-500">
              {entry.status} · {entry.confidenceLevel} confidence
            </p>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-800">{entry.thesis}</p>
          <p className="mt-3 font-mono text-sm text-slate-950">
            My estimate: {entry.expectedProbability}%
          </p>
        </li>
      ))}
    </ul>
  );
}
