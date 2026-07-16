import type { Metadata } from "next";

import { CalibrationChart } from "@/components/calibration/CalibrationChart";
import { CalibrationTable } from "@/components/calibration/CalibrationTable";
import { getCalibrationBuckets } from "@/lib/database/calibration";
import type { CalibrationBucket } from "@/types/market";

export const metadata: Metadata = {
  title: "Calibration",
};

export const dynamic = "force-dynamic";

export default async function CalibrationPage() {
  let buckets: CalibrationBucket[] = [];
  let loadError: string | null = null;

  try {
    buckets = await getCalibrationBuckets();
  } catch (error) {
    loadError =
      error instanceof Error
        ? error.message
        : "Unable to load calibration data from Supabase.";
  }

  const totalResolved = buckets.reduce(
    (sum, bucket) => sum + bucket.marketCount,
    0,
  );

  return (
    <section className="animate-enter">
      <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-cyan-700">
            Analysis
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-[-0.04em] text-slate-950">
            Probability Calibration
          </h1>
        </div>
        <p className="max-w-sm text-sm leading-6 text-slate-500">
          Compares the final stored YES probability of resolved markets against
          how often YES actually won. Analysis of recorded outcomes only.
        </p>
      </div>

      {loadError ? (
        <div
          role="alert"
          className="border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-800"
        >
          <p className="font-medium">Could not load calibration data</p>
          <p className="mt-1 text-rose-700">{loadError}</p>
        </div>
      ) : totalResolved === 0 ? (
        <div className="border border-dashed border-slate-300 bg-white/60 px-5 py-10 text-center text-sm text-slate-600">
          <p className="font-medium text-slate-900">No resolved markets yet</p>
          <p className="mt-2">
            Calibration appears once markets have recorded outcomes on the
            Resolved dashboard.
          </p>
        </div>
      ) : (
        <div className="space-y-12">
          <p className="text-sm text-slate-500">
            {totalResolved} resolved market{totalResolved === 1 ? "" : "s"}{" "}
            grouped into 10% probability buckets.
          </p>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:items-start">
            <CalibrationTable buckets={buckets} />
            <CalibrationChart buckets={buckets} />
          </div>
        </div>
      )}
    </section>
  );
}
