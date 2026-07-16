"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { WatchlistTable } from "@/components/watchlist/WatchlistTable";
import type { WatchlistItem, WatchlistSort } from "@/types/market";

type WatchlistViewProps = {
  items: WatchlistItem[];
};

const SORT_OPTIONS: { value: WatchlistSort; label: string }[] = [
  { value: "recentlyAdded", label: "Recently Added" },
  { value: "endingSoon", label: "Ending Soon" },
  { value: "largestMovement", label: "Largest Movement" },
];

function isWatchlistSort(value: string | null): value is WatchlistSort {
  return (
    value === "recentlyAdded" ||
    value === "endingSoon" ||
    value === "largestMovement"
  );
}

function sortWatchlist(
  items: WatchlistItem[],
  sort: WatchlistSort,
): WatchlistItem[] {
  const copy = [...items];

  switch (sort) {
    case "endingSoon":
      return copy.sort((a, b) => {
        if (!a.expirationTime && !b.expirationTime) {
          return 0;
        }
        if (!a.expirationTime) {
          return 1;
        }
        if (!b.expirationTime) {
          return -1;
        }
        return (
          new Date(a.expirationTime).getTime() -
          new Date(b.expirationTime).getTime()
        );
      });
    case "largestMovement":
      return copy.sort((a, b) => {
        const aMove =
          a.lastProbabilityChange === null
            ? -1
            : Math.abs(a.lastProbabilityChange);
        const bMove =
          b.lastProbabilityChange === null
            ? -1
            : Math.abs(b.lastProbabilityChange);
        if (aMove < 0 && bMove < 0) {
          return 0;
        }
        if (aMove < 0) {
          return 1;
        }
        if (bMove < 0) {
          return -1;
        }
        return bMove - aMove;
      });
    case "recentlyAdded":
    default:
      return copy.sort(
        (a, b) =>
          new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime(),
      );
  }
}

export function WatchlistView({ items }: WatchlistViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sort: WatchlistSort = isWatchlistSort(searchParams.get("sort"))
    ? (searchParams.get("sort") as WatchlistSort)
    : "recentlyAdded";

  const updateSort = useCallback(
    (next: WatchlistSort) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next === "recentlyAdded") {
        params.delete("sort");
      } else {
        params.set("sort", next);
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams],
  );

  const sorted = useMemo(() => sortWatchlist(items, sort), [items, sort]);

  return (
    <div className="space-y-6">
      <label className="block w-full sm:w-64">
        <span className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
          Sort
        </span>
        <select
          value={sort}
          onChange={(event) =>
            updateSort(event.target.value as WatchlistSort)
          }
          className="mt-2 w-full border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-600/20"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <WatchlistTable items={sorted} />
    </div>
  );
}
