import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  deriveTimeline,
  EXPIRING_SOON_MS,
  isResolvedMarketStatus,
} from "@/lib/markets/timeline";

describe("isResolvedMarketStatus", () => {
  it("recognizes finalized, settled, and determined", () => {
    assert.equal(isResolvedMarketStatus("finalized"), true);
    assert.equal(isResolvedMarketStatus("SETTLED"), true);
    assert.equal(isResolvedMarketStatus("determined"), true);
    assert.equal(isResolvedMarketStatus("active"), false);
    assert.equal(isResolvedMarketStatus("open"), false);
  });
});

describe("deriveTimeline", () => {
  const now = new Date("2026-07-16T12:00:00.000Z");

  it("returns Resolved when isResolved is true", () => {
    const result = deriveTimeline({
      expirationTime: "2026-07-20T12:00:00.000Z",
      isResolved: true,
      now,
    });
    assert.equal(result.status, "Resolved");
    assert.equal(result.label, "Resolved");
    assert.equal(result.msRemaining, null);
  });

  it("returns Open with No date when expiration is missing", () => {
    const result = deriveTimeline({
      expirationTime: null,
      isResolved: false,
      now,
    });
    assert.equal(result.status, "Open");
    assert.equal(result.label, "No date");
  });

  it("returns Expiring Soon within the 48h window", () => {
    const soon = new Date(now.getTime() + EXPIRING_SOON_MS - 60 * 60 * 1000);
    const result = deriveTimeline({
      expirationTime: soon.toISOString(),
      isResolved: false,
      now,
    });
    assert.equal(result.status, "Expiring Soon");
    assert.equal(result.label, "1d 23h left");
  });

  it("returns Open with multi-day label when far from expiration", () => {
    const result = deriveTimeline({
      expirationTime: "2026-07-20T16:00:00.000Z",
      isResolved: false,
      now,
    });
    assert.equal(result.status, "Open");
    assert.equal(result.label, "4d 4h left");
  });

  it("returns Expiring Soon Ended when expiration has passed", () => {
    const result = deriveTimeline({
      expirationTime: "2026-07-15T12:00:00.000Z",
      isResolved: false,
      now,
    });
    assert.equal(result.status, "Expiring Soon");
    assert.equal(result.label, "Ended");
    assert.ok((result.msRemaining ?? 0) < 0);
  });
});
