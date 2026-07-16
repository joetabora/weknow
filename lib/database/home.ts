import { getActiveJournalEntries } from "@/lib/database/journal";
import { getMarkets } from "@/lib/database/markets";
import { getResolvedMarkets } from "@/lib/database/resolutions";
import { getSupabaseClient } from "@/lib/database/supabase";
import { getWatchlist } from "@/lib/database/watchlist";
import type {
  JournalEntry,
  Market,
  ResolvedMarket,
  WatchlistItem,
} from "@/types/market";

export const HOME_SECTION_LIMIT = 8;

export function sortWatchlistByMovement(
  items: WatchlistItem[],
): WatchlistItem[] {
  return [...items].sort((a, b) => {
    const aMove =
      a.lastProbabilityChange === null
        ? -1
        : Math.abs(a.lastProbabilityChange);
    const bMove =
      b.lastProbabilityChange === null
        ? -1
        : Math.abs(b.lastProbabilityChange);
    if (aMove < 0 && bMove < 0) {
      return 0;
    }
    if (aMove < 0) {
      return 1;
    }
    if (bMove < 0) {
      return -1;
    }
    return bMove - aMove;
  });
}

export function sortMarketsEndingSoon(markets: Market[]): Market[] {
  return [...markets]
    .filter(
      (market) =>
        market.timelineStatus !== "Resolved" && market.expirationTime !== null,
    )
    .sort(
      (a, b) =>
        new Date(a.expirationTime!).getTime() -
        new Date(b.expirationTime!).getTime(),
    );
}

export function filterWatchlistNeedingResearch(
  watchlist: WatchlistItem[],
  journaledMarketIds: ReadonlySet<string>,
): WatchlistItem[] {
  return watchlist.filter((item) => !journaledMarketIds.has(item.marketId));
}

export async function getHomeWatchlistMovers(
  limit = HOME_SECTION_LIMIT,
): Promise<WatchlistItem[]> {
  const items = await getWatchlist();
  return sortWatchlistByMovement(items).slice(0, limit);
}

export async function getHomeEndingSoon(
  limit = HOME_SECTION_LIMIT,
): Promise<Market[]> {
  const markets = await getMarkets();
  return sortMarketsEndingSoon(markets).slice(0, limit);
}

export async function getHomeOpenResearch(
  limit = HOME_SECTION_LIMIT,
): Promise<JournalEntry[]> {
  const entries = await getActiveJournalEntries();
  return entries.slice(0, limit);
}

export async function getWatchlistNeedingResearch(
  limit = HOME_SECTION_LIMIT,
): Promise<WatchlistItem[]> {
  const supabase = getSupabaseClient();
  const [watchlist, journalResult] = await Promise.all([
    getWatchlist(),
    supabase.from("market_journal_entries").select("market_id"),
  ]);

  if (journalResult.error) {
    throw new Error(journalResult.error.message);
  }

  const journaledMarketIds = new Set(
    ((journalResult.data ?? []) as { market_id: string }[]).map(
      (row) => row.market_id,
    ),
  );

  return filterWatchlistNeedingResearch(watchlist, journaledMarketIds).slice(
    0,
    limit,
  );
}

export async function getHomeRecentlyResolved(
  limit = HOME_SECTION_LIMIT,
): Promise<ResolvedMarket[]> {
  const markets = await getResolvedMarkets();
  return markets.slice(0, limit);
}
