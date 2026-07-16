"use server";

import { revalidatePath } from "next/cache";

import {
  addToWatchlist,
  removeFromWatchlist,
  updateWatchlistNotes,
} from "@/lib/database/watchlist";

function revalidateWatchlistPaths(marketId: string) {
  revalidatePath("/dashboard/watchlist");
  revalidatePath(`/dashboard/markets/${marketId}`);
}

export async function addWatchlistAction(marketId: string): Promise<void> {
  await addToWatchlist(marketId);
  revalidateWatchlistPaths(marketId);
}

export async function removeWatchlistAction(marketId: string): Promise<void> {
  await removeFromWatchlist(marketId);
  revalidateWatchlistPaths(marketId);
}

export async function updateWatchlistNotesAction(
  marketId: string,
  notes: string,
): Promise<void> {
  await updateWatchlistNotes(marketId, notes);
  revalidateWatchlistPaths(marketId);
}
