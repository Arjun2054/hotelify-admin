// app/hotel/analytics/page.tsx
"use client";
import { useEffect } from "react";
import { AlertCircle, BarChart3, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRoomAnalyticsStore } from "@/store/room/roomAnalyticsStore";
import { useRoomTypeStore } from "@/store/room/roomTypeStore";
import { AnalyticsFilters } from "@/components/room/analytics/AnalyticsFilters";
import { DashboardStatsCards } from "@/components/room/analytics/DashboardStatsCards";
import { RevenueLineChart } from "@/components/room/analytics/RevenueLineChart";
import { RoomStatusPieChart } from "@/components/room/analytics/RoomStatusPieChart";
import { RoomTypeBarChart } from "@/components/room/analytics/RoomTypeBarChart";
import { OccupancyHeatmap } from "@/components/room/analytics/OccupancyHeatmap";
import { YearlyRevenueChart } from "@/components/room/analytics/earlyRevenueChart";
import { TopRoomsTable } from "@/components/room/analytics/TopRoomsTable";
import { useInventoryAnalyticsStore } from "@/store/hotel/inventoryAnalyticsStore";
import { StockValueTrendChart } from "@/components/hotel-items/inventory-analytics/StockValueTrendChart";
import { MostUsedItemsChart } from "@/components/hotel-items/inventory-analytics/MostUsedItemsChart";
import { SpendingByItemChart } from "@/components/hotel-items/inventory-analytics/SpendingByItemChart";

export default function HotelAnalyticsPage() {
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

  const {
    analytics: inventoryAnalytics,
    fetchAnalytics: fetchInventoryAnalytics,
  } = useInventoryAnalyticsStore();

  const { roomTypes, fetchRoomTypes } = useRoomTypeStore();

  useEffect(() => {
    fetchDashboard();
    fetchAnalytics();
    fetchRoomTypes();
    fetchInventoryAnalytics();
  }, []);

  const handleRefresh = () => {
    clearError();
    fetchDashboard();
    fetchAnalytics();
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setTimeout(() => fetchAnalytics(), 0);
  };

  const handleYearChange = (year: number) => {
    setYear(year);
    setTimeout(() => fetchAnalytics(), 0);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
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
                  Revenue insights & performance metrics
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading || isDashboardLoading}
              className="self-start sm:self-auto"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isLoading || isDashboardLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <AnalyticsFilters
          filters={filters}
          roomTypes={roomTypes}
          selectedYear={selectedYear}
          onFilterChange={handleFilterChange}
          onYearChange={handleYearChange}
        />

        {/* Dashboard Stats */}
        <DashboardStatsCards stats={dashboard} isLoading={isDashboardLoading} />

        {/* Charts Row 1: Revenue + Status */}
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

        {/* Charts Row 2: Room Type Bar + Heatmap */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RoomTypeBarChart
            data={analytics?.roomTypePerformance ?? []}
            isLoading={isLoading}
          />
          <OccupancyHeatmap
            data={analytics?.heatmap ?? []}
            isLoading={isLoading}
          />
        </div>

        {/* Yearly Revenue */}
        <YearlyRevenueChart
          data={analytics?.yearlyRevenue ?? []}
          isLoading={isLoading}
        />
        {/* Row 3: Stock Value Trend */}
        <StockValueTrendChart
          data={inventoryAnalytics?.stockValueTrend ?? []}
          isLoading={isLoading}
        />

        {/* Top Rooms Table */}
        <TopRoomsTable
          data={analytics?.roomPerformance ?? []}
          isLoading={isLoading}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <MostUsedItemsChart
            data={inventoryAnalytics?.mostUsedItems ?? []}
            isLoading={isLoading}
          />
          <SpendingByItemChart
            data={inventoryAnalytics?.spendingByItem ?? []}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
