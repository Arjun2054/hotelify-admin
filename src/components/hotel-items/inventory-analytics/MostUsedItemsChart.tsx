// components/hotel/inventory-analytics/MostUsedItemsChart.tsx
"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Flame } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { MostUsedItem } from "@/types/inventory-analytics-types";

const COLORS = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#eab308",
  "#84cc16",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];

export function MostUsedItemsChart({
  data,
  isLoading,
}: {
  data: MostUsedItem[];
  isLoading: boolean;
}) {
  const [showAll, setShowAll] = useState(false);
  const displayed = showAll ? data : data.slice(0, 6);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-5">
        <Skeleton className="h-6 w-44 mb-4" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-4">
          <Flame className="h-4 w-4 text-orange-500" />
          <h2 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
            Most Used Items
          </h2>
        </div>
        <p className="text-sm text-gray-400 text-center py-8">
          No usage data available
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-4">
        <Flame className="h-4 w-4 text-orange-500" />
        <h2 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
          Most Used Items
        </h2>
      </div>

      {/* Chart */}
      <div className="h-48 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data.slice(0, 8)}
            margin={{ top: 0, right: 5, left: 0, bottom: 20 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f0f0f0"
              className="dark:stroke-gray-800"
            />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 9, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
              angle={-30}
              textAnchor="end"
              dy={8}
              tickFormatter={(v) => (v.length > 12 ? v.slice(0, 12) + "…" : v)}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
            />
            <Bar dataKey="totalUsed" radius={[4, 4, 0, 0]}>
              {data.slice(0, 8).map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Ranked List */}
      <div className="space-y-2">
        {displayed.map((item, idx) => (
          <div
            key={item.itemId}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
          >
            <span
              className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                idx === 0
                  ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                  : idx === 1
                    ? "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                    : idx === 2
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      : "bg-gray-50 text-gray-400 dark:bg-gray-800/50",
              )}
            >
              {idx + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {item.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {item.categoryName}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {item.totalUsed.toLocaleString()} {item.unit}
              </p>
              <p className="text-xs text-gray-400">{item.usageCount} times</p>
            </div>
          </div>
        ))}
      </div>

      {data.length > 6 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-3 w-full py-2 text-xs text-blue-600 dark:text-blue-400 font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
        >
          {showAll ? "Show Less" : `+${data.length - 6} more items`}
        </button>
      )}
    </div>
  );
}
