// src/components/housekeeping/StatsOverview.tsx
"use client";

import { useEffect } from "react";
import {
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  BarChart3,
  Loader2,
} from "lucide-react";
import type { HousekeepingStats } from "@/types/houseKeeping-types";
import { useHousekeepingStore } from "@/store/houseKeeping/useHousekeepingStore";

interface StatsOverviewProps {
  stats: HousekeepingStats | null;
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  const { fetchItemUsage, itemUsage, fetchStats } = useHousekeepingStore();

  useEffect(() => {
    fetchStats();
    fetchItemUsage();
  }, []);

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  const completionRate =
    stats.total > 0
      ? Math.round(((stats.completed + stats.inspected) / stats.total) * 100)
      : 0;

  const statCards = [
    {
      label: "Total Tasks",
      value: stats.total,
      icon: BarChart3,
      color: "blue",
      sub: "All time",
    },
    {
      label: "Completion Rate",
      value: `${completionRate}%`,
      icon: TrendingUp,
      color: "green",
      sub: `${stats.completed + stats.inspected} completed`,
    },
    {
      label: "Today's Tasks",
      value: stats.todayTasks,
      icon: Calendar,
      color: "indigo",
      sub: "Scheduled today",
    },
    {
      label: "Overdue",
      value: stats.overdueTasks,
      icon: AlertTriangle,
      color: stats.overdueTasks > 0 ? "red" : "gray",
      sub: "Needs attention",
    },
    {
      label: "Avg. Completion",
      value: stats.avgCompletionMinutes
        ? `${stats.avgCompletionMinutes}m`
        : "—",
      icon: Clock,
      color: "purple",
      sub: "Per task",
    },
    {
      label: "Inspected",
      value: stats.inspected,
      icon: CheckCircle2,
      color: "emerald",
      sub: "Fully approved",
    },
  ];

  const colorMap: Record<
    string,
    { bg: string; icon: string; text: string; border: string }
  > = {
    blue: {
      bg: "bg-blue-50",
      icon: "bg-blue-100 text-blue-600",
      text: "text-blue-900",
      border: "border-blue-100",
    },
    green: {
      bg: "bg-green-50",
      icon: "bg-green-100 text-green-600",
      text: "text-green-900",
      border: "border-green-100",
    },
    indigo: {
      bg: "bg-indigo-50",
      icon: "bg-indigo-100 text-indigo-600",
      text: "text-indigo-900",
      border: "border-indigo-100",
    },
    red: {
      bg: "bg-red-50",
      icon: "bg-red-100 text-red-600",
      text: "text-red-900",
      border: "border-red-100",
    },
    purple: {
      bg: "bg-purple-50",
      icon: "bg-purple-100 text-purple-600",
      text: "text-purple-900",
      border: "border-purple-100",
    },
    emerald: {
      bg: "bg-emerald-50",
      icon: "bg-emerald-100 text-emerald-600",
      text: "text-emerald-900",
      border: "border-emerald-100",
    },
    gray: {
      bg: "bg-gray-50",
      icon: "bg-gray-100 text-gray-500",
      text: "text-gray-700",
      border: "border-gray-100",
    },
  };

  return (
    <div className="space-y-8">
      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, sub }) => {
          const c = colorMap[color];
          return (
            <div
              key={label}
              className={`rounded-2xl border ${c.border} ${c.bg} p-4 flex flex-col gap-3`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.icon}`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className={`text-2xl font-bold ${c.text}`}>{value}</p>
                <p className="text-sm font-medium text-gray-700 mt-0.5">
                  {label}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Status Breakdown ── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">
          Status Distribution
        </h3>
        <div className="space-y-3">
          {[
            {
              label: "Pending",
              value: stats.pending,
              color: "bg-yellow-400",
              text: "text-yellow-700",
            },
            {
              label: "In Progress",
              value: stats.inProgress,
              color: "bg-blue-500",
              text: "text-blue-700",
            },
            {
              label: "Completed",
              value: stats.completed,
              color: "bg-green-500",
              text: "text-green-700",
            },
            {
              label: "Inspected",
              value: stats.inspected,
              color: "bg-purple-500",
              text: "text-purple-700",
            },
          ].map(({ label, value, color, text }) => {
            const pct =
              stats.total > 0 ? Math.round((value / stats.total) * 100) : 0;
            return (
              <div key={label} className="flex items-center gap-3">
                <span className={`w-24 text-sm font-medium ${text} text-right`}>
                  {label}
                </span>
                <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${color} transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-16 text-right">
                  {value} ({pct}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Top Item Usage ── */}
      {itemUsage.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            Top Items Used in Housekeeping
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left pb-3 text-gray-500 font-medium">
                    Item
                  </th>
                  <th className="text-right pb-3 text-gray-500 font-medium">
                    Total Used
                  </th>
                  <th className="text-right pb-3 text-gray-500 font-medium">
                    Times
                  </th>
                  <th className="text-right pb-3 text-gray-500 font-medium">
                    Current Stock
                  </th>
                  <th className="text-right pb-3 text-gray-500 font-medium">
                    Total Cost
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {itemUsage.slice(0, 10).map((item) => (
                  <tr
                    key={item.itemId}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3">
                      <p className="font-medium text-gray-800">
                        {item.itemName}
                      </p>
                      {item.sku && (
                        <p className="text-xs text-gray-400">SKU: {item.sku}</p>
                      )}
                    </td>
                    <td className="py-3 text-right text-gray-700">
                      {item.totalUsed} {item.unit}
                    </td>
                    <td className="py-3 text-right text-gray-700">
                      {item.usageCount}x
                    </td>
                    <td className="py-3 text-right">
                      <span
                        className={`font-medium ${
                          item.currentStock < 5
                            ? "text-red-600"
                            : "text-gray-700"
                        }`}
                      >
                        {item.currentStock} {item.unit}
                      </span>
                    </td>
                    <td className="py-3 text-right text-gray-700">
                      ${item.totalCost.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
