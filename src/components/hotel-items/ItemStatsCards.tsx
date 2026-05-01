import {
  Package,
  PackageCheck,
  AlertTriangle,
  PackageX,
  DollarSign,
  Layers,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { HotelItemStats } from "@/types/hotelItem-types";

interface Props {
  stats: HotelItemStats | null;
}

export function ItemStatsCards({ stats }: Props) {
  if (!stats) return null;

  const cards = [
    {
      title: "Total Items",
      value: stats.totalItems,
      icon: Package,
      color: "text-slate-600",
      bg: "bg-slate-50",
    },
    {
      title: "Active Items",
      value: stats.activeItems,
      icon: PackageCheck,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Low Stock",
      value: stats.lowStockItems,
      icon: AlertTriangle,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      title: "Out of Stock",
      value: stats.outOfStockItems,
      icon: PackageX,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      title: "Stock Value",
      value: formatCurrency(stats.totalStockValue),
      icon: DollarSign,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Categories",
      value: stats.categoriesCount,
      icon: Layers,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card) => (
        <Card key={card.title} className="border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${card.bg}`}>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">
                  {card.title}
                </p>
                <p className="text-lg font-bold truncate">{card.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
