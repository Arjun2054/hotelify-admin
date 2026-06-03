import { useEffect } from "react";
import {
  AlertCircle,
  Package,
  RefreshCw,
  BarChart3,
  TrendingUp,
  Hotel,
} from "lucide-react";
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
import { cn } from "@/lib/utils";

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({
  label,
  children,
  className,
}: {
  label?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      {label && (
        <div className="flex items-center gap-2">
          <p
            className="uppercase tracking-widest font-semibold text-gray-400"
            style={{ fontSize: "10px" }}
          >
            {label}
          </p>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
      )}
      {children}
    </div>
  );
}

// ── Chart card shell ──────────────────────────────────────────────────────────
function ChartCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden",
        className,
      )}
    >
      {children}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
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

  const isBusy = isLoading || isDashboardLoading;

  return (
    <div className="min-h-screen">
      {/* ── Hero header ───────────────────────────────────────────────────── */}
      <div className="relative shrink-0 bg-linear-to-r from-primary via-primary/90 to-primary/75 px-10 py-7 text-primary-foreground overflow-hidden">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-10 -right-10 h-48 w-48 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-8 right-24 h-32 w-32 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute top-4 right-64 h-16 w-16 rounded-full bg-white/5" />

        <div className="relative max-w-screen-2xl mx-auto flex items-start justify-between gap-6 flex-wrap">
          {/* Left: icon + title */}
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm shrink-0">
              <Package className="w-6 h-6 text-white" />
            </div>

            <div>
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 mb-1">
                <p
                  className="uppercase tracking-widest font-semibold text-stone-400"
                  style={{ fontSize: "10px" }}
                >
                  Hotel Management
                </p>
                <span className="w-1 h-1 rounded-full bg-stone-500" />
                <p
                  className="uppercase tracking-widest font-semibold text-stone-400"
                  style={{ fontSize: "10px" }}
                >
                  Inventory
                </p>
                <span className="w-1 h-1 rounded-full bg-stone-500" />
                <p
                  className="uppercase tracking-widest font-semibold text-stone-400"
                  style={{ fontSize: "10px" }}
                >
                  Analytics
                </p>
              </div>

              <h1
                className="font-bold text-white leading-tight tracking-tight"
                style={{ fontSize: "22px" }}
              >
                Inventory Analytics
              </h1>
              <p
                className="text-stone-300 mt-1 leading-snug"
                style={{ fontSize: "13px" }}
              >
                Stock insights, movement trends &amp; spending analysis
              </p>
            </div>
          </div>

          {/* Right: refresh */}
          <button
            onClick={refresh}
            disabled={isBusy}
            className={cn(
              "h-9 px-4 rounded-xl flex items-center gap-2",
              "bg-white/10 hover:bg-white/20 text-white border border-white/15",
              "font-medium transition-colors disabled:opacity-50",
            )}
            style={{ fontSize: "13px" }}
          >
            <RefreshCw
              className={cn("w-3.5 h-3.5", isBusy && "animate-spin")}
            />
            Refresh
          </button>
        </div>

        {/* Stat indicator strip */}
        <div className="relative max-w-screen-2xl mx-auto mt-7 flex items-center gap-3 flex-wrap">
          {[
            { label: "Dashboard Stats", icon: BarChart3 },
            { label: "Movement Trends", icon: TrendingUp },
            { label: "Supplier Insights", icon: Hotel },
          ].map((s) => (
            <div
              key={s.label}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 border border-white/15 backdrop-blur-sm"
            >
              <s.icon className="w-3.5 h-3.5 text-stone-300 shrink-0" />
              <span
                className="text-stone-300 leading-none"
                style={{ fontSize: "11px" }}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────────────────── */}
      <div className="max-w-screen-2xl mx-auto px-8 py-6 space-y-6">
        {/* Error banner */}
        {error && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200/70">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-red-100 shrink-0">
              <AlertCircle className="w-4 h-4 text-red-600" />
            </span>
            <p className="text-red-700 flex-1" style={{ fontSize: "12px" }}>
              {error}
            </p>
            <button
              onClick={clearError}
              className="text-red-500 hover:text-red-700 underline shrink-0 transition-colors"
              style={{ fontSize: "11px" }}
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Filters */}
        <Section label="Filters & Date Range">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <InventoryAnalyticsFilters
              filters={filters}
              selectedYear={selectedYear}
              onFilterChange={handleFilterChange}
              onYearChange={handleYearChange}
            />
          </div>
        </Section>

        {/* KPI Cards */}
        <Section label="Key Performance Indicators">
          <InventoryStatsCards
            stats={dashboard}
            isLoading={isDashboardLoading}
          />
        </Section>

        {/* Low Stock Alerts */}
        <Section label="Stock Alerts">
          <ChartCard>
            <LowStockAlertsPanel
              data={analytics?.lowStockAlerts ?? null}
              isLoading={isLoading}
            />
          </ChartCard>
        </Section>

        {/* Row 1: Movement Trends + Movement Type Pie */}
        <Section label="Movement Analysis">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <ChartCard className="lg:col-span-2">
              <MovementTrendsChart
                data={analytics?.movementTrends ?? []}
                isLoading={isLoading}
              />
            </ChartCard>
            <ChartCard>
              <MovementTypePieChart
                data={analytics?.movementTypeBreakdown ?? []}
                isLoading={isLoading}
              />
            </ChartCard>
          </div>
        </Section>

        {/* Row 2: Category Distribution + Supplier Spending */}
        <Section label="Category & Supplier Breakdown">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard>
              <CategoryDistributionChart
                data={analytics?.categoryDistribution ?? []}
                isLoading={isLoading}
              />
            </ChartCard>
            <ChartCard>
              <SupplierSpendingChart
                data={analytics?.supplierSpending ?? []}
                isLoading={isLoading}
              />
            </ChartCard>
          </div>
        </Section>

        {/* Row 3: Stock Value Trend */}
        <Section label="Stock Value Over Time">
          <ChartCard>
            <StockValueTrendChart
              data={analytics?.stockValueTrend ?? []}
              isLoading={isLoading}
            />
          </ChartCard>
        </Section>

        {/* Row 4: Most Used + Top Spending */}
        <Section label="Item Usage & Spending">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard>
              <MostUsedItemsChart
                data={analytics?.mostUsedItems ?? []}
                isLoading={isLoading}
              />
            </ChartCard>
            <ChartCard>
              <SpendingByItemChart
                data={analytics?.spendingByItem ?? []}
                isLoading={isLoading}
              />
            </ChartCard>
          </div>
        </Section>
      </div>
    </div>
  );
}
