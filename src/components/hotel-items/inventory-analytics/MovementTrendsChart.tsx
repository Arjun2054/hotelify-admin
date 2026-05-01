// components/hotel/inventory-analytics/MovementTrendsChart.tsx
"use client";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { MovementTrend } from "@/types/inventory-analytics-types";

interface Props {
  data: MovementTrend[];
  isLoading: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-xl text-sm min-w-[200px]">
      <p className="font-semibold text-gray-900 dark:text-white mb-2">
        {label}
      </p>
      {payload.map((entry: any) => (
        <div
          key={entry.dataKey}
          className="flex justify-between gap-4 text-xs py-0.5"
        >
          <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            {entry.name}
          </span>
          <span className="font-medium text-gray-900 dark:text-white">
            {entry.dataKey === "totalSpend"
              ? `$${Number(entry.value).toLocaleString()}`
              : Number(entry.value).toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
};

type ViewMode = "quantity" | "spend";

export function MovementTrendsChart({ data, isLoading }: Props) {
  const [view, setView] = useState<ViewMode>("quantity");

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-5">
        <Skeleton className="h-6 w-48 mb-4" />
        <Skeleton className="h-72 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-blue-500" />
          <h2 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
            Stock Movement Trends
          </h2>
        </div>
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 self-start sm:self-auto">
          {(["quantity", "spend"] as ViewMode[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                "px-3 py-1 rounded-md text-xs font-medium transition-all capitalize",
                view === v
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400",
              )}
            >
              {v === "quantity" ? "Quantity" : "Spend ($)"}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
          >
            <defs>
              <linearGradient id="gradIn" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradOut" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradDmg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f0f0f0"
              className="dark:stroke-gray-800"
            />
            <XAxis
              dataKey="monthShort"
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={
                view === "spend"
                  ? (v) => `$${(v / 1000).toFixed(0)}k`
                  : undefined
              }
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />

            {view === "quantity" ? (
              <>
                <Area
                  type="monotone"
                  dataKey="stockIn"
                  name="Stock In"
                  stroke="#22c55e"
                  strokeWidth={2}
                  fill="url(#gradIn)"
                  dot={{ r: 2 }}
                />
                <Area
                  type="monotone"
                  dataKey="stockOut"
                  name="Stock Out"
                  stroke="#ef4444"
                  strokeWidth={2}
                  fill="url(#gradOut)"
                  dot={{ r: 2 }}
                />
                <Area
                  type="monotone"
                  dataKey="damage"
                  name="Damage"
                  stroke="#f97316"
                  strokeWidth={2}
                  fill="url(#gradDmg)"
                  dot={{ r: 2 }}
                />
              </>
            ) : (
              <Area
                type="monotone"
                dataKey="totalSpend"
                name="Total Spend"
                stroke="#3b82f6"
                strokeWidth={2.5}
                fill="url(#gradIn)"
                dot={{ r: 3, fill: "#3b82f6" }}
                activeDot={{ r: 5 }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
