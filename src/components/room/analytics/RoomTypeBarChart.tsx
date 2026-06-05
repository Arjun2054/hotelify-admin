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
import { BarChart2 } from "lucide-react";
import type { RoomTypePerformance } from "@/types/room-analytics";
import { formatCurrency } from "@/lib/utils";

interface Props {
  data: RoomTypePerformance[];
  isLoading: boolean;
}

const COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#f97316",
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as RoomTypePerformance;
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-xl text-sm min-w-50">
      <p className="font-semibold text-gray-900 dark:text-white mb-2">
        {d.roomTypeName}
      </p>
      <div className="space-y-1">
        <div className="flex justify-between gap-4">
          <span className="text-gray-500 dark:text-gray-400">Revenue</span>
          {/* ✅ Changed: $ → NPR */}
          <span className="font-medium text-gray-900 dark:text-white">
            {formatCurrency(d.totalRevenue)}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-500 dark:text-gray-400">Bookings</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {d.totalBookings}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-500 dark:text-gray-400">Occupancy</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {d.avgOccupancyRate}%
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-500 dark:text-gray-400">Rooms</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {d.totalRooms}
          </span>
        </div>
      </div>
    </div>
  );
};

export function RoomTypeBarChart({ data, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
        <Skeleton className="h-6 w-48 mb-4" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-5">
        <BarChart2 className="h-4 w-4 text-cyan-500" />
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          Revenue by Room Type
        </h2>
      </div>

      <div className="h-64 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 5, right: 10, left: 10, bottom: 20 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f0f0f0"
              className="dark:stroke-gray-800"
            />
            <XAxis
              dataKey="roomTypeName"
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
              angle={-20}
              textAnchor="end"
              dy={8}
            />
            {/* ✅ Changed: $0k → NPR 0k */}
            <YAxis
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) =>
                v >= 1000
                  ? ` ${formatCurrency(v / 1000)}k`
                  : ` ${formatCurrency(v)}`
              }
              width={72}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="totalRevenue" name="Revenue" radius={[6, 6, 0, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Room type summary pills */}
      <div className="mt-4 flex flex-wrap gap-2">
        {data.map((rt, i) => (
          <div
            key={rt.roomTypeId}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
            style={{
              backgroundColor: `${COLORS[i % COLORS.length]}18`,
              color: COLORS[i % COLORS.length],
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: COLORS[i % COLORS.length] }}
            />
            {rt.roomTypeName} · {rt.avgOccupancyRate}% occ.
          </div>
        ))}
      </div>
    </div>
  );
}
