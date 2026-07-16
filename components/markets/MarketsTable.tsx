"use client";

import Link from "next/link";

import type {
  Market,
  MarketSortDirection,
  MarketSortField,
  TimelineStatus,
} from "@/types/market";

type MarketsTableProps = {
  markets: Market[];
  sort: MarketSortField;
  direction: MarketSortDirection;
  onSort: (field: MarketSortField) => void;
};

const volumeFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "UTC",
  timeZoneName: "short",
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

function SortHeader({
  field,
  label,
  align,
  sort,
  direction,
  onSort,
}: {
  field: MarketSortField;
  label: string;
  align: "left" | "right";
  sort: MarketSortField;
  direction: MarketSortDirection;
  onSort: (field: MarketSortField) => void;
}) {
  const active = sort === field;
  const indicator = active ? (direction === "asc" ? " ↑" : " ↓") : "";

  return (
    <button
      type="button"
      onClick={() => onSort(field)}
      className={`inline-flex items-center gap-1 transition-colors hover:text-slate-800 ${
        align === "right" ? "w-full justify-end" : ""
      }`}
    >
      {label}
      <span aria-hidden="true">{indicator}</span>
    </button>
  );
}

function sortAria(
  field: MarketSortField,
  sort: MarketSortField,
  direction: MarketSortDirection,
): "ascending" | "descending" | "none" {
  if (field !== sort) {
    return "none";
  }
  return direction === "asc" ? "ascending" : "descending";
}

function TimelineBadge({ status }: { status: TimelineStatus }) {
  const className =
    status === "Resolved"
      ? "bg-slate-100 text-slate-700"
      : status === "Expiring Soon"
        ? "bg-amber-50 text-amber-800"
        : "bg-cyan-50 text-cyan-800";

  return (
    <span
      className={`inline-flex px-2 py-1 text-xs font-medium tracking-wide ${className}`}
    >
      {status}
    </span>
  );
}

export function MarketsTable({
  markets,
  sort,
  direction,
  onSort,
}: MarketsTableProps) {
  return (
    <div className="overflow-x-auto border-y border-slate-200">
      <table className="w-full min-w-[980px] border-collapse text-left">
        <thead>
          <tr className="text-xs uppercase tracking-[0.12em] text-slate-500">
            <th
              className="py-4 pr-6 font-medium"
              aria-sort={sortAria("name", sort, direction)}
            >
              <SortHeader
                field="name"
                label="Market Name"
                align="left"
                sort={sort}
                direction={direction}
                onSort={onSort}
              />
            </th>
            <th className="px-6 py-4 font-medium">Category</th>
            <th className="px-6 py-4 font-medium">Status</th>
            <th className="px-6 py-4 font-medium">Expiration</th>
            <th className="px-6 py-4 font-medium">Time remaining</th>
            <th
              className="px-6 py-4 text-right font-medium"
              aria-sort={sortAria("probability", sort, direction)}
            >
              <SortHeader
                field="probability"
                label="Probability"
                align="right"
                sort={sort}
                direction={direction}
                onSort={onSort}
              />
            </th>
            <th
              className="px-6 py-4 text-right font-medium"
              aria-sort={sortAria("volume", sort, direction)}
            >
              <SortHeader
                field="volume"
                label="Volume"
                align="right"
                sort={sort}
                direction={direction}
                onSort={onSort}
              />
            </th>
            <th
              className="py-4 pl-6 text-right font-medium"
              aria-sort={sortAria("updatedAt", sort, direction)}
            >
              <SortHeader
                field="updatedAt"
                label="Updated Time"
                align="right"
                sort={sort}
                direction={direction}
                onSort={onSort}
              />
            </th>
          </tr>
        </thead>
        <tbody>
          {markets.map((market) => (
            <tr
              key={market.id}
              className="border-t border-slate-200 text-sm text-slate-700 transition-colors duration-200 hover:bg-white/70"
            >
              <td className="py-5 pr-6 font-medium text-slate-950">
                <Link
                  href={`/dashboard/markets/${market.id}`}
                  className="transition-colors hover:text-cyan-800 focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:ring-offset-2"
                >
                  {market.name}
                </Link>
              </td>
              <td className="px-6 py-5">{market.category}</td>
              <td className="px-6 py-5">
                <TimelineBadge status={market.timelineStatus} />
              </td>
              <td className="px-6 py-5 font-mono text-xs">
                {market.expirationTime
                  ? dateFormatter.format(new Date(market.expirationTime))
                  : "—"}
              </td>
              <td className="px-6 py-5 text-sm">{market.timeRemainingLabel}</td>
              <td className="px-6 py-5 text-right font-mono text-slate-950">
                {market.probability}%
              </td>
              <td className="px-6 py-5 text-right font-mono">
                {volumeFormatter.format(market.volume)}
              </td>
              <td className="py-5 pl-6 text-right font-mono text-xs">
                {timeFormatter.format(new Date(market.updatedAt))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
