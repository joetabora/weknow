import { getSupabaseClient } from "@/lib/database/supabase";
import type { MarketMover, MarketMoverWindow } from "@/types/market";

type MarketMoverRow = {
  market_id: string;
  title: string;
  current_yes_price: number | string;
  previous_yes_price: number | string;
  previous_captured_at: string;
  change_abs: number | string;
};

const LOOKBACKS: Record<MarketMoverWindow, string> = {
  "24h": "24 hours",
  "7d": "7 days",
};

function toProbability(value: number | string): number {
  return Math.round(Number(value) * 100);
}

export async function getMarketMovers(
  window: MarketMoverWindow,
  limit = 20,
): Promise<MarketMover[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc("get_market_movers", {
    lookback: LOOKBACKS[window],
    result_limit: limit,
  });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as MarketMoverRow[]).map((row) => {
    const currentYesProbability = toProbability(row.current_yes_price);
    const previousYesProbability = toProbability(row.previous_yes_price);
    const change = currentYesProbability - previousYesProbability;

    return {
      marketId: row.market_id,
      name: row.title,
      currentYesProbability,
      previousYesProbability,
      change,
      direction: Number(row.current_yes_price) > Number(row.previous_yes_price)
        ? "Increased"
        : "Decreased",
      previousCapturedAt: row.previous_captured_at,
    };
  });
}
