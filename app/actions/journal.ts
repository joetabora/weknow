"use server";

import { revalidatePath } from "next/cache";

import {
  createJournalEntry,
  type CreateJournalEntryInput,
} from "@/lib/database/journal";

export async function createJournalEntryAction(
  input: CreateJournalEntryInput,
): Promise<void> {
  await createJournalEntry(input);
  revalidatePath(`/dashboard/markets/${input.marketId}`);
  revalidatePath("/dashboard/journal");
}
