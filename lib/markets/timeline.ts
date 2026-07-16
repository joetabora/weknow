import type { TimelineStatus } from "@/types/market";

/** Markets expire within this window are labeled "Expiring Soon". */
export const EXPIRING_SOON_MS = 48 * 60 * 60 * 1000;

const RESOLVED_RAW_STATUSES = new Set([
  "finalized",
  "settled",
  "determined",
]);

export type TimelineInput = {
  expirationTime: string | null | undefined;
  isResolved: boolean;
  now?: Date;
};

export type TimelineResult = {
  status: TimelineStatus;
  msRemaining: number | null;
  label: string;
};

export function isResolvedMarketStatus(rawStatus: string): boolean {
  return RESOLVED_RAW_STATUSES.has(rawStatus.trim().toLowerCase());
}

function formatDuration(ms: number): string {
  const totalHours = Math.floor(ms / (60 * 60 * 1000));
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;

  if (days > 0 && hours > 0) {
    return `${days}d ${hours}h left`;
  }
  if (days > 0) {
    return `${days}d left`;
  }
  if (hours > 0) {
    return `${hours}h left`;
  }

  const minutes = Math.max(1, Math.floor(ms / (60 * 1000)));
  return `${minutes}m left`;
}

export function deriveTimeline(input: TimelineInput): TimelineResult {
  const now = input.now ?? new Date();

  if (input.isResolved) {
    return {
      status: "Resolved",
      msRemaining: null,
      label: "Resolved",
    };
  }

  if (!input.expirationTime) {
    return {
      status: "Open",
      msRemaining: null,
      label: "No date",
    };
  }

  const expirationMs = Date.parse(input.expirationTime);
  if (Number.isNaN(expirationMs)) {
    return {
      status: "Open",
      msRemaining: null,
      label: "No date",
    };
  }

  const msRemaining = expirationMs - now.getTime();

  if (msRemaining <= 0) {
    return {
      status: "Expiring Soon",
      msRemaining,
      label: "Ended",
    };
  }

  if (msRemaining <= EXPIRING_SOON_MS) {
    return {
      status: "Expiring Soon",
      msRemaining,
      label: formatDuration(msRemaining),
    };
  }

  return {
    status: "Open",
    msRemaining,
    label: formatDuration(msRemaining),
  };
}
