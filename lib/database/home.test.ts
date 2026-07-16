import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  filterWatchlistNeedingResearch,
  sortMarketsEndingSoon,
  sortWatchlistByMovement,
} from "@/lib/database/home";
import type { Market, WatchlistItem } from "@/types/market";

function watchlistItem(
  overrides: Partial<WatchlistItem> & Pick<WatchlistItem, "marketId">,
): WatchlistItem {
  return {
    id: overrides.id ?? `wl-${overrides.marketId}`,
    marketId: overrides.marketId,
    title: overrides.title ?? overrides.marketId,
    currentYesProbability: overrides.currentYesProbability ?? 50,
    lastProbabilityChange: overrides.lastProbabilityChange ?? null,
    addedAt: overrides.addedAt ?? "2026-07-01T00:00:00.000Z",
    notes: overrides.notes ?? "",
    expirationTime: overrides.expirationTime ?? null,
  };
}

function market(
  overrides: Partial<Market> & Pick<Market, "id" | "expirationTime">,
): Market {
  return {
    id: overrides.id,
    name: overrides.name ?? overrides.id,
    category: overrides.category ?? "Politics",
    probability: overrides.probability ?? 50,
    volume: overrides.volume ?? 0,
    updatedAt: overrides.updatedAt ?? "2026-07-01T00:00:00.000Z",
    expirationTime: overrides.expirationTime,
    rawStatus: overrides.rawStatus ?? "open",
    timelineStatus: overrides.timelineStatus ?? "Open",
    timeRemainingLabel: overrides.timeRemainingLabel ?? "1d left",
  };
}

describe("sortWatchlistByMovement", () => {
  it("orders by absolute probability change descending", () => {
    const sorted = sortWatchlistByMovement([
      watchlistItem({ marketId: "a", lastProbabilityChange: 3 }),
      watchlistItem({ marketId: "b", lastProbabilityChange: -12 }),
      watchlistItem({ marketId: "c", lastProbabilityChange: 8 }),
    ]);
    assert.deepEqual(
      sorted.map((item) => item.marketId),
      ["b", "c", "a"],
    );
  });

  it("places null changes after known changes", () => {
    const sorted = sortWatchlistByMovement([
      watchlistItem({ marketId: "nullish", lastProbabilityChange: null }),
      watchlistItem({ marketId: "moved", lastProbabilityChange: 2 }),
    ]);
    assert.deepEqual(
      sorted.map((item) => item.marketId),
      ["moved", "nullish"],
    );
  });
});

describe("sortMarketsEndingSoon", () => {
  it("filters resolved and null expiration, sorts nearest first", () => {
    const sorted = sortMarketsEndingSoon([
      market({
        id: "later",
        expirationTime: "2026-07-20T00:00:00.000Z",
      }),
      market({
        id: "resolved",
        expirationTime: "2026-07-10T00:00:00.000Z",
        timelineStatus: "Resolved",
      }),
      market({
        id: "soon",
        expirationTime: "2026-07-17T00:00:00.000Z",
      }),
      market({
        id: "no-date",
        expirationTime: null,
      }),
    ]);
    assert.deepEqual(
      sorted.map((item) => item.id),
      ["soon", "later"],
    );
  });
});

describe("filterWatchlistNeedingResearch", () => {
  it("keeps watched markets with no journal entries", () => {
    const result = filterWatchlistNeedingResearch(
      [
        watchlistItem({ marketId: "researched" }),
        watchlistItem({ marketId: "needs-work" }),
      ],
      new Set(["researched"]),
    );
    assert.deepEqual(
      result.map((item) => item.marketId),
      ["needs-work"],
    );
  });
});
