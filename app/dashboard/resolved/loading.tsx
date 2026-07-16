function SummarySkeleton() {
  return (
    <div className="grid animate-pulse gap-4 sm:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="border border-slate-200 px-4 py-4">
          <div className="h-3 w-24 bg-slate-200" />
          <div className="mt-3 h-8 w-12 bg-slate-200" />
        </div>
      ))}
    </div>
  );
}

export default function ResolvedLoading() {
  return (
    <section aria-label="Loading resolved markets">
      <div className="mb-10 animate-pulse">
        <div className="h-3 w-28 bg-slate-200" />
        <div className="mt-4 h-10 w-72 bg-slate-200" />
      </div>
      <SummarySkeleton />
      <div className="mt-10 animate-pulse border-y border-slate-200">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-6 border-t border-slate-200 py-5 first:border-t-0"
          >
            <div className="h-4 bg-slate-200" />
            <div className="h-4 bg-slate-200" />
            <div className="h-4 bg-slate-200" />
            <div className="h-4 bg-slate-200" />
          </div>
        ))}
      </div>
    </section>
  );
}
