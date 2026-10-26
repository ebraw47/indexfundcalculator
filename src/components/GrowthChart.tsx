"use client";

import { useState, type PointerEvent } from "react";
import { formatMoney, type YearRow } from "@/lib/calculate";

type Props = {
  rows: YearRow[];
  contributed: number;
};

const W = 640;
const H = 220;
const PAD = 16;

export function GrowthChart({ rows, contributed }: Props) {
  const [active, setActive] = useState<number | null>(null);

  if (!rows.length) return null;

  const max = Math.max(...rows.map((r) => r.endBalance), contributed, 1);
  const points = rows.map((row, i) => {
    const x = PAD + (i / Math.max(rows.length - 1, 1)) * (W - PAD * 2);
    const y = H - PAD - (row.endBalance / max) * (H - PAD * 2);
    return { x, y, row };
  });
  const linePoints = points.map((p) => `${p.x},${p.y}`).join(" ");
  const area = `${PAD},${H - PAD} ${linePoints} ${W - PAD},${H - PAD}`;
  const contribY = H - PAD - (contributed / max) * (H - PAD * 2);
  const hover = active != null ? points[active] : null;

  const syncActive = (clientX: number, svg: SVGSVGElement) => {
    const rect = svg.getBoundingClientRect();
    if (rect.width <= 0) return;
    const x = ((clientX - rect.left) / rect.width) * W;
    let best = 0;
    let bestDist = Infinity;
    for (let i = 0; i < points.length; i++) {
      const dist = Math.abs(points[i].x - x);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    }
    setActive((prev) => (prev === best ? prev : best));
  };

  const onPointerMove = (e: PointerEvent<SVGSVGElement>) => {
    syncActive(e.clientX, e.currentTarget);
  };

  const tooltipLeftPct = hover ? (hover.x / W) * 100 : 0;
  const tooltipFlip = tooltipLeftPct > 68;

  return (
    <div className="growth-chart-wrap">
      <svg
        className="growth-chart"
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Portfolio growth over time. Hover or drag to inspect yearly values."
        onPointerMove={onPointerMove}
        onPointerLeave={() => setActive(null)}
        onPointerDown={onPointerMove}
      >
        <defs>
          <linearGradient id="growthFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        <rect x={0} y={0} width={W} height={H} fill="transparent" />

        <line
          x1={PAD}
          x2={W - PAD}
          y1={contribY}
          y2={contribY}
          stroke="var(--muted)"
          strokeDasharray="4 4"
          strokeWidth="1"
          pointerEvents="none"
        />
        <polygon points={area} fill="url(#growthFill)" pointerEvents="none" />
        <polyline
          points={linePoints}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          pointerEvents="none"
        />

        {hover ? (
          <g pointerEvents="none">
            <line
              x1={hover.x}
              x2={hover.x}
              y1={PAD}
              y2={H - PAD}
              stroke="rgba(255, 200, 170, 0.4)"
              strokeWidth="1"
              strokeDasharray="3 4"
            />
            <circle
              cx={hover.x}
              cy={hover.y}
              r="5.5"
              fill="var(--accent)"
              stroke="#3a241a"
              strokeWidth="2"
            />
          </g>
        ) : null}
      </svg>

      {hover ? (
        <div
          className={`growth-chart-tooltip${tooltipFlip ? " is-flip" : ""}`}
          style={{ left: `${tooltipLeftPct}%`, top: `${(hover.y / H) * 100}%` }}
          role="status"
        >
          <strong>Year {hover.row.year}</strong>
          <span>Balance {formatMoney(hover.row.endBalance)}</span>
          <span>Real {formatMoney(hover.row.endBalanceReal)}</span>
          <span>Contributed {formatMoney(hover.row.contributions)}</span>
        </div>
      ) : (
        <p className="growth-chart-hint">Hover the chart to inspect yearly values</p>
      )}
    </div>
  );
}
