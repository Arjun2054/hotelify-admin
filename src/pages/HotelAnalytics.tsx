// pages / app / HotelAnalyticsPage.tsx
import { useEffect } from "react";
import { AlertCircle, BarChart3, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRoomAnalyticsStore } from "@/store/room/roomAnalyticsStore";
import { useRoomTypeStore } from "@/store/room/roomTypeStore";
import { useInventoryAnalyticsStore } from "@/store/hotel/inventoryAnalyticsStore";
import { AnalyticsFilters } from "@/components/room/analytics/AnalyticsFilters";
import { DashboardStatsCards } from "@/components/room/analytics/DashboardStatsCards";
import { RevenueLineChart } from "@/components/room/analytics/RevenueLineChart";
import { RoomStatusPieChart } from "@/components/room/analytics/RoomStatusPieChart";
import { RoomTypeBarChart } from "@/components/room/analytics/RoomTypeBarChart";
import { OccupancyHeatmap } from "@/components/room/analytics/OccupancyHeatmap";
import { TopRoomsTable } from "@/components/room/analytics/TopRoomsTable";
import { StockValueTrendChart } from "@/components/hotel-items/inventory-analytics/StockValueTrendChart";
import { MostUsedItemsChart } from "@/components/hotel-items/inventory-analytics/MostUsedItemsChart";
import { SpendingByItemChart } from "@/components/hotel-items/inventory-analytics/SpendingByItemChart";
import type { AnalyticsFilter } from "@/types/room-analytics";
import { YearlyRevenueChart } from "@/components/room/analytics/earlyRevenueChart";
import { useHousekeepingStore } from "@/store/houseKeeping/useHousekeepingStore";

export default function HotelAnalyticsPage() {
  // ─── Room analytics store ──────────────────────────────────────────────────
  const {
    dashboard,
    analytics,
    filters,
    selectedYear,
    isLoading,
    isDashboardLoading,
    error,
    fetchDashboard,
    fetchAnalytics,
    setFilters,
    setYear,
    clearError,
  } = useRoomAnalyticsStore();

  //HouseKeeping store
  useHousekeepingStore();

  // ─── Inventory analytics store ─────────────────────────────────────────────
  const {
    analytics: inventoryAnalytics,
    isLoading: isInventoryLoading,
    error: inventoryError,
    fetchAnalytics: fetchInventoryAnalytics,
    fetchDashboard: fetchInventoryDashboard,
    clearError: clearInventoryError,
  } = useInventoryAnalyticsStore();

  // ─── Room type store ────────────────────────────────────────────────────────
  const { roomTypes, fetchRoomTypes } = useRoomTypeStore();

  useEffect(() => {
    fetchDashboard();
    fetchAnalytics();
    fetchRoomTypes();
    fetchInventoryDashboard();
    fetchInventoryAnalytics();
  }, [
    fetchDashboard,
    fetchAnalytics,
    fetchRoomTypes,
    fetchInventoryDashboard,
    fetchInventoryAnalytics,
  ]);

  // ─── Refresh ────────────────────────────────────────────────────────────────
  const handleRefresh = () => {
    clearError();
    clearInventoryError(); // FIX: also clear inventory errors
    fetchDashboard();
    fetchAnalytics();
    fetchInventoryDashboard(); // FIX: refresh inventory too
    fetchInventoryAnalytics(); // FIX: refresh inventory too
  };

  // ─── Filter change ──────────────────────────────────────────────────────────
  // FIX: Pass new filters as overrides directly into fetchAnalytics instead of
  // using setTimeout. This guarantees the fetch always uses the latest values
  // regardless of React's render / Zustand flush timing.
  const handleFilterChange = (newFilters: Partial<AnalyticsFilter>) => {
    setFilters(newFilters);
    fetchAnalytics(newFilters); // override passed directly — no race condition
    // Inventory currently shares the same date range filters from the UI.
    // Pass through the date portion if present so inventory stays in sync.
    fetchInventoryAnalytics({
      startDate: newFilters.startDate,
      endDate: newFilters.endDate,
    });
  };

  const handleYearChange = (year: number) => {
    // Clear existing date overrides so the year selection takes effect.
    setFilters({ startDate: undefined, endDate: undefined });
    setYear(year);

    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year, 11, 31);

    // Pass explicit dates as overrides so neither store reads stale state.
    fetchAnalytics({ startDate: yearStart, endDate: yearEnd });
    fetchInventoryAnalytics({ startDate: yearStart, endDate: yearEnd });
  };

  // Combined loading / error states for the Refresh button indicator.
  const anyLoading = isLoading || isDashboardLoading || isInventoryLoading;
  const combinedError = error ?? inventoryError;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Hotel Analytics
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Revenue insights &amp; performance metrics
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={anyLoading}
              className="self-start sm:self-auto"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${anyLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* ── Error alerts ────────────────────────────────────────────────── */}
        {/* FIX: show both room and inventory errors */}
        {combinedError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{combinedError}</AlertDescription>
          </Alert>
        )}

        {/* ── Filters ─────────────────────────────────────────────────────── */}

        {/* ── Dashboard stats ──────────────────────────────────────────────── */}
        <DashboardStatsCards stats={dashboard} isLoading={isDashboardLoading} />

        <AnalyticsFilters
          filters={filters}
          roomTypes={roomTypes}
          selectedYear={selectedYear}
          onFilterChange={handleFilterChange}
          onYearChange={handleYearChange}
        />

        {/* ── Row 1: Revenue line + Room status pie ───────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RevenueLineChart
              data={analytics?.monthlyTrends ?? []}
              isLoading={isLoading}
            />
          </div>
          <div>
            <RoomStatusPieChart
              data={analytics?.statusDistribution ?? []}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* ── Row 2: Room type bar + Occupancy heatmap ────────────────────── */}

        <RoomTypeBarChart
          data={analytics?.roomTypePerformance ?? []}
          isLoading={isLoading}
        />
        <OccupancyHeatmap
          data={analytics?.heatmap ?? []}
          isLoading={isLoading}
        />

        {/* ── Yearly revenue ──────────────────────────────────────────────── */}
        <YearlyRevenueChart
          data={analytics?.yearlyRevenue ?? []}
          isLoading={isLoading}
        />

        {/* ── Stock value trend ────────────────────────────────────────────── */}
        {/* FIX: use isInventoryLoading — not the room-analytics isLoading */}
        <StockValueTrendChart
          data={inventoryAnalytics?.stockValueTrend ?? []}
          isLoading={isInventoryLoading}
        />

        {/* ── Top rooms table ──────────────────────────────────────────────── */}
        <TopRoomsTable
          data={analytics?.roomPerformance ?? []}
          isLoading={isLoading}
        />

        {/* ── Inventory charts ─────────────────────────────────────────────── */}
        {/* FIX: use isInventoryLoading for both inventory charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <MostUsedItemsChart
            data={inventoryAnalytics?.mostUsedItems ?? []}
            isLoading={isInventoryLoading}
          />
          <SpendingByItemChart
            data={inventoryAnalytics?.spendingByItem ?? []}
            isLoading={isInventoryLoading}
          />
        </div>
      </div>
    </div>
  );
}
