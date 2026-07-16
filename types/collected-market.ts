export type CollectedMarket = {
  externalId: string;
  title: string;
  description: string | null;
  category: string;
  status: string;
  yesPrice: number;
  noPrice: number;
  volume: number;
  liquidity: number;
  capturedAt?: string;
};
