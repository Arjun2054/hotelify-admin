// components/hotel/inventory-analytics/CategoryDistributionChart.tsx
"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Tag } from "lucide-react";
import type { CategoryDistribution } from "@/types/inventory-analytics-types";
import { formatCurrency } from "@/lib/utils";

const COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#f97316",
  "#ec4899",
  "#6366f1",
];

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as CategoryDistribution;
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-xl text-sm">
      <p className="font-semibold text-gray-900 dark:text-white mb-1">
        {d.name}
      </p>
      <div className="space-y-0.5 text-xs">
        <div className="flex justify-between gap-4">
          <span className="text-gray-500">Value</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {formatCurrency(d.totalValue)}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-500">Items</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {d.totalItems}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-500">Low Stock</span>
          <span className="font-medium text-amber-600">{d.lowStockCount}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-500">Out of Stock</span>
          <span className="font-medium text-red-600">{d.outOfStock}</span>
        </div>
      </div>
    </div>
  );
};

export function CategoryDistributionChart({
  data,
  isLoading,
}: {
  data: CategoryDistribution[];
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
        <Tag className="h-4 w-4 text-indigo-500" />
        <h2 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
          Inventory Value by Category
        </h2>
      </div>
      <div className="h-60 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 30, left: 60, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f0f0f0"
              className="dark:stroke-gray-800"
              horizontal={false}
            />
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `NPR ${(v / 1000).toFixed(0)}k`}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
              width={55}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="totalValue" radius={[0, 6, 6, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {data.map((cat, i) => (
          <div
            key={cat.categoryId}
            className="flex items-center gap-1.5 text-xs"
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: COLORS[i % COLORS.length] }}
            />
            <span className="text-gray-600 dark:text-gray-400">{cat.name}</span>
            <span className="text-gray-400">·</span>
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {cat.percentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
