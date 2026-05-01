import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { StockMovementType } from "@/lib/types";

interface MovementBadgeProps {
  type: StockMovementType;
}

export function MovementBadge({ type }: MovementBadgeProps) {
  if (type === "IN") {
    return (
      <Badge variant="default" className="gap-1">
        <TrendingUp className="h-3 w-3" aria-hidden="true" />
        <span>Stock In</span>
      </Badge>
    );
  }

  return (
    <Badge variant="destructive" className="gap-1">
      <TrendingDown className="h-3 w-3" aria-hidden="true" />
      <span>Stock Out</span>
    </Badge>
  );
}
