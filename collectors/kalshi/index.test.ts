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
    close_time: "2026-08-01T12:00:00Z",
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
      requestPaceMs: 0,
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
      requestPaceMs: 0,
    });

    await assert.rejects(
      () => collector.fetchMarkets(),
      /repeated cursor/,
    );
  });

  it("retries after HTTP 429 and eventually succeeds", async () => {
    let eventRequests = 0;

    const fetchImpl: typeof fetch = async (input) => {
      const url = String(input);

      if (url.includes("/events")) {
        eventRequests += 1;
        if (eventRequests === 1) {
          return new Response(
            JSON.stringify({
              error: { code: "too_many_requests", message: "too many requests" },
            }),
            {
              status: 429,
              statusText: "Too Many Requests",
              headers: { "Content-Type": "application/json" },
            },
          );
        }

        return jsonResponse({
          events: [
            {
              event_ticker: "KXTEST-1",
              series_ticker: "KXSERIES",
              title: "First event",
              markets: [sampleMarket("KXTEST-1-A")],
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
          },
        });
      }

      throw new Error(`Unexpected URL in test: ${url}`);
    };

    const collector = new KalshiMarketCollector({
      baseUrl: "https://example.test/trade-api/v2",
      fetchImpl,
      requestPaceMs: 0,
      maxRetries: 2,
    });

    const markets = await collector.fetchMarkets();
    assert.equal(markets.length, 1);
    assert.equal(eventRequests, 2);
  });

  it("fails after exhausting 429 retries", async () => {
    const fetchImpl: typeof fetch = async () =>
      new Response("rate limited", {
        status: 429,
        statusText: "Too Many Requests",
      });

    const collector = new KalshiMarketCollector({
      baseUrl: "https://example.test/trade-api/v2",
      fetchImpl,
      requestPaceMs: 0,
      maxRetries: 1,
    });

    await assert.rejects(
      () => collector.fetchMarkets(),
      /Kalshi rate limit exceeded after 1 retries/,
    );
  });
});
