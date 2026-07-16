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
  probability: number;
  volume: number;
  liquidity: number;
  updatedAt: string;
};

export type MarketPricePoint = {
  capturedAt: string;
  probability: number;
  volume: number;
};

export type MarketSortField = "name" | "probability" | "volume" | "updatedAt";
export type MarketSortDirection = "asc" | "desc";
