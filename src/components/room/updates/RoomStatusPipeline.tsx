// src/components/room/RoomStatusPipeline.tsx
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { RoomStats } from "@/types/room-types";

interface RoomStatusPipelineProps {
  stats: RoomStats;
  onStatusFilter: (status: string) => void;
  activeStatus?: string;
}

const PIPELINE = [
  {
    status: "AVAILABLE",
    key: "available" as const,
    label: "Available",
    color: "#10b981",
    gradient: "from-emerald-500/10 to-transparent",
    border: "border-emerald-200 dark:border-emerald-800",
    activeBorder: "ring-2 ring-emerald-500",
    text: "text-emerald-700 dark:text-emerald-400",
    dot: "bg-emerald-500",
    bar: "bg-emerald-500",
    barBg: "bg-emerald-100 dark:bg-emerald-900/50",
  },
  {
    status: "OCCUPIED",
    key: "occupied" as const,
    label: "Occupied",
    color: "#3b82f6",
    gradient: "from-blue-500/10 to-transparent",
    border: "border-blue-200 dark:border-blue-800",
    activeBorder: "ring-2 ring-blue-500",
    text: "text-blue-700 dark:text-blue-400",
    dot: "bg-blue-500",
    bar: "bg-blue-500",
    barBg: "bg-blue-100 dark:bg-blue-900/50",
  },
  {
    status: "CLEANING",
    key: "cleaning" as const,
    label: "Cleaning",
    color: "#f59e0b",
    gradient: "from-amber-500/10 to-transparent",
    border: "border-amber-200 dark:border-amber-800",
    activeBorder: "ring-2 ring-amber-500",
    text: "text-amber-700 dark:text-amber-400",
    dot: "bg-amber-500",
    bar: "bg-amber-500",
    barBg: "bg-amber-100 dark:bg-amber-900/50",
  },
  {
    status: "MAINTENANCE",
    key: "maintenance" as const,
    label: "Maintenance",
    color: "#f97316",
    gradient: "from-orange-500/10 to-transparent",
    border: "border-orange-200 dark:border-orange-800",
    activeBorder: "ring-2 ring-orange-500",
    text: "text-orange-700 dark:text-orange-400",
    dot: "bg-orange-500",
    bar: "bg-orange-500",
    barBg: "bg-orange-100 dark:bg-orange-900/50",
  },
  {
    status: "OUT_OF_ORDER",
    key: "outOfOrder" as const,
    label: "Out of Order",
    color: "#ef4444",
    gradient: "from-red-500/10 to-transparent",
    border: "border-red-200 dark:border-red-800",
    activeBorder: "ring-2 ring-red-500",
    text: "text-red-700 dark:text-red-400",
    dot: "bg-red-500",
    bar: "bg-red-500",
    barBg: "bg-red-100 dark:bg-red-900/50",
  },
] as const;

export function RoomStatusPipeline({
  stats,
  onStatusFilter,
  activeStatus,
}: RoomStatusPipelineProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {PIPELINE.map((item) => {
        const count = stats[item.key];
        const pct =
          stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
        const isActive = activeStatus === item.status;

        return (
          <button
            key={item.status}
            onClick={() => onStatusFilter(isActive ? "" : item.status)}
            className={cn(
              "relative overflow-hidden rounded-xl border p-3.5 text-left transition-all duration-200",
              "bg-card hover:shadow-sm",
              isActive ? item.activeBorder + " " + item.border : item.border,
              isActive ? "shadow-sm" : "hover:border-border",
            )}
          >
            <div
              className={cn(
                "absolute inset-0 bg-gradient-to-b opacity-40",
                item.gradient,
              )}
            />
            <div className="relative space-y-2">
              <div className="flex items-center justify-between">
                <div
                  className={cn(
                    "h-2 w-2 rounded-full",
                    isActive ? item.dot + " animate-pulse" : item.dot,
                  )}
                />
                <span className={cn("text-xs font-medium", item.text)}>
                  {pct}%
                </span>
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums">{count}</p>
                <p className={cn("text-xs font-medium mt-0.5", item.text)}>
                  {item.label}
                </p>
              </div>
              <div className={cn("h-1 rounded-full", item.barBg)}>
                <div
                  className={cn(
                    "h-1 rounded-full transition-all duration-700",
                    item.bar,
                  )}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
