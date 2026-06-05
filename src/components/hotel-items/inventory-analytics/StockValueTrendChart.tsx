// components/hotel/inventory-analytics/StockValueTrendChart.tsx
"use client";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart2 } from "lucide-react";
import type { StockValueTrend } from "@/types/inventory-analytics-types";
import { formatCurrency } from "@/lib/utils";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-xl text-sm">
      <p className="font-semibold text-gray-900 dark:text-white mb-2">
        {label}
      </p>
      {payload.map((p: any) => (
        <div
          key={p.dataKey}
          className="flex justify-between gap-4 text-xs py-0.5"
        >
          <span className="flex items-center gap-1.5 text-gray-500">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: p.color }}
            />
            {p.name}
          </span>
          <span className="font-medium text-gray-900 dark:text-white">
            {formatCurrency(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

export function StockValueTrendChart({
  data,
  isLoading,
}: {
  data: StockValueTrend[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-5">
        <Skeleton className="h-6 w-48 mb-4" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-5">
        <BarChart2 className="h-4 w-4 text-teal-500" />
        <h2 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
          Monthly Spend vs Consumption Value
        </h2>
      </div>

      <div className="h-60 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
          >
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
              tickFormatter={(v) => `${formatCurrency(v / 1000)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
            <ReferenceLine y={0} stroke="#e5e7eb" strokeDasharray="3 3" />
            <Bar
              dataKey="spendIn"
              name="Spend In"
              fill="#22c55e"
              radius={[4, 4, 0, 0]}
              opacity={0.8}
            />
            <Bar
              dataKey="valueOut"
              name="Value Out"
              fill="#ef4444"
              radius={[4, 4, 0, 0]}
              opacity={0.8}
            />
            <Line
              type="monotone"
              dataKey="netChange"
              name="Net Change"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
