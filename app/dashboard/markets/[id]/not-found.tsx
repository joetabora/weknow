import Link from "next/link";

export default function MarketNotFound() {
  return (
    <section className="animate-enter">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-cyan-700">
        Market detail
      </p>
      <h1 className="mt-3 font-display text-3xl font-semibold tracking-[-0.04em] text-slate-950">
        Market not found
      </h1>
      <p className="mt-4 max-w-xl text-sm leading-6 text-slate-600">
        No market exists for this id, or it has not been ingested yet.
      </p>
      <Link
        href="/dashboard/markets"
        className="mt-8 inline-flex text-sm text-cyan-800 transition-colors hover:text-cyan-950"
      >
        ← Back to markets
      </Link>
    </section>
  );
}
