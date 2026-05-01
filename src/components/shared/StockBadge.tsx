import { Badge } from "@/components/ui/badge";
import type { StockStatus } from "@/lib/types";

interface StockBadgeProps {
  quantity: number;
  lowThreshold?: number;
}

function getStockStatus(quantity: number, lowThreshold: number): StockStatus {
  if (quantity === 0) return "out-of-stock";
  if (quantity <= lowThreshold) return "low-stock";
  return "in-stock";
}

export function StockBadge({ quantity, lowThreshold = 10 }: StockBadgeProps) {
  const status = getStockStatus(quantity, lowThreshold);

  const variants = {
    "in-stock": "default",
    "low-stock": "secondary",
    "out-of-stock": "destructive",
  } as const;

  const labels = {
    "in-stock": "In Stock",
    "low-stock": "Low Stock",
    "out-of-stock": "Out of Stock",
  };

  return (
    <Badge variant={variants[status] || "default"}>
      {labels[status]} ({quantity})
    </Badge>
  );
}
