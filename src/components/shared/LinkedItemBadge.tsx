import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  itemId: string;
  itemName: string;
  unit?: string;
  quantity?: number;
  className?: string;
  showIcon?: boolean;
}

export function LinkedItemBadge({
  itemId,
  itemName,
  unit,
  quantity,
  className,
  showIcon = true,
}: Props) {
  return (
    <Link
      to={`/hotel-items/${itemId}`}
      onClick={(e) => e.stopPropagation()}
      className="inline-flex"
    >
      <Badge
        variant="outline"
        className={cn(
          "hover:bg-violet-50 hover:border-violet-300 hover:text-violet-700 transition-colors cursor-pointer gap-1",
          className,
        )}
      >
        {showIcon && <Package className="h-3 w-3" />}
        {itemName}
        {quantity !== undefined && unit && (
          <span className="text-muted-foreground ml-0.5">
            {quantity} {unit}
          </span>
        )}
      </Badge>
    </Link>
  );
}
