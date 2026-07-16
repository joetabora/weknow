import type { Market } from "@/types/market";

import { getSupabaseClient } from "@/lib/database/supabase";

type MarketRow = {
  name: string;
  category: string;
  probability: number | string;
  volume: number | string;
  updated_at: string;
};

export async function getMarkets(): Promise<Market[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("markets")
    .select("name, category, probability, volume, updated_at")
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as MarketRow[]).map((row) => ({
    name: row.name,
    category: row.category,
    probability: Number(row.probability),
    volume: Number(row.volume),
    updatedAt: row.updated_at,
  }));
}
