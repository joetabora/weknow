"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  addWatchlistAction,
  removeWatchlistAction,
} from "@/app/actions/watchlist";

type WatchlistToggleProps = {
  marketId: string;
  isWatched: boolean;
};

export function WatchlistToggle({ marketId, isWatched }: WatchlistToggleProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      try {
        if (isWatched) {
          await removeWatchlistAction(marketId);
        } else {
          await addWatchlistAction(marketId);
        }
        router.refresh();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to update watchlist.",
        );
      }
    });
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className={
          isWatched
            ? "inline-flex items-center border border-cyan-700 bg-cyan-50 px-4 py-2 text-sm font-medium text-cyan-900 transition hover:bg-cyan-100 disabled:opacity-60"
            : "inline-flex items-center bg-cyan-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-cyan-800 disabled:opacity-60"
        }
      >
        {pending
          ? "Updating…"
          : isWatched
            ? "Watching"
            : "Add to Watchlist"}
      </button>
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
    </div>
  );
}
