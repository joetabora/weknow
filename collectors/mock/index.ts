import type { CollectedMarket } from "@/types/collected-market";

import type { MarketCollector } from "@/collectors/types";

const MOCK_MARKETS: CollectedMarket[] = [
  {
    externalId: "mock-fed-cut-2026",
    title: "Will the Fed cut rates before September 2026?",
    description:
      "Resolves Yes if the Federal Reserve announces a cut to the federal funds target range before September 1, 2026.",
    category: "Economics",
    status: "open",
    yesPrice: 0.58,
    noPrice: 0.42,
    volume: 1_245_000,
    liquidity: 82_400,
  },
  {
    externalId: "mock-cpi-below-2-5",
    title: "Will US CPI print below 2.5% YoY this quarter?",
    description:
      "Based on the next official BLS CPI year-over-year release for the current quarter.",
    category: "Economics",
    status: "open",
    yesPrice: 0.31,
    noPrice: 0.69,
    volume: 486_200,
    liquidity: 41_150,
  },
  {
    externalId: "mock-climate-bill-2026",
    title: "Will a major US climate bill pass Congress in 2026?",
    description:
      "Resolves Yes if legislation primarily focused on climate or energy emissions becomes law in calendar year 2026.",
    category: "Policy",
    status: "open",
    yesPrice: 0.22,
    noPrice: 0.78,
    volume: 312_800,
    liquidity: 28_900,
  },
  {
    externalId: "mock-lunar-launch",
    title: "Will the next crewed lunar mission launch on schedule?",
    description:
      "Schedule means the publicly stated target launch window as of market open; delays of more than 30 days resolve No.",
    category: "Science",
    status: "open",
    yesPrice: 0.47,
    noPrice: 0.53,
    volume: 198_450,
    liquidity: 19_200,
  },
  {
    externalId: "mock-sp500-ath",
    title: "Will the S&P 500 hit a new all-time high this month?",
    description:
      "Resolves Yes if the S&P 500 index closes at a record high on any trading day this calendar month.",
    category: "Markets",
    status: "open",
    yesPrice: 0.64,
    noPrice: 0.36,
    volume: 2_018_700,
    liquidity: 125_000,
  },
  {
    externalId: "mock-ai-regulation",
    title: "Will federal AI safety rules be finalized this year?",
    description:
      "Resolves Yes if final (not draft) federal AI safety regulations are published in the Federal Register this calendar year.",
    category: "Policy",
    status: "open",
    yesPrice: 0.39,
    noPrice: 0.61,
    volume: 275_600,
    liquidity: 33_400,
  },
  {
    externalId: "mock-nfl-superbowl",
    title: "Will an AFC team win the next Super Bowl?",
    description:
      "Resolves based on the official Super Bowl result for the upcoming NFL season.",
    category: "Sports",
    status: "open",
    yesPrice: 0.51,
    noPrice: 0.49,
    volume: 890_100,
    liquidity: 67_800,
  },
];

export class MockMarketCollector implements MarketCollector {
  async fetchMarkets(): Promise<CollectedMarket[]> {
    return MOCK_MARKETS.map((market) => ({ ...market }));
  }
}
