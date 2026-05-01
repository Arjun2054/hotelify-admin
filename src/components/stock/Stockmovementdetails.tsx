import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { X, Package, Calendar, User, FileText, DollarSign } from "lucide-react";
import { format } from "date-fns";
import type { StockMovement } from "@/types/stock-movement.types";
import { formatCurrency } from "@/lib/utils";

interface StockMovementDetailsProps {
  movement: StockMovement | null;
  onClose: () => void;
}

export function StockMovementDetails({
  movement,
  onClose,
}: StockMovementDetailsProps) {
  if (!movement) {
    return null;
  }

  const getMovementTypeBadge = (type: string) => {
    return type === "IN" ? (
      <Badge className="bg-green-500">Stock IN</Badge>
    ) : (
      <Badge className="bg-red-500">Stock OUT</Badge>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">Movement Details</CardTitle>
              <CardDescription>ID: {movement.stockMovementId}</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Movement Type & Transaction */}
          <div className="flex items-center gap-4">
            {getMovementTypeBadge(movement.movementType)}
            <Separator orientation="vertical" className="h-6" />
            <div>
              <p className="text-sm text-muted-foreground">Transaction Type</p>
              <p className="font-medium">{movement.transactionType}</p>
            </div>
          </div>

          <Separator />

          {/* Product Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Package className="h-5 w-5" />
              Product Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Product Name</p>
                  <p className="font-medium">{movement.product.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">SKU</p>
                  <p className="font-medium">{movement.product.sku}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <Badge variant="outline">
                    {movement.product.category.name}
                  </Badge>
                </div>
              </div>
              <div className="space-y-3">
                {movement.product.supplier && (
                  <div>
                    <p className="text-sm text-muted-foreground">Supplier</p>
                    <p className="font-medium">
                      {movement.product.supplier.name}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">
                    Current Stock Level
                  </p>
                  <p className="font-medium text-lg">
                    {movement.product.stockQuantity} units
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Movement Details */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Movement Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Quantity</p>
                  <p className="font-medium text-2xl">{movement.quantity}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Previous Stock
                  </p>
                  <p className="font-medium">{movement.previousQuantity}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">New Stock</p>
                  <p className="font-medium">{movement.newQuantity}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Unit Price</p>
                  <p className="font-medium">
                    {movement.unitPrice
                      ? `${formatCurrency(movement.unitPrice)}`
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Value</p>
                  <p className="font-medium text-xl">
                    {movement.totalValue
                      ? `${formatCurrency(movement.totalValue)}`
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Additional Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Additional Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Date & Time</p>
                  <p className="font-medium">
                    {format(
                      new Date(movement.createdAt),
                      "MMMM dd, yyyy 'at' HH:mm",
                    )}
                  </p>
                </div>
              </div>

              {movement.reference && (
                <div className="flex items-start gap-2">
                  <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Reference</p>
                    <p className="font-medium">{movement.reference}</p>
                  </div>
                </div>
              )}

              {movement.performedBy && (
                <div className="flex items-start gap-2">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Performed By
                    </p>
                    <p className="font-medium">{movement.performedBy}</p>
                  </div>
                </div>
              )}

              {movement.notes && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm bg-muted p-3 rounded-md">
                    {movement.notes}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
