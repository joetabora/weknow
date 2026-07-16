import type {
  Market,
  MarketDetail,
  MarketPricePoint,
} from "@/types/market";

import { getSupabaseClient } from "@/lib/database/supabase";
import {
  deriveTimeline,
  isResolvedMarketStatus,
} from "@/lib/markets/timeline";

type SnapshotRow = {
  yes_price: number | string;
  no_price?: number | string;
  volume: number | string;
  liquidity?: number | string;
  captured_at: string;
};

type MarketWithSnapshotRow = {
  id: string;
  title: string;
  category: string;
  status: string;
  expiration_time: string | null;
  updated_at: string;
  market_snapshots: SnapshotRow[] | null;
};

type MarketDetailRow = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  status: string;
  expiration_time: string | null;
  created_at: string;
  updated_at: string;
  market_snapshots: SnapshotRow[] | null;
  market_resolutions:
    | { resolved_at: string }
    | { resolved_at: string }[]
    | null;
};

function toNumber(value: number | string | undefined): number {
  if (value === undefined) {
    return 0;
  }
  return Number(value);
}

function probabilityFromYesPrice(yesPrice: number | string | undefined): number {
  return Math.round(toNumber(yesPrice) * 100);
}

function resolutionTimestamp(
  resolutions: MarketDetailRow["market_resolutions"],
): string | null {
  if (!resolutions) {
    return null;
  }
  if (Array.isArray(resolutions)) {
    return resolutions[0]?.resolved_at ?? null;
  }
  return resolutions.resolved_at;
}

export async function getMarkets(): Promise<Market[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("markets")
    .select(
      "id, title, category, status, expiration_time, updated_at, market_snapshots(yes_price, volume, captured_at)",
    )
    .order("updated_at", { ascending: false })
    .order("captured_at", {
      referencedTable: "market_snapshots",
      ascending: false,
    })
    .limit(1, { referencedTable: "market_snapshots" });

  if (error) {
    throw new Error(error.message);
  }

  const now = new Date();

  return ((data ?? []) as MarketWithSnapshotRow[]).map((row) => {
    const latest = row.market_snapshots?.[0];
    const timeline = deriveTimeline({
      expirationTime: row.expiration_time,
      isResolved: isResolvedMarketStatus(row.status),
      now,
    });

    return {
      id: row.id,
      name: row.title,
      category: row.category,
      // yes_price is a 0-1 dollar value; present it as a percentage probability.
      probability: latest ? probabilityFromYesPrice(latest.yes_price) : 0,
      volume: latest ? toNumber(latest.volume) : 0,
      updatedAt: latest?.captured_at ?? row.updated_at,
      expirationTime: row.expiration_time,
      rawStatus: row.status,
      timelineStatus: timeline.status,
      timeRemainingLabel: timeline.label,
    };
  });
}

export async function getMarketById(id: string): Promise<MarketDetail | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("markets")
    .select(
      "id, title, description, category, status, expiration_time, created_at, updated_at, market_snapshots(yes_price, no_price, volume, liquidity, captured_at), market_resolutions(resolved_at)",
    )
    .eq("id", id)
    .order("captured_at", {
      referencedTable: "market_snapshots",
      ascending: false,
    })
    .limit(1, { referencedTable: "market_snapshots" })
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  const row = data as MarketDetailRow;
  const latest = row.market_snapshots?.[0];
  const resolvedAt = resolutionTimestamp(row.market_resolutions);
  const timeline = deriveTimeline({
    expirationTime: row.expiration_time,
    isResolved: Boolean(resolvedAt) || isResolvedMarketStatus(row.status),
  });

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    status: row.status,
    yesProbability: latest ? probabilityFromYesPrice(latest.yes_price) : 0,
    noProbability: latest ? probabilityFromYesPrice(latest.no_price) : 0,
    volume: latest ? toNumber(latest.volume) : 0,
    liquidity: latest ? toNumber(latest.liquidity) : 0,
    updatedAt: latest?.captured_at ?? row.updated_at,
    createdAt: row.created_at,
    expirationTime: row.expiration_time,
    resolvedAt,
    timelineStatus: timeline.status,
    timeRemainingLabel: timeline.label,
  };
}

export async function getMarketPriceHistory(
  id: string,
): Promise<MarketPricePoint[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("market_snapshots")
    .select("yes_price, volume, captured_at")
    .eq("market_id", id)
    .order("captured_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as SnapshotRow[]).map((row) => ({
    capturedAt: row.captured_at,
    probability: probabilityFromYesPrice(row.yes_price),
    volume: toNumber(row.volume),
  }));
}
