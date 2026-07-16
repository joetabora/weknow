"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { removeWatchlistAction } from "@/app/actions/watchlist";
import { WatchlistNotesEditor } from "@/components/watchlist/WatchlistNotesEditor";
import type { WatchlistItem } from "@/types/market";

type WatchlistTableProps = {
  items: WatchlistItem[];
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

function formatChange(change: number | null): string {
  if (change === null) {
    return "—";
  }
  return `${change > 0 ? "+" : ""}${change}%`;
}

function RemoveButton({ marketId }: { marketId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleRemove() {
    setError(null);
    startTransition(async () => {
      try {
        await removeWatchlistAction(marketId);
        router.refresh();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to remove market.",
        );
      }
    });
  }

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={handleRemove}
        disabled={pending}
        className="text-xs font-medium text-rose-700 transition hover:text-rose-900 disabled:opacity-50"
      >
        {pending ? "Removing…" : "Remove"}
      </button>
      {error ? <p className="text-xs text-rose-700">{error}</p> : null}
    </div>
  );
}

export function WatchlistTable({ items }: WatchlistTableProps) {
  if (items.length === 0) {
    return (
      <div className="border border-dashed border-slate-300 bg-white/60 px-5 py-10 text-center text-sm text-slate-600">
        <p className="font-medium text-slate-900">
          No markets on your watchlist yet
        </p>
        <p className="mt-2">
          Open a market detail page and choose{" "}
          <span className="font-medium">Add to Watchlist</span>.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border-y border-slate-200">
      <table className="w-full min-w-[900px] border-collapse text-left">
        <thead>
          <tr className="text-xs uppercase tracking-[0.12em] text-slate-500">
            <th className="py-4 pr-6 font-medium">Market</th>
            <th className="px-6 py-4 text-right font-medium">
              Current probability
            </th>
            <th className="px-6 py-4 text-right font-medium">Last change</th>
            <th className="px-6 py-4 font-medium">Date added</th>
            <th className="px-6 py-4 font-medium">Notes</th>
            <th className="py-4 pl-6 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={item.id}
              className="border-t border-slate-200 text-sm text-slate-700 align-top"
            >
              <td className="py-5 pr-6 font-medium text-slate-950">
                <Link
                  href={`/dashboard/markets/${item.marketId}`}
                  className="transition-colors hover:text-cyan-800 focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:ring-offset-2"
                >
                  {item.title}
                </Link>
              </td>
              <td className="px-6 py-5 text-right font-mono text-slate-950">
                {item.currentYesProbability}%
              </td>
              <td
                className={`px-6 py-5 text-right font-mono ${
                  item.lastProbabilityChange === null
                    ? "text-slate-500"
                    : item.lastProbabilityChange > 0
                      ? "text-cyan-800"
                      : item.lastProbabilityChange < 0
                        ? "text-rose-700"
                        : "text-slate-950"
                }`}
              >
                {formatChange(item.lastProbabilityChange)}
              </td>
              <td className="px-6 py-5 font-mono text-xs text-slate-600">
                {timeFormatter.format(new Date(item.addedAt))}
              </td>
              <td className="px-6 py-5">
                <WatchlistNotesEditor
                  marketId={item.marketId}
                  notes={item.notes}
                />
              </td>
              <td className="py-5 pl-6 text-right">
                <RemoveButton marketId={item.marketId} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
