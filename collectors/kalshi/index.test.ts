import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { KalshiMarketCollector } from "@/collectors/kalshi";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function sampleMarket(ticker: string) {
  return {
    ticker,
    event_ticker: "KXTEST",
    yes_sub_title: "Outcome A",
    status: "active",
    yes_bid_dollars: "0.5500",
    no_bid_dollars: "0.4500",
    volume_fp: "100.00",
    rules_primary: "Sample rules",
  };
}

describe("KalshiMarketCollector", () => {
  it("paginates events, caches series lookups, and maps markets", async () => {
    const requests: string[] = [];

    const fetchImpl: typeof fetch = async (input) => {
      const url = String(input);
      requests.push(url);

      if (url.includes("/events") && !url.includes("cursor=")) {
        return jsonResponse({
          events: [
            {
              event_ticker: "KXTEST-1",
              series_ticker: "KXSERIES",
              title: "First event",
              markets: [sampleMarket("KXTEST-1-A")],
            },
          ],
          cursor: "page-2",
        });
      }

      if (url.includes("/events") && url.includes("cursor=page-2")) {
        return jsonResponse({
          events: [
            {
              event_ticker: "KXTEST-2",
              series_ticker: "KXSERIES",
              title: "Second event",
              markets: [sampleMarket("KXTEST-2-B")],
            },
          ],
          cursor: "",
        });
      }

      if (url.includes("/series/KXSERIES")) {
        return jsonResponse({
          series: {
            ticker: "KXSERIES",
            category: "Economics",
            title: "Series title",
          },
        });
      }

      throw new Error(`Unexpected URL in test: ${url}`);
    };

    const collector = new KalshiMarketCollector({
      baseUrl: "https://example.test/trade-api/v2",
      fetchImpl,
    });

    const markets = await collector.fetchMarkets();

    assert.equal(markets.length, 2);
    assert.equal(markets[0]?.externalId, "KXTEST-1-A");
    assert.equal(markets[1]?.externalId, "KXTEST-2-B");
    assert.equal(markets[0]?.category, "Economics");
    assert.equal(markets[0]?.liquidity, 0);
    assert.equal(
      requests.filter((url) => url.includes("/series/KXSERIES")).length,
      1,
    );
    assert.equal(requests.filter((url) => url.includes("/events")).length, 2);
  });

  it("rejects repeated pagination cursors", async () => {
    const fetchImpl: typeof fetch = async (input) => {
      const url = String(input);
      if (url.includes("/events")) {
        return jsonResponse({
          events: [
            {
              event_ticker: "KXTEST-1",
              series_ticker: "KXSERIES",
              title: "First event",
              markets: [sampleMarket("KXTEST-1-A")],
            },
          ],
          cursor: "same-cursor",
        });
      }
      throw new Error(`Unexpected URL in test: ${url}`);
    };

    const collector = new KalshiMarketCollector({
      baseUrl: "https://example.test/trade-api/v2",
      fetchImpl,
    });

    await assert.rejects(
      () => collector.fetchMarkets(),
      /repeated cursor/,
    );
  });

  it("surfaces actionable HTTP errors", async () => {
    const fetchImpl: typeof fetch = async () =>
      new Response("rate limited", {
        status: 429,
        statusText: "Too Many Requests",
      });

    const collector = new KalshiMarketCollector({
      baseUrl: "https://example.test/trade-api/v2",
      fetchImpl,
    });

    await assert.rejects(
      () => collector.fetchMarkets(),
      /Kalshi request failed \(429 Too Many Requests\)/,
    );
  });
});
