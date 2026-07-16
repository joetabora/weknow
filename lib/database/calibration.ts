import { getSupabaseClient } from "@/lib/database/supabase";
import type { CalibrationBucket, WinningOutcome } from "@/types/market";

export type CalibrationInput = {
  finalYesPrice: number;
  winningOutcome: WinningOutcome;
};

type ResolutionCalibrationRow = {
  final_yes_price: number | string;
  winning_outcome: WinningOutcome;
};

const BUCKET_COUNT = 10;

function bucketLabel(min: number, max: number): string {
  return `${min * 100}-${max * 100}%`;
}

function bucketIndexForPrice(finalYesPrice: number): number {
  if (finalYesPrice >= 1) {
    return BUCKET_COUNT - 1;
  }
  if (finalYesPrice <= 0) {
    return 0;
  }
  return Math.min(Math.floor(finalYesPrice * BUCKET_COUNT), BUCKET_COUNT - 1);
}

export function buildCalibrationBuckets(
  rows: CalibrationInput[],
): CalibrationBucket[] {
  const sums = Array.from({ length: BUCKET_COUNT }, () => ({
    count: 0,
    probabilitySum: 0,
    yesWins: 0,
  }));

  for (const row of rows) {
    const price = Number(row.finalYesPrice);
    if (Number.isNaN(price)) {
      continue;
    }

    const index = bucketIndexForPrice(price);
    const bucket = sums[index];
    bucket.count += 1;
    bucket.probabilitySum += price;
    if (row.winningOutcome === "yes") {
      bucket.yesWins += 1;
    }
  }

  return sums.map((bucket, index) => {
    const min = index / BUCKET_COUNT;
    const max = (index + 1) / BUCKET_COUNT;

    return {
      label: bucketLabel(min, max),
      minProbability: min * 100,
      maxProbability: max * 100,
      marketCount: bucket.count,
      averageImpliedProbability:
        bucket.count > 0
          ? Math.round((bucket.probabilitySum / bucket.count) * 100)
          : null,
      actualYesRate:
        bucket.count > 0
          ? Math.round((bucket.yesWins / bucket.count) * 100)
          : null,
    };
  });
}

export async function getCalibrationBuckets(): Promise<CalibrationBucket[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("market_resolutions")
    .select("final_yes_price, winning_outcome");

  if (error) {
    throw new Error(error.message);
  }

  const rows = ((data ?? []) as ResolutionCalibrationRow[]).map((row) => ({
    finalYesPrice: Number(row.final_yes_price),
    winningOutcome: row.winning_outcome,
  }));

  return buildCalibrationBuckets(rows);
}
