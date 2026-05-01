import { Card, CardContent } from "@/components/ui/card";
import { MovementBadge } from "./MovementBadge";
import { formatDate } from "@/lib/utils";
import {
  TRANSACTION_LABELS,
  type StockMovement,
} from "@/types/stockMovement.types";

interface MovementCardProps {
  movement: StockMovement;
}

export function MovementCard({ movement }: MovementCardProps) {
  const quantityPrefix = movement.movementType === "IN" ? "+" : "-";

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">
                {movement.product.name}
              </h3>
              <p className="text-sm text-muted-foreground font-mono">
                {movement.product.sku}
              </p>
            </div>
            <MovementBadge type={movement.movementType} />
          </div>

          {/* Details Grid */}
          <dl className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <dt className="text-muted-foreground">Type:</dt>
              <dd className="font-medium">
                {TRANSACTION_LABELS[movement.transactionType]}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Quantity:</dt>
              <dd className="font-medium font-mono">
                {quantityPrefix}
                {movement.quantity}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Before:</dt>
              <dd className="font-medium font-mono">
                {movement.previousQuantity}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">After:</dt>
              <dd className="font-medium font-mono">{movement.newQuantity}</dd>
            </div>
          </dl>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
            <time dateTime={movement.createdAt}>
              {formatDate(movement.createdAt)}
            </time>
            {movement.reference && (
              <span className="truncate ml-2">Ref: {movement.reference}</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
