export default function CalibrationLoading() {
  return (
    <section aria-label="Loading calibration analysis">
      <div className="mb-10 animate-pulse">
        <div className="h-3 w-24 bg-slate-200" />
        <div className="mt-4 h-10 w-80 max-w-full bg-slate-200" />
      </div>
      <div className="grid animate-pulse gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
        <div className="border-y border-slate-200">
          {Array.from({ length: 10 }).map((_, index) => (
            <div
              key={index}
              className="grid grid-cols-4 gap-6 border-t border-slate-200 py-4 first:border-t-0"
            >
              <div className="h-4 bg-slate-200" />
              <div className="h-4 bg-slate-200" />
              <div className="h-4 bg-slate-200" />
              <div className="h-4 bg-slate-200" />
            </div>
          ))}
        </div>
        <div className="aspect-square w-full border border-slate-200 bg-slate-100" />
      </div>
    </section>
  );
}
