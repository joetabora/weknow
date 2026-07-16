"use client";

import type { CalibrationBucket } from "@/types/market";

type CalibrationChartProps = {
  buckets: CalibrationBucket[];
};

const WIDTH = 480;
const HEIGHT = 480;
const PADDING = { top: 24, right: 24, bottom: 48, left: 52 };

export function CalibrationChart({ buckets }: CalibrationChartProps) {
  const points = buckets.filter(
    (
      bucket,
    ): bucket is CalibrationBucket & {
      averageImpliedProbability: number;
      actualYesRate: number;
    } =>
      bucket.marketCount > 0 &&
      bucket.averageImpliedProbability !== null &&
      bucket.actualYesRate !== null,
  );

  if (points.length === 0) {
    return (
      <div className="border border-dashed border-slate-300 bg-white/60 px-5 py-10 text-center text-sm text-slate-600">
        <p className="font-medium text-slate-900">No calibration data yet</p>
        <p className="mt-2">
          Resolve markets to compare implied probability against actual
          outcomes.
        </p>
      </div>
    );
  }

  const plotWidth = WIDTH - PADDING.left - PADDING.right;
  const plotHeight = HEIGHT - PADDING.top - PADDING.bottom;

  const xFor = (value: number) => PADDING.left + (value / 100) * plotWidth;
  const yFor = (value: number) =>
    PADDING.top + ((100 - value) / 100) * plotHeight;

  const ticks = [0, 25, 50, 75, 100];

  return (
    <figure className="border border-slate-200 bg-white/70 p-4">
      <figcaption className="mb-3 text-sm font-medium text-slate-800">
        Calibration: predicted probability vs actual outcome frequency
      </figcaption>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={`Calibration chart with ${points.length} plotted probability buckets and a perfect-calibration reference line.`}
        className="h-auto w-full"
      >
        <title>Probability calibration</title>

        {ticks.map((tick) => (
          <g key={`grid-${tick}`}>
            <line
              x1={xFor(tick)}
              x2={xFor(tick)}
              y1={PADDING.top}
              y2={HEIGHT - PADDING.bottom}
              stroke="#eef2f6"
              strokeWidth={1}
            />
            <line
              x1={PADDING.left}
              x2={WIDTH - PADDING.right}
              y1={yFor(tick)}
              y2={yFor(tick)}
              stroke="#eef2f6"
              strokeWidth={1}
            />
            <text
              x={xFor(tick)}
              y={HEIGHT - PADDING.bottom + 18}
              textAnchor="middle"
              className="fill-slate-500"
              fontSize="11"
            >
              {tick}%
            </text>
            <text
              x={PADDING.left - 8}
              y={yFor(tick) + 4}
              textAnchor="end"
              className="fill-slate-500"
              fontSize="11"
            >
              {tick}%
            </text>
          </g>
        ))}

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

        <line
          x1={xFor(0)}
          y1={yFor(0)}
          x2={xFor(100)}
          y2={yFor(100)}
          stroke="#94a3b8"
          strokeWidth={1.5}
          strokeDasharray="6 5"
        >
          <title>Perfect calibration</title>
        </line>

        {points.map((bucket) => {
          const x = xFor(bucket.averageImpliedProbability);
          const y = yFor(bucket.actualYesRate);
          return (
            <circle key={bucket.label} cx={x} cy={y} r={5} fill="#0e7490">
              <title>
                {`${bucket.label}: avg ${bucket.averageImpliedProbability}% implied, ${bucket.actualYesRate}% actual YES (${bucket.marketCount} markets)`}
              </title>
            </circle>
          );
        })}

        <text
          x={PADDING.left + plotWidth / 2}
          y={HEIGHT - 10}
          textAnchor="middle"
          className="fill-slate-600"
          fontSize="12"
        >
          Predicted probability
        </text>
        <text
          x={-(PADDING.top + plotHeight / 2)}
          y={16}
          textAnchor="middle"
          transform="rotate(-90)"
          className="fill-slate-600"
          fontSize="12"
        >
          Actual outcome frequency
        </text>
      </svg>
    </figure>
  );
}
