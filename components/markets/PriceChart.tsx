"use client";

import type { MarketPricePoint } from "@/types/market";

type PriceChartProps = {
  points: MarketPricePoint[];
  title?: string;
};

const WIDTH = 720;
const HEIGHT = 280;
const PADDING = { top: 24, right: 24, bottom: 40, left: 48 };

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "UTC",
});

export function PriceChart({
  points,
  title = "Historical yes probability",
}: PriceChartProps) {
  if (points.length < 2) {
    return (
      <div className="border border-dashed border-slate-300 bg-white/60 px-5 py-10 text-center text-sm text-slate-600">
        <p className="font-medium text-slate-900">Not enough history yet</p>
        <p className="mt-2">
          At least two snapshots are required to draw a probability chart.
          {points.length === 1
            ? " One snapshot is stored so far."
            : " No snapshots are stored yet."}
        </p>
      </div>
    );
  }

  const times = points.map((point) => new Date(point.capturedAt).getTime());
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  const timeSpan = Math.max(maxTime - minTime, 1);

  const plotWidth = WIDTH - PADDING.left - PADDING.right;
  const plotHeight = HEIGHT - PADDING.top - PADDING.bottom;

  const xFor = (time: number) =>
    PADDING.left + ((time - minTime) / timeSpan) * plotWidth;
  const yFor = (probability: number) =>
    PADDING.top + ((100 - probability) / 100) * plotHeight;

  const path = points
    .map((point, index) => {
      const x = xFor(new Date(point.capturedAt).getTime());
      const y = yFor(point.probability);
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");

  const yTicks = [0, 25, 50, 75, 100];
  const first = points[0];
  const last = points[points.length - 1];

  return (
    <figure className="border border-slate-200 bg-white/70 p-4">
      <figcaption className="mb-3 text-sm font-medium text-slate-800">
        {title}
      </figcaption>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={`${title}. Probability from ${first.probability}% to ${last.probability}% across ${points.length} snapshots.`}
        className="h-auto w-full"
      >
        <title>{title}</title>
        {yTicks.map((tick) => {
          const y = yFor(tick);
          return (
            <g key={tick}>
              <line
                x1={PADDING.left}
                x2={WIDTH - PADDING.right}
                y1={y}
                y2={y}
                stroke="#e2e8f0"
                strokeWidth={1}
              />
              <text
                x={PADDING.left - 8}
                y={y + 4}
                textAnchor="end"
                className="fill-slate-500"
                fontSize="11"
              >
                {tick}%
              </text>
            </g>
          );
        })}
        <line
          x1={PADDING.left}
          x2={PADDING.left}
          y1={PADDING.top}
          y2={HEIGHT - PADDING.bottom}
          stroke="#cbd5e1"
          strokeWidth={1}
        />
        <line
          x1={PADDING.left}
          x2={WIDTH - PADDING.right}
          y1={HEIGHT - PADDING.bottom}
          y2={HEIGHT - PADDING.bottom}
          stroke="#cbd5e1"
          strokeWidth={1}
        />
        <path d={path} fill="none" stroke="#0e7490" strokeWidth={2} />
        {points.map((point) => {
          const x = xFor(new Date(point.capturedAt).getTime());
          const y = yFor(point.probability);
          return (
            <circle
              key={`${point.capturedAt}-${point.probability}`}
              cx={x}
              cy={y}
              r={3}
              fill="#0e7490"
            >
              <title>
                {`${point.probability}% at ${timeFormatter.format(new Date(point.capturedAt))}`}
              </title>
            </circle>
          );
        })}
        <text
          x={PADDING.left}
          y={HEIGHT - 12}
          className="fill-slate-500"
          fontSize="11"
        >
          {timeFormatter.format(new Date(first.capturedAt))}
        </text>
        <text
          x={WIDTH - PADDING.right}
          y={HEIGHT - 12}
          textAnchor="end"
          className="fill-slate-500"
          fontSize="11"
        >
          {timeFormatter.format(new Date(last.capturedAt))}
        </text>
      </svg>
    </figure>
  );
}
