// components/hotel/inventory-analytics/LowStockAlertsPanel.tsx
"use client";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle,
  Phone,
  Mail,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { useState } from "react";
import type { LowStockAlertsResponse } from "@/types/inventory-analytics-types";

interface Props {
  data: LowStockAlertsResponse | null;
  isLoading: boolean;
}

const severityConfig = {
  critical: {
    bg: "bg-red-50 dark:bg-red-900/20",
    border: "border-red-200 dark:border-red-800",
    badge: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
    dot: "bg-red-500",
    label: "Out of Stock",
  },
  high: {
    bg: "bg-orange-50 dark:bg-orange-900/20",
    border: "border-orange-200 dark:border-orange-800",
    badge:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400",
    dot: "bg-orange-500",
    label: "Critical Low",
  },
  medium: {
    bg: "bg-amber-50 dark:bg-amber-900/20",
    border: "border-amber-200 dark:border-amber-800",
    badge:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
    dot: "bg-amber-500",
    label: "Low Stock",
  },
};

export function LowStockAlertsPanel({ data, isLoading }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [showAll, setShowAll] = useState(false);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-5">
        <Skeleton className="h-6 w-48 mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.summary.total === 0) {
    return (
      <div className="bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-200 dark:border-green-800 p-4">
        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <p className="text-sm font-medium">
            All items are sufficiently stocked
          </p>
        </div>
      </div>
    );
  }

  const displayed = showAll ? data.alerts : data.alerts.slice(0, 6);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="text-left">
            <h2 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
              Low Stock Alerts
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {data.summary.total} items need attention
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Summary badges */}
          <div className="hidden sm:flex items-center gap-2">
            {data.summary.critical > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                {data.summary.critical} out of stock
              </span>
            )}
            {data.summary.high > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                {data.summary.high} critical
              </span>
            )}
            {data.summary.medium > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                {data.summary.medium} low
              </span>
            )}
          </div>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </button>

      {/* Mobile summary */}
      <div className="sm:hidden px-4 pb-3 flex gap-2 flex-wrap">
        {data.summary.critical > 0 && (
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
            {data.summary.critical} out of stock
          </span>
        )}
        {data.summary.high > 0 && (
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
            {data.summary.high} critical
          </span>
        )}
        {data.summary.medium > 0 && (
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
            {data.summary.medium} low stock
          </span>
        )}
      </div>

      {expanded && (
        <div className="border-t border-gray-100 dark:border-gray-800 p-4 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {displayed.map((alert) => {
              const cfg = severityConfig[alert.severity];
              return (
                <div
                  key={alert.itemId}
                  className={cn(
                    "rounded-lg border p-3 sm:p-4 transition-all hover:shadow-sm",
                    cfg.bg,
                    cfg.border,
                  )}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span
                          className={cn(
                            "w-1.5 h-1.5 rounded-full shrink-0",
                            cfg.dot,
                          )}
                        />
                        <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                          {alert.name}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 ml-3">
                        {alert.categoryName}
                        {alert.sku && ` · ${alert.sku}`}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "px-1.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap shrink-0",
                        cfg.badge,
                      )}
                    >
                      {cfg.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                    <div className="text-center p-1.5 bg-white/60 dark:bg-gray-900/40 rounded-md">
                      <p className="font-bold text-gray-900 dark:text-white">
                        {alert.stockQuantity}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400 leading-none mt-0.5">
                        Current
                      </p>
                    </div>
                    <div className="text-center p-1.5 bg-white/60 dark:bg-gray-900/40 rounded-md">
                      <p className="font-bold text-gray-900 dark:text-white">
                        {alert.reorderPoint}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400 leading-none mt-0.5">
                        Reorder
                      </p>
                    </div>
                    <div className="text-center p-1.5 bg-white/60 dark:bg-gray-900/40 rounded-md">
                      <p className="font-bold text-gray-900 dark:text-white">
                        {alert.quantityNeeded}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400 leading-none mt-0.5">
                        Needed
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Est. cost:{" "}
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {formatCurrency(alert.estimatedRestockCost)}
                      </span>
                    </span>
                    {(alert.supplierPhone || alert.supplierEmail) && (
                      <div className="flex gap-1.5">
                        {alert.supplierPhone && (
                          <a
                            href={`tel:${alert.supplierPhone}`}
                            className="p-1 rounded-md hover:bg-white/80 dark:hover:bg-gray-900/60 text-gray-500 dark:text-gray-400 transition-colors"
                            title={alert.supplierPhone}
                          >
                            <Phone className="h-3 w-3" />
                          </a>
                        )}
                        {alert.supplierEmail && (
                          <a
                            href={`mailto:${alert.supplierEmail}`}
                            className="p-1 rounded-md hover:bg-white/80 dark:hover:bg-gray-900/60 text-gray-500 dark:text-gray-400 transition-colors"
                            title={alert.supplierEmail}
                          >
                            <Mail className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {data.alerts.length > 6 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="mt-4 w-full py-2 text-sm text-blue-600 dark:text-blue-400 font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            >
              {showAll ? "Show Less" : `Show All ${data.alerts.length} Alerts`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
