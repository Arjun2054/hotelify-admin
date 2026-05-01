// components/hotel/inventory-analytics/SpendingByItemChart.tsx
"use client";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { SpendingByItem } from "@/types/inventory-analytics-types";

export function SpendingByItemChart({
  data,
  isLoading,
}: {
  data: SpendingByItem[];
  isLoading: boolean;
}) {
  const [showAll, setShowAll] = useState(false);
  const displayed = showAll ? data : data.slice(0, 7);
  const maxSpend = data[0]?.totalSpend ?? 1;

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-5">
        <Skeleton className="h-6 w-44 mb-4" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-4">
        <DollarSign className="h-4 w-4 text-green-500" />
        <h2 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
          Top Spending Items
        </h2>
      </div>

      <div className="space-y-3">
        {displayed.map((item, idx) => (
          <div key={item.itemId}>
            <div className="flex items-center justify-between text-xs mb-1">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                    idx === 0
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
                  )}
                >
                  {idx + 1}
                </span>
                <span className="text-gray-800 dark:text-gray-200 font-medium text-sm truncate">
                  {item.name}
                </span>
                <span className="text-gray-400 shrink-0 hidden sm:inline text-xs">
                  · {item.categoryName}
                </span>
              </div>
              <div className="text-right shrink-0 ml-2">
                <span className="font-semibold text-gray-900 text-xs dark:text-white">
                  NPR {item.totalSpend.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 ml-7">
              <div
                className="bg-linear-to-r from-green-500 to-emerald-400 h-1.5 rounded-full transition-all"
                style={{
                  width: `${Math.round((item.totalSpend / maxSpend) * 100)}%`,
                }}
              />
            </div>
            <div className="ml-7 mt-0.5 flex gap-3 text-xs text-gray-400">
              <span>{item.purchaseCount} orders</span>
              <span>·</span>
              <span>
                Avg NPR {item.avgUnitCost}/{item.unit || "unit"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {data.length > 7 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-4 w-full py-2 text-xs text-blue-600 dark:text-blue-400 font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
        >
          {showAll ? "Show Less" : `Show All ${data.length} Items`}
        </button>
      )}
    </div>
  );
}
