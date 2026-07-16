import type { KalshiEvent, KalshiMarket } from "@/collectors/kalshi/schemas";
import type { CollectedMarket } from "@/types/collected-market";

export function parseFixedPointNumber(
  value: string,
  fieldName: string,
): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new Error(`Invalid fixed-point value for ${fieldName}: "${value}"`);
  }
  return parsed;
}

export function buildMarketTitle(
  eventTitle: string,
  yesSubTitle: string,
): string {
  const event = eventTitle.trim();
  const yes = yesSubTitle.trim();

  if (!yes) {
    return event;
  }

  if (event.toLowerCase().includes(yes.toLowerCase())) {
    return event;
  }

  return `${event} — ${yes}`;
}

export function mapKalshiMarket(params: {
  event: Pick<KalshiEvent, "title">;
  market: KalshiMarket;
  category: string;
  capturedAt: string;
}): CollectedMarket {
  const { event, market, category, capturedAt } = params;
  const rules = market.rules_primary.trim();

  return {
    externalId: market.ticker,
    title: buildMarketTitle(event.title, market.yes_sub_title),
    description: rules.length > 0 ? rules : null,
    category,
    status: market.status,
    yesPrice: parseFixedPointNumber(market.yes_bid_dollars, "yes_bid_dollars"),
    noPrice: parseFixedPointNumber(market.no_bid_dollars, "no_bid_dollars"),
    volume: parseFixedPointNumber(market.volume_fp, "volume_fp"),
    // Official docs: liquidity_dollars is deprecated and always "0.0000".
    liquidity: 0,
    expirationTime: market.close_time,
    capturedAt,
  };
}
