export type Market = {
  id: string;
  name: string;
  category: string;
  probability: number;
  volume: number;
  updatedAt: string;
};

export type MarketDetail = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  status: string;
  yesProbability: number;
  noProbability: number;
  volume: number;
  liquidity: number;
  updatedAt: string;
};

export type MarketPricePoint = {
  capturedAt: string;
  probability: number;
  volume: number;
};

export type MarketMoverWindow = "24h" | "7d";

export type MarketMover = {
  marketId: string;
  name: string;
  currentYesProbability: number;
  previousYesProbability: number;
  change: number;
  direction: "Increased" | "Decreased";
  previousCapturedAt: string;
};

export type MarketSortField = "name" | "probability" | "volume" | "updatedAt";
export type MarketSortDirection = "asc" | "desc";
