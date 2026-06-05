import { Skeleton } from "@/components/ui/skeleton";
import { Trophy } from "lucide-react";
import { useState } from "react";
import { cn, formatCurrency } from "@/lib/utils";
import type { RoomPerformanceMetric } from "@/types/room-analytics";

interface Props {
  data: RoomPerformanceMetric[];
  isLoading: boolean;
}

type SortKey = "totalRevenue" | "occupancyRate" | "totalBookings";

const STATUS_COLORS: Record<string, string> = {
  AVAILABLE:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  OCCUPIED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  CLEANING:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  MAINTENANCE:
    "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  OUT_OF_ORDER: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export function TopRoomsTable({ data, isLoading }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("totalRevenue");
  const [showAll, setShowAll] = useState(false);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
        <Skeleton className="h-6 w-48 mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const sorted = [...data].sort((a, b) => b[sortKey] - a[sortKey]);
  const displayed = showAll ? sorted : sorted.slice(0, 8);

  const tabs: { key: SortKey; label: string }[] = [
    { key: "totalRevenue", label: "By Revenue" },
    { key: "occupancyRate", label: "By Occupancy" },
    { key: "totalBookings", label: "By Bookings" },
  ];

  const formatValue = (room: RoomPerformanceMetric) => {
    if (sortKey === "totalRevenue")
      return `$${room.totalRevenue.toLocaleString()}`;
    if (sortKey === "occupancyRate") return `${room.occupancyRate}%`;
    return `${room.totalBookings} bookings`;
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-amber-500" />
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            Room Performance Ranking
          </h2>
        </div>
        {/* Sort tabs */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSortKey(tab.key)}
              className={cn(
                "px-2.5 py-1 rounded-md text-xs font-medium transition-all",
                sortKey === tab.key
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800">
              <th className="text-left py-2.5 px-3 text-xs font-medium text-gray-500 dark:text-gray-400 w-8">
                #
              </th>
              <th className="text-left py-2.5 px-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                Room
              </th>
              <th className="text-left py-2.5 px-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                Type
              </th>
              <th className="text-left py-2.5 px-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                Status
              </th>
              <th className="text-right py-2.5 px-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                Revenue
              </th>
              <th className="text-right py-2.5 px-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                Bookings
              </th>
              <th className="text-right py-2.5 px-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                Occupancy
              </th>
              <th className="text-right py-2.5 px-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                Avg Stay
              </th>
            </tr>
          </thead>
          <tbody>
            {displayed.map((room, idx) => (
              <tr
                key={room.roomId}
                className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
              >
                <td className="py-3 px-3">
                  <span
                    className={cn(
                      "inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold",
                      idx === 0
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                        : idx === 1
                          ? "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                          : idx === 2
                            ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                            : "text-gray-400 dark:text-gray-600",
                    )}
                  >
                    {idx + 1}
                  </span>
                </td>
                <td className="py-3 px-3">
                  <span className="font-medium text-gray-900 dark:text-white">
                    Room {room.roomNumber}
                  </span>
                  <span className="text-gray-400 dark:text-gray-500 text-xs ml-1.5">
                    Floor {room.floor}
                  </span>
                </td>
                <td className="py-3 px-3 text-gray-600 dark:text-gray-400">
                  {room.roomType}
                </td>
                <td className="py-3 px-3">
                  <span
                    className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                      STATUS_COLORS[room.status] ?? "bg-gray-100 text-gray-600",
                    )}
                  >
                    {room.status.replace("_", " ")}
                  </span>
                </td>
                <td className="py-3 px-3 text-right font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(room.totalRevenue)}
                </td>
                <td className="py-3 px-3 text-right text-gray-600 dark:text-gray-400">
                  {room.totalBookings}
                </td>
                <td className="py-3 px-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-16 bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
                      <div
                        className="bg-blue-500 h-1.5 rounded-full"
                        style={{
                          width: `${Math.min(room.occupancyRate, 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400 w-8 text-right">
                      {room.occupancyRate}%
                    </span>
                  </div>
                </td>
                <td className="py-3 px-3 text-right text-gray-600 dark:text-gray-400">
                  {room.avgStayDuration}d
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="sm:hidden space-y-2">
        {displayed.map((room, idx) => (
          <div
            key={room.roomId}
            className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
          >
            <span
              className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                idx === 0
                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                  : idx === 1
                    ? "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                    : idx === 2
                      ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                      : "bg-gray-50 text-gray-400 dark:bg-gray-800/50 dark:text-gray-600",
              )}
            >
              {idx + 1}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm text-gray-900 dark:text-white">
                  Room {room.roomNumber}
                </span>
                <span
                  className={cn(
                    "text-xs px-1.5 py-0.5 rounded-full font-medium",
                    STATUS_COLORS[room.status],
                  )}
                >
                  {room.status.replace("_", " ")}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {room.roomType} · Floor {room.floor} · {room.totalBookings}{" "}
                bookings
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-semibold text-sm text-gray-900 dark:text-white">
                {formatValue(room)}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {room.occupancyRate}% occ.
              </p>
            </div>
          </div>
        ))}
      </div>

      {data.length > 8 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-4 w-full py-2.5 text-sm text-blue-600 dark:text-blue-400 font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
        >
          {showAll ? "Show Less" : `Show All ${data.length} Rooms`}
        </button>
      )}
    </div>
  );
}
