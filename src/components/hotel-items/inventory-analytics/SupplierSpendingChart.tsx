// components/hotel/inventory-analytics/SupplierSpendingChart.tsx
"use client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Truck } from "lucide-react";
import type { SupplierSpending } from "@/types/inventory-analytics-types";

const COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#f97316",
  "#ec4899",
];
const RADIAN = Math.PI / 180;

const renderLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percentage,
}: any) => {
  if (percentage < 8) return null;
  const r = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={10}
      fontWeight={700}
    >
      {percentage}%
    </text>
  );
};

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as SupplierSpending;
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-xl text-sm">
      <p className="font-semibold text-gray-900 dark:text-white mb-1">
        {d.supplierName}
      </p>
      <div className="space-y-0.5 text-xs">
        <div className="flex justify-between gap-4">
          <span className="text-gray-500">Total Spend</span>
          <span className="font-medium">${d.totalSpend.toLocaleString()}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-500">Orders</span>
          <span className="font-medium">{d.orderCount}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-500">Share</span>
          <span className="font-medium">{d.percentage}%</span>
        </div>
      </div>
    </div>
  );
};

export function SupplierSpendingChart({
  data,
  isLoading,
}: {
  data: SupplierSpending[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-5">
        <Skeleton className="h-6 w-44 mb-4" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-4">
        <Truck className="h-4 w-4 text-blue-500" />
        <h2 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
          Supplier Spending
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="totalSpend"
                nameKey="supplierName"
                cx="50%"
                cy="50%"
                outerRadius={75}
                innerRadius={35}
                labelLine={false}
                label={renderLabel}
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-2">
          {data.slice(0, 6).map((s, i) => (
            <div
              key={s.supplierId}
              className="flex items-center justify-between gap-2 text-xs"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
                <span className="text-gray-600 dark:text-gray-400 truncate">
                  {s.supplierName}
                </span>
              </div>
              <div className="text-right shrink-0">
                <span className="font-semibold text-gray-900 dark:text-white">
                  NPR {(s.totalSpend / 1000).toFixed(1)}k
                </span>
                <span className="text-gray-400 ml-1">({s.percentage}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
