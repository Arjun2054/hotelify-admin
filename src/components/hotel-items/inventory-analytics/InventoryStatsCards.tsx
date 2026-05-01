// components/hotel/inventory-analytics/InventoryStatsCards.tsx

import { Skeleton } from "@/components/ui/skeleton";
import {
  Package,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Activity,
  ShoppingCart,
  Boxes,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import type { InventoryDashboardStats } from "@/types/inventory-analytics-types";

interface Props {
  stats: InventoryDashboardStats | null;
  isLoading: boolean;
}

interface CardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: number;
  trendLabel?: string;
  iconBg?: string;
  iconColor?: string;
  highlight?: boolean;
}

function Card({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendLabel,
  iconBg = "bg-blue-50 dark:bg-blue-900/20",
  iconColor = "text-blue-600 dark:text-blue-400",
  highlight,
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border p-4 sm:p-5 hover:shadow-md transition-all",
        highlight
          ? "bg-linear-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-200 dark:border-emerald-800"
          : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
            {title}
          </p>
          <p className="mt-1.5 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white truncate">
            {value}
          </p>
          {subtitle && (
            <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
              {subtitle}
            </p>
          )}
          {trend !== undefined && (
            <div
              className={cn(
                "mt-2 flex items-center gap-1 text-xs font-medium",
                trend >= 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-500 dark:text-red-400",
              )}
            >
              {trend >= 0 ? (
                <TrendingUp className="h-3.5 w-3.5" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5" />
              )}
              <span>
                {trend >= 0 ? "+" : ""}
                {trend}% {trendLabel}
              </span>
            </div>
          )}
        </div>
        <div className={cn("p-2.5 rounded-lg shrink-0", iconBg)}>
          <div className={iconColor}>{icon}</div>
        </div>
      </div>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-3 w-28" />
        </div>
        <Skeleton className="h-10 w-10 rounded-lg" />
      </div>
    </div>
  );
}

export function InventoryStatsCards({ stats, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }
  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <Card
        title="Total Inventory Value"
        value={formatCurrency(stats.totalInventoryValue)}
        subtitle={`${stats.activeItems} active items`}
        icon={<Boxes className="h-5 w-5" />}
        iconBg="bg-emerald-50 dark:bg-emerald-900/20"
        iconColor="text-emerald-600 dark:text-emerald-400"
        highlight
      />
      <Card
        title="Monthly Spend"
        value={formatCurrency(stats.currentMonthSpend)}
        subtitle="Purchasing this month"
        icon={<ShoppingCart className="h-5 w-5" />}
        trend={stats.spendGrowth}
        trendLabel="vs last month"
        iconBg="bg-blue-50 dark:bg-blue-900/20"
        iconColor="text-blue-600 dark:text-blue-400"
      />
      <Card
        title="Consumption"
        value={
          stats.currentConsumption.toLocaleString(undefined, {
            maximumFractionDigits: 1,
          }) + " units"
        }
        subtitle="Used this month"
        icon={<Activity className="h-5 w-5" />}
        trend={stats.consumptionGrowth}
        trendLabel="vs last month"
        iconBg="bg-purple-50 dark:bg-purple-900/20"
        iconColor="text-purple-600 dark:text-purple-400"
      />
      <Card
        title="Total Movements"
        value={stats.totalMovementsAllTime.toLocaleString()}
        subtitle="All time transactions"
        icon={<Activity className="h-5 w-5" />}
        iconBg="bg-cyan-50 dark:bg-cyan-900/20"
        iconColor="text-cyan-600 dark:text-cyan-400"
      />
      <Card
        title="Total Items"
        value={stats.totalItems}
        subtitle={`${stats.activeItems} active`}
        icon={<Package className="h-5 w-5" />}
        iconBg="bg-slate-50 dark:bg-slate-900/20"
        iconColor="text-slate-600 dark:text-slate-400"
      />
      <Card
        title="Low Stock"
        value={stats.lowStockItems}
        subtitle="Below reorder point"
        icon={<AlertTriangle className="h-5 w-5" />}
        iconBg="bg-amber-50 dark:bg-amber-900/20"
        iconColor="text-amber-600 dark:text-amber-400"
      />
      <Card
        title="Out of Stock"
        value={stats.outOfStockItems}
        subtitle="Needs immediate restock"
        icon={<AlertTriangle className="h-5 w-5" />}
        iconBg="bg-red-50 dark:bg-red-900/20"
        iconColor="text-red-600 dark:text-red-400"
      />
      <Card
        title="Categories"
        value={stats.categoryDistribution.length}
        subtitle="With active items"
        icon={<DollarSign className="h-5 w-5" />}
        iconBg="bg-indigo-50 dark:bg-indigo-900/20"
        iconColor="text-indigo-600 dark:text-indigo-400"
      />
    </div>
  );
}
