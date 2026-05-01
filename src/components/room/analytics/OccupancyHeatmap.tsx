// components/hotel/analytics/OccupancyHeatmap.tsx
"use client";
import { Skeleton } from "@/components/ui/skeleton";
import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HeatmapCell } from "@/types/room-analytics";

interface Props {
  data: HeatmapCell[];
  isLoading: boolean;
}

export function OccupancyHeatmap({ data, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
        <Skeleton className="h-6 w-44 mb-4" />
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const getColor = (intensity: number) => {
    if (intensity === 0)
      return "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600";
    if (intensity < 25)
      return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400";
    if (intensity < 50)
      return "bg-blue-200 dark:bg-blue-800/50 text-blue-800 dark:text-blue-300";
    if (intensity < 75) return "bg-blue-400 dark:bg-blue-700 text-white";
    return "bg-blue-600 dark:bg-blue-600 text-white";
  };

  const maxBookings = Math.max(...data.map((d) => d.bookings), 1);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-5">
        <Flame className="h-4 w-4 text-orange-500" />
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          Check-in Activity by Day
        </h2>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {data.map((cell) => (
          <div
            key={cell.day}
            className={cn(
              "flex flex-col items-center justify-center rounded-xl p-2 sm:p-3 transition-all",
              getColor(cell.intensity),
            )}
            title={`${cell.day}: ${cell.bookings} check-ins`}
          >
            <span className="text-[10px] sm:text-xs font-medium leading-none mb-1.5 opacity-80">
              {cell.day.slice(0, 3)}
            </span>
            <span className="text-base sm:text-xl font-bold leading-none">
              {cell.bookings}
            </span>
            <span className="text-[9px] sm:text-[10px] opacity-70 mt-1 leading-none">
              {cell.intensity}%
            </span>
          </div>
        ))}
      </div>

      {/* Scale */}
      <div className="mt-4 flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
        <span>Less</span>
        <div className="flex items-center gap-1">
          {[0, 25, 50, 75, 100].map((v) => (
            <div key={v} className={cn("w-6 h-3 rounded-sm", getColor(v))} />
          ))}
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
