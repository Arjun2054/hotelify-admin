// components/hotel/inventory-analytics/InventoryAnalyticsFilters.tsx
"use client";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { InventoryAnalyticsFilter } from "@/types/inventory-analytics-types";

interface Props {
  filters: InventoryAnalyticsFilter;
  selectedYear: number;
  onFilterChange: (f: Partial<InventoryAnalyticsFilter>) => void;
  onYearChange: (y: number) => void;
}

export function InventoryAnalyticsFilters({
  filters,
  selectedYear,
  onFilterChange,
  onYearChange,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const currentYear = new Date().getFullYear();
  const years = [currentYear - 2, currentYear - 1, currentYear];
  const hasActive = !!(
    filters.categoryId ||
    filters.startDate ||
    filters.supplierId
  );

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-3 sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Year tabs */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 hidden sm:block">
            Year:
          </span>
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {years.map((yr) => (
              <button
                key={yr}
                onClick={() => onYearChange(yr)}
                className={cn(
                  "px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all",
                  selectedYear === yr
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700",
                )}
              >
                {yr}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasActive && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                onFilterChange({
                  categoryId: undefined,
                  startDate: undefined,
                  endDate: undefined,
                  supplierId: undefined,
                })
              }
              className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 h-8 px-2"
            >
              <X className="h-3.5 w-3.5 mr-1" /> Clear
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="h-8"
          >
            <Filter className="h-3.5 w-3.5 mr-1.5" />
            <span className="hidden sm:inline">Filters</span>
            {hasActive && (
              <span className="ml-1.5 w-1.5 h-1.5 rounded-full bg-blue-500" />
            )}
          </Button>
        </div>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={
                filters.startDate
                  ? filters.startDate.toISOString().split("T")[0]
                  : ""
              }
              onChange={(e) =>
                onFilterChange({
                  startDate: e.target.value
                    ? new Date(e.target.value)
                    : undefined,
                })
              }
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={
                filters.endDate
                  ? filters.endDate.toISOString().split("T")[0]
                  : ""
              }
              onChange={(e) =>
                onFilterChange({
                  endDate: e.target.value
                    ? new Date(e.target.value)
                    : undefined,
                })
              }
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              View Mode
            </label>
            <select
              value={filters.categoryId ?? ""}
              onChange={(e) =>
                onFilterChange({ categoryId: e.target.value || undefined })
              }
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
