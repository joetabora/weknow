import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildCalibrationBuckets,
  type CalibrationInput,
} from "@/lib/database/calibration";

describe("buildCalibrationBuckets", () => {
  it("returns all ten buckets even when empty", () => {
    const buckets = buildCalibrationBuckets([]);
    assert.equal(buckets.length, 10);
    assert.equal(buckets[0]?.label, "0-10%");
    assert.equal(buckets[7]?.label, "70-80%");
    assert.equal(buckets[9]?.label, "90-100%");
    assert.equal(buckets[0]?.marketCount, 0);
    assert.equal(buckets[0]?.averageImpliedProbability, null);
    assert.equal(buckets[0]?.actualYesRate, null);
  });

  it("assigns prices to buckets and computes averages and rates", () => {
    const rows: CalibrationInput[] = [
      { finalYesPrice: 0.71, winningOutcome: "yes" },
      { finalYesPrice: 0.74, winningOutcome: "yes" },
      { finalYesPrice: 0.77, winningOutcome: "no" },
      { finalYesPrice: 0.79, winningOutcome: "yes" },
    ];

    const bucket = buildCalibrationBuckets(rows)[7];
    assert.equal(bucket?.label, "70-80%");
    assert.equal(bucket?.marketCount, 4);
    // Mean of 0.71, 0.74, 0.77, 0.79 = 0.7525 -> 75%.
    assert.equal(bucket?.averageImpliedProbability, 75);
    // 3 of 4 YES wins -> 75%.
    assert.equal(bucket?.actualYesRate, 75);
  });

  it("puts a 1.0 price in the last bucket, not out of range", () => {
    const buckets = buildCalibrationBuckets([
      { finalYesPrice: 1, winningOutcome: "yes" },
    ]);
    assert.equal(buckets[9]?.marketCount, 1);
    assert.equal(buckets[9]?.actualYesRate, 100);
  });

  it("uses lower-inclusive boundaries (0.1 lands in 10-20%)", () => {
    const buckets = buildCalibrationBuckets([
      { finalYesPrice: 0.1, winningOutcome: "no" },
    ]);
    assert.equal(buckets[0]?.marketCount, 0);
    assert.equal(buckets[1]?.marketCount, 1);
    assert.equal(buckets[1]?.label, "10-20%");
  });
});
