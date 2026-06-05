import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp } from "lucide-react";
import type { MonthlyTrend } from "@/types/room-analytics";
import { formatCurrency } from "@/lib/utils";

interface Props {
  data: MonthlyTrend[];
  isLoading: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-xl text-sm">
      <p className="font-semibold text-gray-900 dark:text-white mb-2">
        {label}
      </p>
      {payload.map((entry: any) => (
        <div
          key={entry.dataKey}
          className="flex items-center justify-between gap-6"
        >
          <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            {entry.name}
          </span>
          <span className="font-medium text-gray-900 dark:text-white">
            {entry.dataKey === "revenue"
              ? `${formatCurrency(entry.value)}`
              : entry.dataKey === "occupancyRate"
                ? `${entry.value}%`
                : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export function RevenueLineChart({ data, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
        <Skeleton className="h-6 w-48 mb-4" />
        <Skeleton className="h-72 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-5">
        <TrendingUp className="h-4 w-4 text-blue-500" />
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          Monthly Revenue & Occupancy
        </h2>
      </div>

      <div className="h-64 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
          >
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="occupancyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
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

            {/* ✅ Updated: NPR with k suffix */}
            <YAxis
              yAxisId="revenue"
              orientation="left"
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) =>
                v >= 1000
                  ? `${formatCurrency(v / 1000)}k`
                  : `${formatCurrency(v)}` || `${v}`
              }
              width={72}
            />

            <YAxis
              yAxisId="occupancy"
              orientation="right"
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
              domain={[0, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }} />
            <Area
              yAxisId="revenue"
              type="monotone"
              dataKey="revenue"
              name="Revenue"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#revenueGrad)"
              dot={{ r: 3, fill: "#3b82f6" }}
              activeDot={{ r: 5 }}
            />
            <Area
              yAxisId="occupancy"
              type="monotone"
              dataKey="occupancyRate"
              name="Occupancy %"
              stroke="#8b5cf6"
              strokeWidth={2}
              fill="url(#occupancyGrad)"
              dot={{ r: 3, fill: "#8b5cf6" }}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
