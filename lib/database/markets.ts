import type { Market } from "@/types/market";

// Placeholder records only. Supabase queries will be added in a later phase.
export const placeholderMarkets: Market[] = [
  {
    name: "Will inflation fall below 3% this year?",
    category: "Economics",
    probability: 62,
    volume: 148250,
    updatedAt: "2026-07-16T15:12:00.000Z",
  },
  {
    name: "Will a major climate bill pass this year?",
    category: "Policy",
    probability: 41,
    volume: 86400,
    updatedAt: "2026-07-16T14:48:00.000Z",
  },
  {
    name: "Will the next lunar mission launch on schedule?",
    category: "Science",
    probability: 73,
    volume: 52750,
    updatedAt: "2026-07-16T13:30:00.000Z",
  },
];
