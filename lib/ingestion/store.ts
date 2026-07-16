import type { CollectedMarket } from "@/types/collected-market";

import { getSupabaseAdminClient } from "@/lib/database/supabase-admin";

export type StoreResult = {
  upserted: number;
  snapshots: number;
};

export async function storeCollectedMarkets(
  markets: CollectedMarket[],
): Promise<StoreResult> {
  const supabase = getSupabaseAdminClient();
  let upserted = 0;
  let snapshots = 0;

  for (const market of markets) {
    const now = new Date().toISOString();
    const { data: upsertedMarket, error: upsertError } = await supabase
      .from("markets")
      .upsert(
        {
          external_id: market.externalId,
          title: market.title,
          description: market.description,
          category: market.category,
          status: market.status,
          updated_at: now,
        },
        { onConflict: "external_id" },
      )
      .select("id")
      .single();

    if (upsertError) {
      throw new Error(
        `Failed to upsert market ${market.externalId}: ${upsertError.message}`,
      );
    }

    if (!upsertedMarket?.id) {
      throw new Error(
        `Failed to upsert market ${market.externalId}: missing returned id`,
      );
    }

    upserted += 1;

    const { error: snapshotError } = await supabase
      .from("market_snapshots")
      .insert({
        market_id: upsertedMarket.id,
        yes_price: market.yesPrice,
        no_price: market.noPrice,
        volume: market.volume,
        liquidity: market.liquidity,
        captured_at: market.capturedAt ?? now,
      });

    if (snapshotError) {
      throw new Error(
        `Failed to insert snapshot for ${market.externalId}: ${snapshotError.message}`,
      );
    }

    snapshots += 1;
  }

  return { upserted, snapshots };
}
