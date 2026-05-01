// components/hotel/analytics/YearlyRevenueChart.tsx
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
import { Calendar } from "lucide-react";
import type { YearlyRevenue } from "@/types/room-analytics";

interface Props {
  data: YearlyRevenue[];
  isLoading: boolean;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as YearlyRevenue;
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-xl text-sm min-w-[180px]">
      <p className="font-semibold text-gray-900 dark:text-white mb-2">
        {d.year}
      </p>
      <div className="space-y-1">
        <div className="flex justify-between gap-4">
          <span className="text-gray-500 dark:text-gray-400">Revenue</span>
          <span className="font-medium text-gray-900 dark:text-white">
            ${d.totalRevenue.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-500 dark:text-gray-400">Bookings</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {d.totalBookings}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-500 dark:text-gray-400">Avg/Booking</span>
          <span className="font-medium text-gray-900 dark:text-white">
            ${d.avgRevenue.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export function YearlyRevenueChart({ data, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
        <Skeleton className="h-6 w-44 mb-4" />
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    );
  }

  const currentYear = new Date().getFullYear();

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-5">
        <Calendar className="h-4 w-4 text-green-500" />
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          Year-over-Year Revenue
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        {data.map((yr, i) => {
          const prev = data[i - 1];
          const growth =
            prev && prev.totalRevenue > 0
              ? Math.round(
                  ((yr.totalRevenue - prev.totalRevenue) / prev.totalRevenue) *
                    100,
                )
              : null;
          return (
            <div
              key={yr.year}
              className={`rounded-lg p-4 border ${yr.year === currentYear ? "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20" : "border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50"}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-sm font-medium ${yr.year === currentYear ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"}`}
                >
                  {yr.year}
                  {yr.year === currentYear && (
                    <span className="ml-1.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-full">
                      Current
                    </span>
                  )}
                </span>
                {growth !== null && (
                  <span
                    className={`text-xs font-medium ${growth >= 0 ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}`}
                  >
                    {growth >= 0 ? "+" : ""}
                    {growth}%
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${(yr.totalRevenue / 1000).toFixed(1)}k
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {yr.totalBookings} bookings
              </p>
            </div>
          );
        })}
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f0f0f0"
              className="dark:stroke-gray-800"
            />
            <XAxis
              dataKey="year"
              tick={{ fontSize: 12, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="totalRevenue" radius={[8, 8, 0, 0]}>
              {data.map((entry) => (
                <Cell
                  key={entry.year}
                  fill={entry.year === currentYear ? "#3b82f6" : "#93c5fd"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
