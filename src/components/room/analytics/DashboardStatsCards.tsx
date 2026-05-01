// components/hotel/analytics/DashboardStatsCards.tsx
"use client";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BedDouble,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Sparkles,
  Wrench,
  CalendarCheck,
  Activity,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import type { DashboardStats } from "@/types/room-analytics";

interface Props {
  stats: DashboardStats | null;
  isLoading: boolean;
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: number;
  trendLabel?: string;
  colorClass?: string;
  bgClass?: string;
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendLabel,
  colorClass = "text-blue-600 dark:text-blue-400",
  bgClass = "bg-blue-50 dark:bg-blue-900/20",
}: StatCardProps) {
  const isPositive = trend !== undefined && trend >= 0;
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
            {title}
          </p>
          <p className="mt-1.5 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
          {subtitle && (
            <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500 truncate">
              {subtitle}
            </p>
          )}
          {trend !== undefined && (
            <div
              className={cn(
                "mt-2 flex items-center gap-1 text-xs font-medium",
                isPositive
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-500 dark:text-red-400",
              )}
            >
              {isPositive ? (
                <TrendingUp className="h-3.5 w-3.5" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5" />
              )}
              <span>
                {isPositive ? "+" : ""}
                {trend}% {trendLabel}
              </span>
            </div>
          )}
        </div>
        <div className={cn("p-2.5 rounded-lg shrink-0", bgClass)}>
          <div className={colorClass}>{icon}</div>
        </div>
      </div>
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-10 w-10 rounded-lg" />
      </div>
    </div>
  );
}

export function DashboardStatsCards({ stats, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Occupancy Rate"
        value={`${stats.occupancyRate}%`}
        subtitle={`${stats.occupied} / ${stats.totalRooms} rooms`}
        icon={<Activity className="h-5 w-5" />}
        colorClass="text-blue-600 dark:text-blue-400"
        bgClass="bg-blue-50 dark:bg-blue-900/20"
      />
      <StatCard
        title="Monthly Revenue"
        value={formatCurrency(stats.currentMonthRevenue)}
        subtitle="Current month"
        icon={<DollarSign className="h-5 w-5" />}
        trend={stats.revenueGrowth}
        trendLabel="vs last month"
        colorClass="text-green-600 dark:text-green-400"
        bgClass="bg-green-50 dark:bg-green-900/20"
      />
      <StatCard
        title="Monthly Bookings"
        value={stats.currentMonthBookings}
        subtitle="Check-ins this month"
        icon={<CalendarCheck className="h-5 w-5" />}
        trend={stats.bookingsGrowth}
        trendLabel="vs last month"
        colorClass="text-purple-600 dark:text-purple-400"
        bgClass="bg-purple-50 dark:bg-purple-900/20"
      />
      <StatCard
        title="Daily Revenue Est."
        value={formatCurrency(stats.estimatedDailyRevenue)}
        subtitle="Based on current guests"
        icon={<Sparkles className="h-5 w-5" />}
        colorClass="text-amber-600 dark:text-amber-400"
        bgClass="bg-amber-50 dark:bg-amber-900/20"
      />
      <StatCard
        title="Available Rooms"
        value={stats.available}
        subtitle={`of ${stats.totalRooms} total`}
        icon={<BedDouble className="h-5 w-5" />}
        colorClass="text-emerald-600 dark:text-emerald-400"
        bgClass="bg-emerald-50 dark:bg-emerald-900/20"
      />
      <StatCard
        title="Active Guests"
        value={stats.activeAssignments}
        subtitle="Currently checked in"
        icon={<Users className="h-5 w-5" />}
        colorClass="text-cyan-600 dark:text-cyan-400"
        bgClass="bg-cyan-50 dark:bg-cyan-900/20"
      />
      <StatCard
        title="Today's Check-ins"
        value={stats.todayCheckIns}
        subtitle="Arrivals today"
        icon={<CalendarCheck className="h-5 w-5" />}
        colorClass="text-indigo-600 dark:text-indigo-400"
        bgClass="bg-indigo-50 dark:bg-indigo-900/20"
      />
      <StatCard
        title="Maintenance / Cleaning"
        value={stats.maintenance + stats.cleaning}
        subtitle={`${stats.pendingHousekeeping} housekeeping pending`}
        icon={<Wrench className="h-5 w-5" />}
        colorClass="text-orange-600 dark:text-orange-400"
        bgClass="bg-orange-50 dark:bg-orange-900/20"
      />
    </div>
  );
}
