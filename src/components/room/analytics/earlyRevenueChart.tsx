import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import type { YearlyRevenue } from "@/types/room-analytics";
import { formatCurrency } from "@/lib/utils";

interface Props {
  data: YearlyRevenue[];
  isLoading: boolean;
}

// ─── Helpers ────────────────────────────────────────────────────────────────
const fmt = (v: number) =>
  v >= 1_000_000
    ? `${formatCurrency(v / 1_000_000)}M`
    : v >= 1_000
      ? `${formatCurrency(v / 1_000)}k`
      : `${formatCurrency(v)}`;

const fmtFull = (v: number) => `${formatCurrency(v)}`;

// ─── Tooltip ────────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as YearlyRevenue;
  const currentYear = new Date().getFullYear();
  const isCurrentYear = d.year === currentYear;

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-2xl text-sm min-w-50">
      <div className="flex items-center justify-between mb-3">
        <span className="font-bold text-gray-900 dark:text-white text-base">
          {d.year}
        </span>
        {isCurrentYear && (
          <span className="text-[10px] font-semibold bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
            CURRENT
          </span>
        )}
      </div>
      <div className="space-y-2">
        <div className="flex justify-between gap-8">
          <span className="text-gray-500 dark:text-gray-400">Revenue</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {fmtFull(d.totalRevenue)}
          </span>
        </div>
        <div className="flex justify-between gap-8">
          <span className="text-gray-500 dark:text-gray-400">Bookings</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {d.totalBookings.toLocaleString()}
          </span>
        </div>
        <div className="pt-2 mt-2 border-t border-gray-100 dark:border-gray-800 flex justify-between gap-8">
          <span className="text-gray-500 dark:text-gray-400">Avg/Booking</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {fmtFull(d.avgRevenue)}
          </span>
        </div>
      </div>
    </div>
  );
};

// ─── Skeleton ────────────────────────────────────────────────────────────────
function ChartSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 space-y-5">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-52 w-full rounded-xl" />
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function YearlyRevenueChart({ data, isLoading }: Props) {
  const [activeYear, setActiveYear] = useState<number | null>(null);
  const currentYear = new Date().getFullYear();

  if (isLoading) return <ChartSkeleton />;

  // Compute growth rates
  const enriched = data.map((yr, i) => {
    const prev = data[i - 1];
    const growth =
      prev && prev.totalRevenue > 0
        ? Math.round(
            ((yr.totalRevenue - prev.totalRevenue) / prev.totalRevenue) * 100,
          )
        : null;
    return { ...yr, growth };
  });

  const totalRevenue = data.reduce((s, d) => s + d.totalRevenue, 0);
  const totalBookings = data.reduce((s, d) => s + d.totalBookings, 0);
  const latestGrowth = enriched[enriched.length - 1]?.growth;
  const avgRevenue = totalRevenue / data.length;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 sm:p-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-green-50 dark:bg-green-900/30 rounded-lg">
              <Calendar className="h-4 w-4 text-green-500" />
            </div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Year-over-Year Revenue
            </h2>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 ml-9">
            Cumulative performance across all years
          </p>
        </div>

        {latestGrowth !== null && latestGrowth !== undefined && (
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
              latestGrowth >= 0
                ? "bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                : "bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400"
            }`}
          >
            {latestGrowth >= 0 ? (
              <TrendingUp className="h-3.5 w-3.5" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5" />
            )}
            {latestGrowth >= 0 ? "+" : ""}
            {latestGrowth}% YoY
          </div>
        )}
      </div>

      {/* ── Summary KPIs ── */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          {
            label: "Total Revenue",
            value: fmt(totalRevenue),
            icon: DollarSign,
            color: "blue",
          },
          {
            label: "Total Bookings",
            value: totalBookings.toLocaleString(),
            icon: Calendar,
            color: "purple",
          },
          {
            label: "Avg per Year",
            value: fmt(avgRevenue),
            icon: TrendingUp,
            color: "green",
          },
        ].map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-3.5"
          >
            <div
              className={`inline-flex p-1.5 rounded-lg mb-2 ${
                color === "blue"
                  ? "bg-blue-50 dark:bg-blue-900/30"
                  : color === "purple"
                    ? "bg-purple-50 dark:bg-purple-900/30"
                    : "bg-green-50 dark:bg-green-900/30"
              }`}
            >
              <Icon
                className={`h-3.5 w-3.5 ${
                  color === "blue"
                    ? "text-blue-500"
                    : color === "purple"
                      ? "text-purple-500"
                      : "text-green-500"
                }`}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5 truncate">
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Year Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {enriched.map((yr) => {
          const isCurrent = yr.year === currentYear;
          const isActive = activeYear === yr.year;
          const isPositive = (yr.growth ?? 0) >= 0;

          return (
            <button
              key={yr.year}
              onClick={() => setActiveYear(isActive ? null : yr.year)}
              className={`text-left rounded-xl p-4 border transition-all duration-200 cursor-pointer ${
                isCurrent
                  ? "border-blue-200 dark:border-blue-800 bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20"
                  : isActive
                    ? "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800"
                    : "border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 hover:border-gray-200 dark:hover:border-gray-700"
              }`}
            >
              {/* Year + badge */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-sm font-semibold ${
                      isCurrent
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {yr.year}
                  </span>
                  {isCurrent && (
                    <span className="text-[9px] font-bold bg-blue-500 text-white px-1.5 py-0.5 rounded-full">
                      NOW
                    </span>
                  )}
                </div>

                {yr.growth !== null && (
                  <span
                    className={`flex items-center gap-0.5 text-xs font-semibold ${
                      isPositive
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-500 dark:text-red-400"
                    }`}
                  >
                    {isPositive ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    {isPositive ? "+" : ""}
                    {yr.growth}%
                  </span>
                )}
              </div>

              {/* Revenue */}
              <p
                className={`text-xl font-bold mb-1 ${
                  isCurrent
                    ? "text-blue-700 dark:text-blue-300"
                    : "text-gray-900 dark:text-white"
                }`}
              >
                {fmt(yr.totalRevenue)}
              </p>

              {/* Bookings + progress bar */}
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                {yr.totalBookings.toLocaleString()} bookings
              </p>

              <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isCurrent ? "bg-blue-500" : "bg-gray-400 dark:bg-gray-500"
                  }`}
                  style={{
                    width: `${Math.round(
                      (yr.totalRevenue /
                        Math.max(...data.map((d) => d.totalRevenue))) *
                        100,
                    )}%`,
                  }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Bar Chart ── */}
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={enriched}
            margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
            barCategoryGap="35%"
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f0f0f0"
              className="dark:stroke-gray-800"
              vertical={false}
            />
            <XAxis
              dataKey="year"
              tick={{ fontSize: 12, fill: "#9ca3af", fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={fmt}
              width={80}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "transparent" }}
            />
            <ReferenceLine
              y={avgRevenue}
              stroke="#d1d5db"
              strokeDasharray="4 4"
              label={{
                value: "Avg",
                position: "insideTopRight",
                fontSize: 10,
                fill: "#9ca3af",
              }}
            />
            <Bar dataKey="totalRevenue" radius={[8, 8, 0, 0]} maxBarSize={72}>
              {enriched.map((entry) => (
                <Cell
                  key={entry.year}
                  fill={
                    entry.year === currentYear
                      ? "#3b82f6"
                      : activeYear === entry.year
                        ? "#6366f1"
                        : "#bfdbfe"
                  }
                  opacity={activeYear && activeYear !== entry.year ? 0.45 : 1}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Chart Legend ── */}
      <div className="flex items-center justify-center gap-5 mt-3">
        {[
          { color: "#3b82f6", label: "Current Year" },
          { color: "#bfdbfe", label: "Previous Years" },
          { color: "#d1d5db", label: "Average", dashed: true },
        ].map(({ color, label, dashed }) => (
          <div key={label} className="flex items-center gap-1.5">
            {dashed ? (
              <div
                className="w-5 h-px border-t-2 border-dashed"
                style={{ borderColor: color }}
              />
            ) : (
              <span
                className="w-2.5 h-2.5 rounded-sm"
                style={{ backgroundColor: color }}
              />
            )}
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
