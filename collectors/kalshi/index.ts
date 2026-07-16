import type { MarketCollector } from "@/collectors/types";
import {
  KALSHI_API_BASE_URL,
  KALSHI_EVENTS_PAGE_LIMIT,
  KALSHI_EVENTS_PATH,
  KALSHI_MAX_RETRIES,
  KALSHI_REQUEST_PACE_MS,
  KALSHI_REQUEST_TIMEOUT_MS,
  KALSHI_RETRY_BASE_MS,
  KALSHI_RETRY_MAX_MS,
  KALSHI_SERIES_PATH,
} from "@/collectors/kalshi/constants";
import { mapKalshiMarket } from "@/collectors/kalshi/mapper";
import {
  getEventsResponseSchema,
  getSeriesResponseSchema,
  type KalshiEvent,
} from "@/collectors/kalshi/schemas";
import type { CollectedMarket } from "@/types/collected-market";

export type KalshiFetch = typeof fetch;

export type KalshiMarketCollectorOptions = {
  baseUrl?: string;
  fetchImpl?: KalshiFetch;
  requestTimeoutMs?: number;
  requestPaceMs?: number;
  maxRetries?: number;
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function retryDelayMs(attempt: number): number {
  const exponential = Math.min(
    KALSHI_RETRY_BASE_MS * 2 ** attempt,
    KALSHI_RETRY_MAX_MS,
  );
  const jitter = exponential * 0.2 * (Math.random() * 2 - 1);
  return Math.max(0, Math.round(exponential + jitter));
}

async function fetchJson(
  fetchImpl: KalshiFetch,
  url: string,
  timeoutMs: number,
  maxRetries: number,
): Promise<unknown> {
  let attempt = 0;

  while (true) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetchImpl(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        signal: controller.signal,
      });

      if (response.status === 429) {
        if (attempt >= maxRetries) {
          const body = await response.text().catch(() => "");
          throw new Error(
            `Kalshi rate limit exceeded after ${maxRetries} retries for ${url}${body ? `: ${body.slice(0, 300)}` : ""}`,
          );
        }

        const delayMs = retryDelayMs(attempt);
        console.warn(
          `Kalshi rate limited (429) for ${url}; retrying in ${delayMs}ms (attempt ${attempt + 1}/${maxRetries})`,
        );
        await sleep(delayMs);
        attempt += 1;
        continue;
      }

      if (!response.ok) {
        const body = await response.text().catch(() => "");
        throw new Error(
          `Kalshi request failed (${response.status} ${response.statusText}) for ${url}${body ? `: ${body.slice(0, 300)}` : ""}`,
        );
      }

      return (await response.json()) as unknown;
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error(`Kalshi request timed out after ${timeoutMs}ms for ${url}`);
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }
}

export class KalshiMarketCollector implements MarketCollector {
  private readonly baseUrl: string;
  private readonly fetchImpl: KalshiFetch;
  private readonly requestTimeoutMs: number;
  private readonly requestPaceMs: number;
  private readonly maxRetries: number;

  constructor(options: KalshiMarketCollectorOptions = {}) {
    this.baseUrl = (options.baseUrl ?? KALSHI_API_BASE_URL).replace(/\/$/, "");
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.requestTimeoutMs =
      options.requestTimeoutMs ?? KALSHI_REQUEST_TIMEOUT_MS;
    this.requestPaceMs = options.requestPaceMs ?? KALSHI_REQUEST_PACE_MS;
    this.maxRetries = options.maxRetries ?? KALSHI_MAX_RETRIES;
  }

  async fetchMarkets(): Promise<CollectedMarket[]> {
    const capturedAt = new Date().toISOString();
    const events = await this.fetchAllOpenEvents();
    const seriesCategories = await this.fetchSeriesCategories(events);
    const collected: CollectedMarket[] = [];

    for (const event of events) {
      const category = seriesCategories.get(event.series_ticker);
      if (!category) {
        throw new Error(
          `Missing series category for series_ticker=${event.series_ticker}`,
        );
      }

      for (const market of event.markets ?? []) {
        collected.push(
          mapKalshiMarket({
            event,
            market,
            category,
            capturedAt,
          }),
        );
      }
    }

    return collected;
  }

  private async fetchAllOpenEvents(): Promise<KalshiEvent[]> {
    const events: KalshiEvent[] = [];
    let cursor = "";
    const seenCursors = new Set<string>();
    let page = 0;

    while (true) {
      const url = new URL(`${this.baseUrl}${KALSHI_EVENTS_PATH}`);
      url.searchParams.set("status", "open");
      url.searchParams.set("with_nested_markets", "true");
      url.searchParams.set("limit", String(KALSHI_EVENTS_PAGE_LIMIT));
      if (cursor) {
        url.searchParams.set("cursor", cursor);
      }

      const raw = await fetchJson(
        this.fetchImpl,
        url.toString(),
        this.requestTimeoutMs,
        this.maxRetries,
      );
      const parsed = getEventsResponseSchema.safeParse(raw);
      if (!parsed.success) {
        throw new Error(
          `Invalid Kalshi Get Events response: ${parsed.error.message}`,
        );
      }

      events.push(...parsed.data.events);
      page += 1;

      const nextCursor = parsed.data.cursor?.trim() ?? "";
      if (!nextCursor) {
        break;
      }
      if (seenCursors.has(nextCursor)) {
        throw new Error(
          `Kalshi pagination returned a repeated cursor: ${nextCursor}`,
        );
      }
      seenCursors.add(nextCursor);
      cursor = nextCursor;

      if (this.requestPaceMs > 0) {
        await sleep(this.requestPaceMs);
      }
    }

    console.log(`Fetched ${events.length} open event(s) across ${page} page(s).`);
    return events;
  }

  private async fetchSeriesCategories(
    events: KalshiEvent[],
  ): Promise<Map<string, string>> {
    const categories = new Map<string, string>();
    const uniqueSeries = [
      ...new Set(events.map((event) => event.series_ticker).filter(Boolean)),
    ];

    for (let index = 0; index < uniqueSeries.length; index += 1) {
      const seriesTicker = uniqueSeries[index];
      const url = `${this.baseUrl}${KALSHI_SERIES_PATH}/${encodeURIComponent(seriesTicker)}`;
      const raw = await fetchJson(
        this.fetchImpl,
        url,
        this.requestTimeoutMs,
        this.maxRetries,
      );
      const parsed = getSeriesResponseSchema.safeParse(raw);
      if (!parsed.success) {
        throw new Error(
          `Invalid Kalshi Get Series response for ${seriesTicker}: ${parsed.error.message}`,
        );
      }
      categories.set(seriesTicker, parsed.data.series.category);

      if (this.requestPaceMs > 0 && index < uniqueSeries.length - 1) {
        await sleep(this.requestPaceMs);
      }
    }

    console.log(`Resolved ${categories.size} series categor(ies).`);
    return categories;
  }
}
