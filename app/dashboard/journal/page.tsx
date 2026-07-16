import type { Metadata } from "next";

import { ActiveJournalTable } from "@/components/journal/ActiveJournalTable";
import { getActiveJournalEntries } from "@/lib/database/journal";
import type { JournalEntry } from "@/types/market";

export const metadata: Metadata = {
  title: "Research Journal",
};

export const dynamic = "force-dynamic";

export default async function JournalPage() {
  let entries: JournalEntry[] = [];
  let loadError: string | null = null;

  try {
    entries = await getActiveJournalEntries();
  } catch (error) {
    loadError =
      error instanceof Error
        ? error.message
        : "Unable to load journal entries from Supabase.";
  }

  return (
    <section className="animate-enter">
      <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-cyan-700">
            Research notes
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-[-0.04em] text-slate-950">
            Journal
          </h1>
        </div>
        <p className="max-w-sm text-sm leading-6 text-slate-500">
          Active research notes sorted by newest. Create entries from a market
          detail page.
        </p>
      </div>

      {loadError ? (
        <div
          role="alert"
          className="border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-800"
        >
          <p className="font-medium">Could not load journal</p>
          <p className="mt-1 text-rose-700">{loadError}</p>
        </div>
      ) : (
        <ActiveJournalTable entries={entries} />
      )}
    </section>
  );
}
