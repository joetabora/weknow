import type { CollectedMarket } from "@/types/collected-market";

export interface MarketCollector {
  fetchMarkets(): Promise<CollectedMarket[]>;
}
