import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, DollarSign, AlertCircle, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { StockSummary } from "@/lib/types";

interface StockSummaryCardsProps {
  summary: StockSummary | null;
  loading: boolean;
}

export function StockSummaryCards({
  summary,
  loading,
}: StockSummaryCardsProps) {
  if (loading || !summary) {
    return (
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              <div className="h-4 w-4 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: "Total Products",
      value: summary.totalProducts.toString(),
      icon: Package,
      description: "In inventory",
    },
    {
      title: "Total Stock Value",
      value: formatCurrency(summary.totalStockValue),
      icon: DollarSign,
      description: "Current valuation",
    },
    {
      title: "Low Stock Items",
      value: summary.lowStockItems.toString(),
      icon: AlertCircle,
      description: "Need attention",
      variant: summary.lowStockItems > 0 ? "warning" : "default",
    },
    {
      title: "Today's Movements",
      value: summary.totalMovementsToday.toString(),
      icon: TrendingUp,
      description: "Stock transactions",
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p
              className={`text-xs mt-1 ${
                stat.variant === "warning"
                  ? "text-yellow-600"
                  : "text-muted-foreground"
              }`}
            >
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
