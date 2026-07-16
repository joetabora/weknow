import type { MarketCollector } from "@/collectors/types";

import { storeCollectedMarkets } from "@/lib/ingestion/store";
import { validateCollectedMarkets } from "@/lib/ingestion/validate";

export type IngestionResult = {
  fetched: number;
  upserted: number;
  snapshots: number;
};

export async function runIngestion(
  collector: MarketCollector,
): Promise<IngestionResult> {
  console.log("Fetching markets from collector...");
  const fetched = await collector.fetchMarkets();
  console.log(`Fetched ${fetched.length} market(s).`);

  console.log("Validating collected markets...");
  const validated = validateCollectedMarkets(fetched);
  console.log(`Validated ${validated.length} market(s).`);

  console.log("Storing markets and creating snapshots...");
  const stored = await storeCollectedMarkets(validated);
  console.log(
    `Upserted ${stored.upserted} market(s), created ${stored.snapshots} snapshot(s).`,
  );

  return {
    fetched: fetched.length,
    upserted: stored.upserted,
    snapshots: stored.snapshots,
  };
}
