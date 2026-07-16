import { getSupabaseClient } from "@/lib/database/supabase";
import {
  formatUnknownError,
  getSupabaseAdminClient,
} from "@/lib/database/supabase-admin";
import type {
  ResolutionResult,
  ResolutionSummary,
  ResolvedMarket,
  WinningOutcome,
} from "@/types/market";

type ResolvedMarketRow = {
  id: string;
  market_id: string;
  resolved_at: string;
  winning_outcome: WinningOutcome;
  final_yes_price: number | string;
  final_no_price: number | string;
  markets:
    | {
        title: string;
      }
    | {
        title: string;
      }[]
    | null;
};

export type RecordMarketResolutionInput = {
  marketId: string;
  winningOutcome: WinningOutcome;
  resolvedAt?: string;
};

function toProbability(value: number | string): number {
  return Math.round(Number(value) * 100);
}

export function compareProbabilityToOutcome(
  finalYesPrice: number,
  winningOutcome: WinningOutcome,
): ResolutionResult {
  const impliedYes = finalYesPrice >= 0.5;
  const outcomeYes = winningOutcome === "yes";

  return impliedYes === outcomeYes ? "Correct" : "Incorrect";
}

export function getResolutionSummary(
  rows: ResolvedMarket[],
): ResolutionSummary {
  let correct = 0;
  let incorrect = 0;

  for (const row of rows) {
    if (row.result === "Correct") {
      correct += 1;
    } else {
      incorrect += 1;
    }
  }

  return {
    total: rows.length,
    correct,
    incorrect,
  };
}

function marketTitle(
  markets: ResolvedMarketRow["markets"],
): string {
  if (!markets) {
    return "Unknown market";
  }
  if (Array.isArray(markets)) {
    return markets[0]?.title ?? "Unknown market";
  }
  return markets.title;
}

export async function getResolvedMarkets(): Promise<ResolvedMarket[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("market_resolutions")
    .select(
      "id, market_id, resolved_at, winning_outcome, final_yes_price, final_no_price, markets(title)",
    )
    .order("resolved_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as ResolvedMarketRow[]).map((row) => {
    const finalYesPrice = Number(row.final_yes_price);

    return {
      id: row.id,
      marketId: row.market_id,
      title: marketTitle(row.markets),
      finalYesProbability: toProbability(row.final_yes_price),
      winningOutcome: row.winning_outcome,
      result: compareProbabilityToOutcome(finalYesPrice, row.winning_outcome),
      resolvedAt: row.resolved_at,
    };
  });
}

export async function recordMarketResolution(
  input: RecordMarketResolutionInput,
): Promise<ResolvedMarket> {
  const supabase = getSupabaseAdminClient();
  const resolvedAt = input.resolvedAt ?? new Date().toISOString();

  const { data: snapshot, error: snapshotError } = await supabase
    .from("market_snapshots")
    .select("yes_price, no_price")
    .eq("market_id", input.marketId)
    .order("captured_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (snapshotError) {
    throw new Error(
      `Failed to load latest snapshot for ${input.marketId}: ${snapshotError.message}`,
    );
  }

  if (!snapshot) {
    throw new Error(
      `Cannot record resolution for ${input.marketId}: no market_snapshots row found.`,
    );
  }

  try {
    const { data, error } = await supabase
      .from("market_resolutions")
      .upsert(
        {
          market_id: input.marketId,
          resolved_at: resolvedAt,
          winning_outcome: input.winningOutcome,
          final_yes_price: Number(snapshot.yes_price),
          final_no_price: Number(snapshot.no_price),
        },
        { onConflict: "market_id" },
      )
      .select(
        "id, market_id, resolved_at, winning_outcome, final_yes_price, final_no_price, markets(title)",
      )
      .single();

    if (error) {
      throw new Error(
        `Failed to record resolution for ${input.marketId}: ${error.message}`,
      );
    }

    const row = data as ResolvedMarketRow;
    const finalYesPrice = Number(row.final_yes_price);

    return {
      id: row.id,
      marketId: row.market_id,
      title: marketTitle(row.markets),
      finalYesProbability: toProbability(row.final_yes_price),
      winningOutcome: row.winning_outcome,
      result: compareProbabilityToOutcome(finalYesPrice, row.winning_outcome),
      resolvedAt: row.resolved_at,
    };
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Failed to record")) {
      throw error;
    }
    throw new Error(
      `Failed to record resolution for ${input.marketId}: ${formatUnknownError(error)}`,
    );
  }
}
