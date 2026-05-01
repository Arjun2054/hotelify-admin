// components/hotel/inventory-analytics/MovementTypePieChart.tsx
"use client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity } from "lucide-react";
import type { MovementTypeBreakdown } from "@/types/inventory-analytics-types";

interface Props {
  data: MovementTypeBreakdown[];
  isLoading: boolean;
}

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
  const d = payload[0].payload as MovementTypeBreakdown;
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-xl text-sm">
      <div className="flex items-center gap-2 mb-1">
        <span
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: d.color }}
        />
        <span className="font-semibold text-gray-900 dark:text-white">
          {d.label}
        </span>
      </div>
      <p className="text-gray-500 dark:text-gray-400 text-xs">
        {d.count} movements · {d.percentage}%
      </p>
      <p className="text-gray-500 dark:text-gray-400 text-xs">
        Total qty: {d.totalQuantity.toLocaleString()}
      </p>
    </div>
  );
};

export function MovementTypePieChart({ data, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-5">
        <Skeleton className="h-6 w-40 mb-4" />
        <Skeleton className="h-52 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="h-4 w-4 text-purple-500" />
        <h2 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
          Movement Breakdown
        </h2>
      </div>

      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="label"
              cx="50%"
              cy="50%"
              outerRadius={75}
              innerRadius={35}
              labelLine={false}
              label={renderLabel}
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 space-y-1.5">
        {data.map((item) => (
          <div
            key={item.type}
            className="flex items-center justify-between text-xs"
          >
            <div className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-gray-600 dark:text-gray-400">
                {item.label}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900 dark:text-white">
                {item.count}
              </span>
              <span className="text-gray-400 w-7 text-right">
                {item.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
