import type { MarketCollector } from "@/collectors/types";
import {
  KALSHI_API_BASE_URL,
  KALSHI_EVENTS_PAGE_LIMIT,
  KALSHI_EVENTS_PATH,
  KALSHI_REQUEST_TIMEOUT_MS,
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
};

async function fetchJson(
  fetchImpl: KalshiFetch,
  url: string,
  timeoutMs: number,
): Promise<unknown> {
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

export class KalshiMarketCollector implements MarketCollector {
  private readonly baseUrl: string;
  private readonly fetchImpl: KalshiFetch;
  private readonly requestTimeoutMs: number;

  constructor(options: KalshiMarketCollectorOptions = {}) {
    this.baseUrl = (options.baseUrl ?? KALSHI_API_BASE_URL).replace(/\/$/, "");
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.requestTimeoutMs =
      options.requestTimeoutMs ?? KALSHI_REQUEST_TIMEOUT_MS;
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
      );
      const parsed = getEventsResponseSchema.safeParse(raw);
      if (!parsed.success) {
        throw new Error(
          `Invalid Kalshi Get Events response: ${parsed.error.message}`,
        );
      }

      events.push(...parsed.data.events);

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
    }

    return events;
  }

  private async fetchSeriesCategories(
    events: KalshiEvent[],
  ): Promise<Map<string, string>> {
    const categories = new Map<string, string>();
    const uniqueSeries = [
      ...new Set(events.map((event) => event.series_ticker).filter(Boolean)),
    ];

    for (const seriesTicker of uniqueSeries) {
      const url = `${this.baseUrl}${KALSHI_SERIES_PATH}/${encodeURIComponent(seriesTicker)}`;
      const raw = await fetchJson(
        this.fetchImpl,
        url,
        this.requestTimeoutMs,
      );
      const parsed = getSeriesResponseSchema.safeParse(raw);
      if (!parsed.success) {
        throw new Error(
          `Invalid Kalshi Get Series response for ${seriesTicker}: ${parsed.error.message}`,
        );
      }
      categories.set(seriesTicker, parsed.data.series.category);
    }

    return categories;
  }
}
