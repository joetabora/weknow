import { getSupabaseClient } from "@/lib/database/supabase";
import {
  formatUnknownError,
  getSupabaseAdminClient,
} from "@/lib/database/supabase-admin";
import type {
  JournalConfidence,
  JournalEntry,
  JournalStatus,
} from "@/types/market";

type JournalRow = {
  id: string;
  market_id: string;
  created_at: string;
  updated_at: string;
  thesis: string;
  confidence_level: JournalConfidence;
  expected_probability: number | string;
  status: JournalStatus;
  markets?:
    | {
        title: string;
      }
    | {
        title: string;
      }[]
    | null;
};

export type CreateJournalEntryInput = {
  marketId: string;
  thesis: string;
  confidenceLevel: JournalConfidence;
  expectedProbability: number;
};

function marketTitle(
  markets: JournalRow["markets"],
): string | undefined {
  if (!markets) {
    return undefined;
  }
  if (Array.isArray(markets)) {
    return markets[0]?.title;
  }
  return markets.title;
}

function mapJournalRow(row: JournalRow): JournalEntry {
  return {
    id: row.id,
    marketId: row.market_id,
    marketTitle: marketTitle(row.markets),
    thesis: row.thesis,
    confidenceLevel: row.confidence_level,
    expectedProbability: Number(row.expected_probability),
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getJournalEntriesForMarket(
  marketId: string,
): Promise<JournalEntry[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("market_journal_entries")
    .select(
      "id, market_id, created_at, updated_at, thesis, confidence_level, expected_probability, status",
    )
    .eq("market_id", marketId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as JournalRow[]).map(mapJournalRow);
}

export async function getActiveJournalEntries(): Promise<JournalEntry[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("market_journal_entries")
    .select(
      "id, market_id, created_at, updated_at, thesis, confidence_level, expected_probability, status, markets(title)",
    )
    .eq("status", "Open")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as JournalRow[]).map(mapJournalRow);
}

export async function createJournalEntry(
  input: CreateJournalEntryInput,
): Promise<JournalEntry> {
  const thesis = input.thesis.trim();
  if (!thesis) {
    throw new Error("Thesis is required.");
  }

  if (
    Number.isNaN(input.expectedProbability) ||
    input.expectedProbability < 0 ||
    input.expectedProbability > 100
  ) {
    throw new Error("Expected probability must be between 0 and 100.");
  }

  const supabase = getSupabaseAdminClient();
  const now = new Date().toISOString();

  try {
    const { data, error } = await supabase
      .from("market_journal_entries")
      .insert({
        market_id: input.marketId,
        thesis,
        confidence_level: input.confidenceLevel,
        expected_probability: input.expectedProbability,
        status: "Open",
        created_at: now,
        updated_at: now,
      })
      .select(
        "id, market_id, created_at, updated_at, thesis, confidence_level, expected_probability, status",
      )
      .single();

    if (error) {
      throw new Error(`Failed to create journal entry: ${error.message}`);
    }

    return mapJournalRow(data as JournalRow);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.startsWith("Failed to create journal entry")
    ) {
      throw error;
    }
    throw new Error(
      `Failed to create journal entry: ${formatUnknownError(error)}`,
    );
  }
}
