import { TableCell, TableRow } from "@/components/ui/table";
import { MovementBadge } from "./MovementBadge";
import { formatDate } from "@/lib/utils";
import {
  TRANSACTION_LABELS,
  type StockMovement,
} from "@/types/stockMovement.types";

interface MovementTableRowProps {
  movement: StockMovement;
}

export function MovementTableRow({ movement }: MovementTableRowProps) {
  const quantityPrefix = movement.movementType === "IN" ? "+" : "-";

  return (
    <TableRow>
      <TableCell className="whitespace-nowrap">
        <time dateTime={movement.createdAt}>
          {formatDate(movement.createdAt)}
        </time>
      </TableCell>
      <TableCell>
        <div className="font-medium">{movement.product.name}</div>
        <div className="text-sm text-muted-foreground">
          {movement.product.sku}
        </div>
      </TableCell>
      <TableCell>
        <MovementBadge type={movement.movementType} />
      </TableCell>
      <TableCell className="text-sm">
        {TRANSACTION_LABELS[movement.transactionType]}
      </TableCell>
      <TableCell className="text-right font-mono">
        {quantityPrefix}
        {movement.quantity}
      </TableCell>
      <TableCell className="text-right font-mono">
        {movement.previousQuantity}
      </TableCell>
      <TableCell className="text-right font-mono font-medium">
        {movement.newQuantity}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {movement.reference || "—"}
      </TableCell>
    </TableRow>
  );
}
