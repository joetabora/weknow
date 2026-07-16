import type { TimelineStatus } from "@/types/market";

type ResolutionTimelineProps = {
  createdAt: string;
  currentAt: string;
  expirationTime: string | null;
  resolvedAt: string | null;
  timelineStatus: TimelineStatus;
  timeRemainingLabel: string;
};

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "UTC",
  timeZoneName: "short",
});

function formatStamp(value: string | null): string {
  if (!value) {
    return "—";
  }
  return dateTimeFormatter.format(new Date(value));
}

export function ResolutionTimeline({
  createdAt,
  currentAt,
  expirationTime,
  resolvedAt,
  timelineStatus,
  timeRemainingLabel,
}: ResolutionTimelineProps) {
  return (
    <div className="border border-slate-200 bg-white/70 p-5">
      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <dt className="text-xs uppercase tracking-[0.12em] text-slate-500">
            Market created
          </dt>
          <dd className="mt-2 font-mono text-sm text-slate-950">
            {formatStamp(createdAt)}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-[0.12em] text-slate-500">
            Current date
          </dt>
          <dd className="mt-2 font-mono text-sm text-slate-950">
            {formatStamp(currentAt)}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-[0.12em] text-slate-500">
            Expiration date
          </dt>
          <dd className="mt-2 font-mono text-sm text-slate-950">
            {formatStamp(expirationTime)}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-[0.12em] text-slate-500">
            Time remaining
          </dt>
          <dd className="mt-2 text-lg text-slate-950">{timeRemainingLabel}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-[0.12em] text-slate-500">
            Timeline status
          </dt>
          <dd className="mt-2 text-lg text-slate-950">{timelineStatus}</dd>
        </div>
        {resolvedAt ? (
          <div>
            <dt className="text-xs uppercase tracking-[0.12em] text-slate-500">
              Resolved at
            </dt>
            <dd className="mt-2 font-mono text-sm text-slate-950">
              {formatStamp(resolvedAt)}
            </dd>
          </div>
        ) : null}
      </dl>
    </div>
  );
}
