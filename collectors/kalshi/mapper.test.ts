import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildMarketTitle,
  mapKalshiMarket,
  parseFixedPointNumber,
} from "@/collectors/kalshi/mapper";
import { kalshiMarketSchema } from "@/collectors/kalshi/schemas";

describe("parseFixedPointNumber", () => {
  it("parses documented fixed-point dollar and count strings", () => {
    assert.equal(parseFixedPointNumber("0.5800", "yes_bid_dollars"), 0.58);
    assert.equal(parseFixedPointNumber("10.00", "volume_fp"), 10);
  });

  it("rejects invalid fixed-point strings", () => {
    assert.throws(
      () => parseFixedPointNumber("not-a-number", "yes_bid_dollars"),
      /Invalid fixed-point value/,
    );
  });
});

describe("buildMarketTitle", () => {
  it("appends yes_sub_title when it adds outcome context", () => {
    assert.equal(
      buildMarketTitle("Fed rate decision", "Cut rates"),
      "Fed rate decision — Cut rates",
    );
  });

  it("keeps event title when yes_sub_title is already included", () => {
    assert.equal(
      buildMarketTitle("Will Cut rates happen?", "Cut rates"),
      "Will Cut rates happen?",
    );
  });
});

describe("mapKalshiMarket", () => {
  const market = kalshiMarketSchema.parse({
    ticker: "KXTEST-26",
    event_ticker: "KXTEST",
    yes_sub_title: "Yes outcome",
    status: "active",
    yes_bid_dollars: "0.6100",
    no_bid_dollars: "0.3900",
    volume_fp: "1250.50",
    rules_primary: "Resolves Yes if the documented condition occurs.",
  });

  it("maps documented Kalshi fields into CollectedMarket", () => {
    const mapped = mapKalshiMarket({
      event: { title: "Example Kalshi event" },
      market,
      category: "Economics",
      capturedAt: "2026-07-16T19:00:00.000Z",
    });

    assert.deepEqual(mapped, {
      externalId: "KXTEST-26",
      title: "Example Kalshi event — Yes outcome",
      description: "Resolves Yes if the documented condition occurs.",
      category: "Economics",
      status: "active",
      yesPrice: 0.61,
      noPrice: 0.39,
      volume: 1250.5,
      liquidity: 0,
      capturedAt: "2026-07-16T19:00:00.000Z",
    });
  });

  it("stores null description when rules_primary is blank", () => {
    const mapped = mapKalshiMarket({
      event: { title: "Example Kalshi event" },
      market: { ...market, rules_primary: "   " },
      category: "Economics",
      capturedAt: "2026-07-16T19:00:00.000Z",
    });

    assert.equal(mapped.description, null);
  });

  it("rejects markets missing required documented fields", () => {
    const result = kalshiMarketSchema.safeParse({
      ticker: "KXTEST-26",
      event_ticker: "KXTEST",
    });
    assert.equal(result.success, false);
  });
});
