import type { Market } from "@/types/market";

import { getSupabaseClient } from "@/lib/database/supabase";

type SnapshotRow = {
  yes_price: number | string;
  volume: number | string;
  captured_at: string;
};

type MarketWithSnapshotRow = {
  title: string;
  category: string;
  updated_at: string;
  market_snapshots: SnapshotRow[] | null;
};

export async function getMarkets(): Promise<Market[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("markets")
    .select(
      "title, category, updated_at, market_snapshots(yes_price, volume, captured_at)",
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

  return ((data ?? []) as MarketWithSnapshotRow[]).map((row) => {
    const latest = row.market_snapshots?.[0];

    return {
      name: row.title,
      category: row.category,
      // yes_price is a 0-1 dollar value; present it as a percentage probability.
      probability: latest ? Math.round(Number(latest.yes_price) * 100) : 0,
      volume: latest ? Number(latest.volume) : 0,
      updatedAt: latest?.captured_at ?? row.updated_at,
    };
  });
}
