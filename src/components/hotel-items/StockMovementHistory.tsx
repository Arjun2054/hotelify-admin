import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import {
  ArrowUpCircle,
  ArrowDownCircle,
  AlertTriangle,
  ArrowRightLeft,
  Settings2,
  Trash,
} from "lucide-react";
import type { StockMovementType } from "@/types/hotelItem-types";
import { useHotelItemStore } from "@/store/hotel/useHotelItemStore";

interface Props {
  itemId: string;
}

const typeConfig: Record<
  StockMovementType,
  { icon: React.ReactNode; color: string; bg: string }
> = {
  STOCK_IN: {
    icon: <ArrowUpCircle className="h-4 w-4" />,
    color: "text-emerald-700",
    bg: "bg-emerald-100",
  },
  STOCK_OUT: {
    icon: <ArrowDownCircle className="h-4 w-4" />,
    color: "text-blue-700",
    bg: "bg-blue-100",
  },
  DAMAGE: {
    icon: <AlertTriangle className="h-4 w-4" />,
    color: "text-red-700",
    bg: "bg-red-100",
  },
  TRANSFER: {
    icon: <ArrowRightLeft className="h-4 w-4" />,
    color: "text-purple-700",
    bg: "bg-purple-100",
  },
  ADJUSTMENT: {
    icon: <Settings2 className="h-4 w-4" />,
    color: "text-gray-700",
    bg: "bg-gray-100",
  },
  WASTAGE: {
    icon: <Trash className="h-4 w-4" />,
    color: "text-amber-700",
    bg: "bg-amber-100",
  },
};

export function StockMovementHistory({ itemId }: Props) {
  const { movements, isMovementLoading, setMovementFilters, fetchMovements } =
    useHotelItemStore();

  useEffect(() => {
    setMovementFilters({ hotelItemId: itemId });
    fetchMovements();
  }, [itemId]);

  if (isMovementLoading) {
    return (
      <div className="space-y-3 py-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  const itemMovements = movements.filter((m) => m.hotelItemId === itemId);

  if (itemMovements.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No stock movement history.
      </p>
    );
  }

  return (
    <div className="space-y-2 py-2">
      {itemMovements.map((movement) => {
        const config = typeConfig[movement.type];
        const isInbound = ["STOCK_IN", "ADJUSTMENT"].includes(movement.type);

        return (
          <div
            key={movement.id}
            className="flex items-start gap-3 p-3 rounded-lg border bg-card"
          >
            <div className={`p-1.5 rounded-md ${config.bg} ${config.color}`}>
              {config.icon}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <Badge
                  variant="outline"
                  className={`text-xs ${config.bg} ${config.color} border-0`}
                >
                  {movement.type.replace("_", " ")}
                </Badge>
                <span
                  className={`text-sm font-bold ${
                    isInbound ? "text-emerald-600" : "text-red-600"
                  }`}
                >
                  {isInbound ? "+" : "-"}
                  {movement.quantity}
                </span>
              </div>

              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                <span>
                  {movement.previousStock} → {movement.newStock}
                </span>
                {movement.unitCost && <span>· ${movement.unitCost}/unit</span>}
              </div>

              {movement.notes && (
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {movement.notes}
                </p>
              )}

              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-muted-foreground">
                  {movement.user?.name ?? "System"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(movement.createdAt)}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
