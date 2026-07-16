"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { MarketsTable } from "@/components/markets/MarketsTable";
import type {
  Market,
  MarketSortDirection,
  MarketSortField,
} from "@/types/market";

type MarketsExplorerProps = {
  markets: Market[];
  categories: string[];
};

const SORT_FIELDS: MarketSortField[] = [
  "name",
  "probability",
  "volume",
  "updatedAt",
];

function isSortField(value: string | null): value is MarketSortField {
  return value !== null && SORT_FIELDS.includes(value as MarketSortField);
}

function isSortDirection(value: string | null): value is MarketSortDirection {
  return value === "asc" || value === "desc";
}

function compareMarkets(
  a: Market,
  b: Market,
  sort: MarketSortField,
  direction: MarketSortDirection,
): number {
  const factor = direction === "asc" ? 1 : -1;

  switch (sort) {
    case "name":
      return factor * a.name.localeCompare(b.name);
    case "probability":
      return factor * (a.probability - b.probability);
    case "volume":
      return factor * (a.volume - b.volume);
    case "updatedAt":
      return (
        factor *
        (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime())
      );
    default:
      return 0;
  }
}

export function MarketsExplorer({ markets, categories }: MarketsExplorerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const query = searchParams.get("q") ?? "";
  const category = searchParams.get("category") ?? "";
  const sort: MarketSortField = isSortField(searchParams.get("sort"))
    ? (searchParams.get("sort") as MarketSortField)
    : "updatedAt";
  const direction: MarketSortDirection = isSortDirection(
    searchParams.get("dir"),
  )
    ? (searchParams.get("dir") as MarketSortDirection)
    : "desc";

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }

      const next = params.toString();
      router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const handleSort = useCallback(
    (field: MarketSortField) => {
      if (field === sort) {
        updateParams({
          sort: field,
          dir: direction === "asc" ? "desc" : "asc",
        });
        return;
      }

      updateParams({
        sort: field,
        dir: field === "name" ? "asc" : "desc",
      });
    },
    [direction, sort, updateParams],
  );

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return markets
      .filter((market) => {
        if (category && market.category !== category) {
          return false;
        }
        if (!normalizedQuery) {
          return true;
        }
        return market.name.toLowerCase().includes(normalizedQuery);
      })
      .sort((a, b) => compareMarkets(a, b, sort, direction));
  }, [markets, query, category, sort, direction]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <label className="block min-w-0 flex-1">
          <span className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
            Search
          </span>
          <input
            type="search"
            value={query}
            onChange={(event) => updateParams({ q: event.target.value })}
            placeholder="Search markets by name"
            className="mt-2 w-full border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-600/20"
          />
        </label>

        <label className="block w-full sm:w-56">
          <span className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
            Category
          </span>
          <select
            value={category}
            onChange={(event) =>
              updateParams({ category: event.target.value || null })
            }
            className="mt-2 w-full border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-600/20"
          >
            <option value="">All categories</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="text-sm text-slate-500">
        Showing {filtered.length} of {markets.length} market
        {markets.length === 1 ? "" : "s"}
      </p>

      {filtered.length === 0 ? (
        <div className="border border-dashed border-slate-300 bg-white/60 px-5 py-10 text-center text-sm text-slate-600">
          <p className="font-medium text-slate-900">No markets match</p>
          <p className="mt-2">
            Try a different search term or category filter.
          </p>
        </div>
      ) : (
        <MarketsTable
          markets={filtered}
          sort={sort}
          direction={direction}
          onSort={handleSort}
        />
      )}
    </div>
  );
}
