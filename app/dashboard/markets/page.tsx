import type { Metadata } from "next";

import { MarketsTable } from "@/components/markets/MarketsTable";
import { placeholderMarkets } from "@/lib/database/markets";

export const metadata: Metadata = {
  title: "Markets",
};

export default function MarketsPage() {
  return (
    <section className="animate-enter">
      <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-cyan-700">
            Research dataset
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-[-0.04em] text-slate-950">
            Markets
          </h1>
        </div>
        <p className="max-w-sm text-sm leading-6 text-slate-500">
          Placeholder records for layout validation. No live market data is
          connected in Phase 1.
        </p>
      </div>

      <MarketsTable markets={placeholderMarkets} />
    </section>
  );
}
