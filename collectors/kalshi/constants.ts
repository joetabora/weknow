/** Official Kalshi Trade API production base (public market data). */
export const KALSHI_API_BASE_URL =
  "https://external-api.kalshi.com/trade-api/v2";

/** Documented Get Events path. */
export const KALSHI_EVENTS_PATH = "/events";

/** Documented Get Series path prefix. */
export const KALSHI_SERIES_PATH = "/series";

/** Documented max events per page for GET /events. */
export const KALSHI_EVENTS_PAGE_LIMIT = 200;

/** Request timeout for Kalshi HTTP calls (ms). */
export const KALSHI_REQUEST_TIMEOUT_MS = 30_000;

/** Max retries after HTTP 429 (Kalshi docs recommend exponential backoff). */
export const KALSHI_MAX_RETRIES = 6;

/** Initial backoff delay for 429 retries (ms). */
export const KALSHI_RETRY_BASE_MS = 500;

/** Maximum backoff delay for 429 retries (ms). */
export const KALSHI_RETRY_MAX_MS = 30_000;

/** Pause between paginated/series requests to avoid bursting the public API. */
export const KALSHI_REQUEST_PACE_MS = 200;
