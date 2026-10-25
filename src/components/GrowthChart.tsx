"use client";

import type { YearRow } from "@/lib/calculate";

type Props = {
  rows: YearRow[];
  contributed: number;
};

export function GrowthChart({ rows, contributed }: Props) {
  if (!rows.length) return null;
  const max = Math.max(...rows.map((r) => r.endBalance), contributed, 1);
  const w = 640;
  const h = 220;
  const pad = 16;
  const points = rows.map((r, i) => {
    const x = pad + (i / Math.max(rows.length - 1, 1)) * (w - pad * 2);
    const y = h - pad - (r.endBalance / max) * (h - pad * 2);
    return `${x},${y}`;
  });
  const area = `${pad},${h - pad} ${points.join(" ")} ${w - pad},${h - pad}`;
  const contribY = h - pad - (contributed / max) * (h - pad * 2);

  return (
    <svg
      className="growth-chart"
      viewBox={`0 0 ${w} ${h}`}
      role="img"
      aria-label="Portfolio growth over time"
    >
      <defs>
        <linearGradient id="growthFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <line
        x1={pad}
        x2={w - pad}
        y1={contribY}
        y2={contribY}
        stroke="var(--muted)"
        strokeDasharray="4 4"
        strokeWidth="1"
      />
      <polygon points={area} fill="url(#growthFill)" />
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
