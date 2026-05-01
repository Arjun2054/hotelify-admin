// src/components/room/OccupancyDonut.tsx

import { Progress } from "@/components/ui/progress";
import type { RoomStats } from "@/types/room-types";

interface OccupancyDonutProps {
  stats: RoomStats;
}

const STATUS_SEGMENTS = [
  {
    key: "occupied" as const,
    color: "#3b82f6",
    label: "Occupied",
    trackColor: "bg-blue-500",
  },
  {
    key: "available" as const,
    color: "#10b981",
    label: "Available",
    trackColor: "bg-emerald-500",
  },
  {
    key: "cleaning" as const,
    color: "#f59e0b",
    label: "Cleaning",
    trackColor: "bg-amber-500",
  },
  {
    key: "maintenance" as const,
    color: "#f97316",
    label: "Maintenance",
    trackColor: "bg-orange-500",
  },
  {
    key: "outOfOrder" as const,
    color: "#ef4444",
    label: "Out of Order",
    trackColor: "bg-red-500",
  },
];

export function OccupancyDonut({ stats }: OccupancyDonutProps) {
  const total = stats.total;

  const r = 44;
  const cx = 60;
  const cy = 60;
  const circumference = 2 * Math.PI * r;

  let cumulativeOffset = 0;
  const segments = STATUS_SEGMENTS.map((seg) => {
    const val = stats[seg.key] as number;
    const pct = total > 0 ? val / total : 0;
    const result = {
      ...seg,
      value: val,
      pct,
      dashArray: `${pct * circumference} ${circumference}`,
      dashOffset: -(cumulativeOffset * circumference),
    };
    cumulativeOffset += pct;
    return result;
  }).filter((s) => s.value > 0);

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
      {/* SVG Donut */}
      <div
        className="relative flex-shrink-0"
        style={{ width: 120, height: 120 }}
      >
        {total === 0 ? (
          <svg width={120} height={120} viewBox="0 0 120 120">
            <circle
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="14"
            />
          </svg>
        ) : (
          <svg
            width={120}
            height={120}
            viewBox="0 0 120 120"
            className="-rotate-90"
          >
            <circle
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="14"
            />
            {segments.map((seg) => (
              <circle
                key={seg.key}
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke={seg.color}
                strokeWidth="14"
                strokeDasharray={seg.dashArray}
                strokeDashoffset={seg.dashOffset}
                className="transition-all duration-700 ease-out"
              />
            ))}
          </svg>
        )}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold tabular-nums">
            {stats.occupancyRate}%
          </span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
            Occupied
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex-1 space-y-2.5 w-full">
        {STATUS_SEGMENTS.map((seg) => {
          const val = stats[seg.key] as number;
          const pct = total > 0 ? Math.round((val / total) * 100) : 0;
          return (
            <div key={seg.key} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div
                    className="h-2 w-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: seg.color }}
                  />
                  <span className="text-muted-foreground">{seg.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold tabular-nums">{val}</span>
                  <span className="text-muted-foreground w-8 text-right">
                    {pct}%
                  </span>
                </div>
              </div>
              <Progress value={pct} className="h-1" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
