import { recordMarketResolution } from "@/lib/database/resolutions";
import { formatUnknownError } from "@/lib/database/supabase-admin";
import type { WinningOutcome } from "@/types/market";

function readArg(name: string): string | undefined {
  const prefix = `--${name}=`;
  const match = process.argv.find((arg) => arg.startsWith(prefix));
  return match ? match.slice(prefix.length).trim() : undefined;
}

function parseOutcome(value: string | undefined): WinningOutcome {
  const normalized = value?.trim().toLowerCase();
  if (normalized === "yes" || normalized === "no") {
    return normalized;
  }
  throw new Error('Missing or invalid --outcome. Use --outcome=yes or --outcome=no.');
}

async function main() {
  const marketId = readArg("market-id");
  if (!marketId) {
    throw new Error("Missing required --market-id=<uuid>.");
  }

  const winningOutcome = parseOutcome(readArg("outcome"));
  const resolvedAt = readArg("resolved-at");

  if (resolvedAt && Number.isNaN(Date.parse(resolvedAt))) {
    throw new Error(
      `Invalid --resolved-at="${resolvedAt}". Use an ISO timestamp.`,
    );
  }

  const recorded = await recordMarketResolution({
    marketId,
    winningOutcome,
    resolvedAt,
  });

  console.log(
    `Recorded resolution: market="${recorded.title}" outcome=${recorded.winningOutcome.toUpperCase()} finalYes=${recorded.finalYesProbability}% result=${recorded.result}`,
  );
}

main().catch((error) => {
  console.error(formatUnknownError(error));
  process.exit(1);
});
