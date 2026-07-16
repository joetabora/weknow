import { SINGLE_USER_ID } from "@/lib/auth/single-user";
import { getSupabaseClient } from "@/lib/database/supabase";
import {
  formatUnknownError,
  getSupabaseAdminClient,
} from "@/lib/database/supabase-admin";
import type { WatchlistItem } from "@/types/market";

type SnapshotPriceRow = {
  yes_price: number | string;
  captured_at: string;
};

type WatchlistJoinRow = {
  id: string;
  market_id: string;
  created_at: string;
  notes: string;
  markets:
    | {
        title: string;
        expiration_time: string | null;
      }
    | {
        title: string;
        expiration_time: string | null;
      }[]
    | null;
};

function toProbability(value: number | string): number {
  return Math.round(Number(value) * 100);
}

function marketTitle(
  markets: WatchlistJoinRow["markets"],
): string {
  if (!markets) {
    return "Unknown market";
  }
  if (Array.isArray(markets)) {
    return markets[0]?.title ?? "Unknown market";
  }
  return markets.title;
}

function marketExpiration(
  markets: WatchlistJoinRow["markets"],
): string | null {
  if (!markets) {
    return null;
  }
  if (Array.isArray(markets)) {
    return markets[0]?.expiration_time ?? null;
  }
  return markets.expiration_time;
}

export async function isMarketWatched(marketId: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("market_watchlist")
    .select("id")
    .eq("user_id", SINGLE_USER_ID)
    .eq("market_id", marketId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return Boolean(data);
}

async function getLatestSnapshots(
  marketId: string,
): Promise<SnapshotPriceRow[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("market_snapshots")
    .select("yes_price, captured_at")
    .eq("market_id", marketId)
    .order("captured_at", { ascending: false })
    .limit(2);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as SnapshotPriceRow[];
}

function toWatchlistItem(
  row: WatchlistJoinRow,
  snapshots: SnapshotPriceRow[],
): WatchlistItem {
  const latest = snapshots[0];
  const previous = snapshots[1];
  const currentYesProbability = latest ? toProbability(latest.yes_price) : 0;
  const lastProbabilityChange =
    latest && previous
      ? currentYesProbability - toProbability(previous.yes_price)
      : null;

  return {
    id: row.id,
    marketId: row.market_id,
    title: marketTitle(row.markets),
    currentYesProbability,
    lastProbabilityChange,
    addedAt: row.created_at,
    notes: row.notes,
    expirationTime: marketExpiration(row.markets),
  };
}

export async function getWatchlist(): Promise<WatchlistItem[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("market_watchlist")
    .select("id, market_id, created_at, notes, markets(title, expiration_time)")
    .eq("user_id", SINGLE_USER_ID)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as WatchlistJoinRow[];
  const items: WatchlistItem[] = [];

  for (const row of rows) {
    const snapshots = await getLatestSnapshots(row.market_id);
    items.push(toWatchlistItem(row, snapshots));
  }

  return items;
}

export async function addToWatchlist(marketId: string): Promise<void> {
  const supabase = getSupabaseAdminClient();

  try {
    const { error } = await supabase.from("market_watchlist").upsert(
      {
        user_id: SINGLE_USER_ID,
        market_id: marketId,
        notes: "",
      },
      { onConflict: "user_id,market_id", ignoreDuplicates: true },
    );

    if (error) {
      throw new Error(`Failed to add market to watchlist: ${error.message}`);
    }
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Failed to add")) {
      throw error;
    }
    throw new Error(
      `Failed to add market to watchlist: ${formatUnknownError(error)}`,
    );
  }
}

export async function removeFromWatchlist(marketId: string): Promise<void> {
  const supabase = getSupabaseAdminClient();

  const { error } = await supabase
    .from("market_watchlist")
    .delete()
    .eq("user_id", SINGLE_USER_ID)
    .eq("market_id", marketId);

  if (error) {
    throw new Error(`Failed to remove market from watchlist: ${error.message}`);
  }
}

export async function updateWatchlistNotes(
  marketId: string,
  notes: string,
): Promise<void> {
  const supabase = getSupabaseAdminClient();

  const { error } = await supabase
    .from("market_watchlist")
    .update({ notes })
    .eq("user_id", SINGLE_USER_ID)
    .eq("market_id", marketId);

  if (error) {
    throw new Error(`Failed to update watchlist notes: ${error.message}`);
  }
}
