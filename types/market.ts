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

export type WinningOutcome = "yes" | "no";

export type ResolutionResult = "Correct" | "Incorrect";

export type ResolvedMarket = {
  id: string;
  marketId: string;
  title: string;
  finalYesProbability: number;
  winningOutcome: WinningOutcome;
  result: ResolutionResult;
  resolvedAt: string;
};

export type ResolutionSummary = {
  total: number;
  correct: number;
  incorrect: number;
};

export type CalibrationBucket = {
  label: string;
  minProbability: number;
  maxProbability: number;
  marketCount: number;
  averageImpliedProbability: number | null;
  actualYesRate: number | null;
};

export type MarketSortField = "name" | "probability" | "volume" | "updatedAt";
export type MarketSortDirection = "asc" | "desc";
