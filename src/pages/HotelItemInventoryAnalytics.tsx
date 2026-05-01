// app/hotel/inventory/analytics/page.tsx
"use client";
import { useEffect } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, Package, RefreshCw } from "lucide-react";
import { useInventoryAnalyticsStore } from "@/store/hotel/inventoryAnalyticsStore";
import { InventoryAnalyticsFilters } from "@/components/hotel-items/inventory-analytics/InventoryAnalyticsFilters";
import { InventoryStatsCards } from "@/components/hotel-items/inventory-analytics/InventoryStatsCards";
import { LowStockAlertsPanel } from "@/components/hotel-items/inventory-analytics/LowStockAlertsPanel";
import { MovementTrendsChart } from "@/components/hotel-items/inventory-analytics/MovementTrendsChart";
import { MovementTypePieChart } from "@/components/hotel-items/inventory-analytics/MovementTypePieChart";
import { CategoryDistributionChart } from "@/components/hotel-items/inventory-analytics/CategoryDistributionChart";
import { SupplierSpendingChart } from "@/components/hotel-items/inventory-analytics/SupplierSpendingChart";
import { StockValueTrendChart } from "@/components/hotel-items/inventory-analytics/StockValueTrendChart";
import { MostUsedItemsChart } from "@/components/hotel-items/inventory-analytics/MostUsedItemsChart";
import { SpendingByItemChart } from "@/components/hotel-items/inventory-analytics/SpendingByItemChart";

export default function InventoryAnalyticsPage() {
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
    refresh,
  } = useInventoryAnalyticsStore();

  useEffect(() => {
    fetchDashboard();
    fetchAnalytics();
  }, []);

  const handleFilterChange = (f: any) => {
    setFilters(f);
    setTimeout(() => fetchAnalytics(), 0);
  };

  const handleYearChange = (y: number) => {
    setYear(y);
    setTimeout(() => fetchAnalytics(), 0);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <Package className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  Inventory Analytics
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  Stock insights & spending analysis
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refresh}
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

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              {error}
              <button onClick={clearError} className="ml-4 underline text-xs">
                Dismiss
              </button>
            </AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <InventoryAnalyticsFilters
          filters={filters}
          selectedYear={selectedYear}
          onFilterChange={handleFilterChange}
          onYearChange={handleYearChange}
        />

        {/* KPI Cards */}
        <InventoryStatsCards stats={dashboard} isLoading={isDashboardLoading} />

        {/* Low Stock Alerts - prominent placement */}
        <LowStockAlertsPanel
          data={analytics?.lowStockAlerts ?? null}
          isLoading={isLoading}
        />

        {/* Row 1: Movement Trends (wide) + Movement Type Pie */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2">
            <MovementTrendsChart
              data={analytics?.movementTrends ?? []}
              isLoading={isLoading}
            />
          </div>
          <MovementTypePieChart
            data={analytics?.movementTypeBreakdown ?? []}
            isLoading={isLoading}
          />
        </div>

        {/* Row 2: Category Distribution + Supplier Spending */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <CategoryDistributionChart
            data={analytics?.categoryDistribution ?? []}
            isLoading={isLoading}
          />
          <SupplierSpendingChart
            data={analytics?.supplierSpending ?? []}
            isLoading={isLoading}
          />
        </div>

        {/* Row 3: Stock Value Trend */}
        <StockValueTrendChart
          data={analytics?.stockValueTrend ?? []}
          isLoading={isLoading}
        />

        {/* Row 4: Most Used + Top Spending items */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <MostUsedItemsChart
            data={analytics?.mostUsedItems ?? []}
            isLoading={isLoading}
          />
          <SpendingByItemChart
            data={analytics?.spendingByItem ?? []}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
