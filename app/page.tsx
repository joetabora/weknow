import Link from "next/link";

export default function DashboardPage() {
  return (
    <section className="animate-enter">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-cyan-700">
        Phase 1
      </p>
      <h1 className="mt-4 max-w-3xl font-display text-4xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-5xl">
        Prediction market research, organized for analysis.
      </h1>
      <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
        Review stored market information in one private workspace. This phase
        uses placeholder records while the data foundation is prepared.
      </p>
      <div className="mt-9">
        <Link
          href="/dashboard/markets"
          className="inline-flex items-center bg-cyan-700 px-5 py-3 text-sm font-medium text-white transition duration-200 hover:-translate-y-0.5 hover:bg-cyan-800 focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:ring-offset-2"
        >
          View markets
          <span aria-hidden="true" className="ml-3">
            →
          </span>
        </Link>
      </div>
    </section>
  );
}
