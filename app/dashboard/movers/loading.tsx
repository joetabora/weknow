function MoversTableSkeleton() {
  return (
    <section className="animate-pulse">
      <div className="h-7 w-40 bg-slate-200" />
      <div className="mt-3 h-4 w-80 max-w-full bg-slate-200" />
      <div className="mt-5 border-y border-slate-200">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="grid grid-cols-[2fr_repeat(4,1fr)] gap-6 border-t border-slate-200 py-5 first:border-t-0"
          >
            <div className="h-4 bg-slate-200" />
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

export default function MoversLoading() {
  return (
    <section aria-label="Loading market movers">
      <div className="mb-10 animate-pulse">
        <div className="h-3 w-32 bg-slate-200" />
        <div className="mt-4 h-10 w-64 bg-slate-200" />
      </div>
      <div className="space-y-14">
        <MoversTableSkeleton />
        <MoversTableSkeleton />
      </div>
    </section>
  );
}
