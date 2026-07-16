"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { updateWatchlistNotesAction } from "@/app/actions/watchlist";

type WatchlistNotesEditorProps = {
  marketId: string;
  notes: string;
};

export function WatchlistNotesEditor({
  marketId,
  notes,
}: WatchlistNotesEditorProps) {
  const router = useRouter();
  const [value, setValue] = useState(notes);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const dirty = value !== notes;

  function handleSave() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      try {
        await updateWatchlistNotesAction(marketId, value);
        setSaved(true);
        router.refresh();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to save notes.",
        );
      }
    });
  }

  return (
    <div className="space-y-2">
      <textarea
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
          setSaved(false);
        }}
        rows={3}
        placeholder="Add notes"
        className="w-full min-w-[180px] border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-600/20"
      />
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={pending || !dirty}
          className="inline-flex items-center border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 transition hover:bg-slate-50 disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save notes"}
        </button>
        {saved && !dirty ? (
          <span className="text-xs text-cyan-800">Saved</span>
        ) : null}
      </div>
      {error ? <p className="text-xs text-rose-700">{error}</p> : null}
    </div>
  );
}
