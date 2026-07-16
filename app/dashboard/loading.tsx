function SectionSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="animate-pulse">
      <div className="h-6 w-48 bg-slate-200" />
      <div className="mt-3 h-4 w-72 bg-slate-200" />
      <div className="mt-6 border-y border-slate-200">
        {Array.from({ length: rows }).map((_, index) => (
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
    </div>
  );
}

export default function ResearchDashboardLoading() {
  return (
    <section aria-label="Loading research dashboard">
      <div className="mb-10 animate-pulse">
        <div className="h-3 w-24 bg-slate-200" />
        <div className="mt-4 h-10 w-48 bg-slate-200" />
      </div>
      <div className="space-y-14">
        <SectionSkeleton />
        <SectionSkeleton />
        <SectionSkeleton />
        <SectionSkeleton rows={3} />
        <SectionSkeleton rows={3} />
      </div>
    </section>
  );
}
