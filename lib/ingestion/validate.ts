import { z } from "zod";

import type { CollectedMarket } from "@/types/collected-market";

const collectedMarketSchema = z.object({
  externalId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().nullable(),
  category: z.string().min(1),
  status: z.string().min(1),
  yesPrice: z.number().min(0).max(1),
  noPrice: z.number().min(0).max(1),
  volume: z.number().min(0),
  liquidity: z.number().min(0),
  expirationTime: z.string().min(1),
  capturedAt: z.string().datetime().optional(),
});

export function validateCollectedMarkets(
  markets: CollectedMarket[],
): CollectedMarket[] {
  const valid: CollectedMarket[] = [];
  const errors: string[] = [];

  markets.forEach((market, index) => {
    const result = collectedMarketSchema.safeParse(market);
    if (!result.success) {
      const details = result.error.issues
        .map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`)
        .join("; ");
      errors.push(
        `index ${index} (externalId=${market?.externalId ?? "unknown"}): ${details}`,
      );
      return;
    }
    valid.push(result.data);
  });

  if (errors.length > 0) {
    throw new Error(
      `Collected market validation failed for ${errors.length} row(s):\n${errors.join("\n")}`,
    );
  }

  return valid;
}
