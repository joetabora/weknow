export default function WatchlistLoading() {
  return (
    <section aria-label="Loading watchlist">
      <div className="mb-10 animate-pulse">
        <div className="h-3 w-28 bg-slate-200" />
        <div className="mt-4 h-10 w-56 bg-slate-200" />
      </div>
      <div className="animate-pulse border-y border-slate-200">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="grid grid-cols-[2fr_1fr_1fr_1fr_2fr_1fr] gap-6 border-t border-slate-200 py-5 first:border-t-0"
          >
            <div className="h-4 bg-slate-200" />
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
