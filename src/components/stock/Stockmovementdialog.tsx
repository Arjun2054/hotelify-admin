import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";
import {
  MovementType,
  TransactionType,
  type CreateStockMovementDTO,
} from "@/types/stock-movement.types";
import { useStockMovementStore } from "@/store/stock-movement.store";
import type { Product } from "@/lib/types";

interface StockMovementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movementType: MovementType;
  products: Product[];
}

const IN_TRANSACTION_TYPES = [
  { value: TransactionType.PURCHASE, label: "Purchase" },
  { value: TransactionType.RETURN, label: "Customer Return" },
  { value: TransactionType.ADJUSTMENT_IN, label: "Adjustment In" },
  { value: TransactionType.TRANSFER_IN, label: "Transfer In" },
  { value: TransactionType.PRODUCTION, label: "Production" },
];

const OUT_TRANSACTION_TYPES = [
  { value: TransactionType.SALE, label: "Sale" },
  { value: TransactionType.DAMAGE, label: "Damage" },
  { value: TransactionType.LOSS, label: "Loss" },
  { value: TransactionType.ADJUSTMENT_OUT, label: "Adjustment Out" },
  { value: TransactionType.TRANSFER_OUT, label: "Transfer Out" },
  { value: TransactionType.EXPIRED, label: "Expired" },
];

export function StockMovementDialog({
  open,
  onOpenChange,
  movementType,
  products,
}: StockMovementDialogProps) {
  const { createStockIn, createStockOut, isCreating } = useStockMovementStore();

  const [formData, setFormData] = useState<CreateStockMovementDTO>({
    productId: "",
    transactionType: TransactionType.PURCHASE,
    quantity: 0,
    unitPrice: undefined,
    reference: "",
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string>("");

  const transactionTypes =
    movementType === MovementType.IN
      ? IN_TRANSACTION_TYPES
      : OUT_TRANSACTION_TYPES;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.productId) {
      newErrors.productId = "Please select a product";
    }

    if (!formData.transactionType) {
      newErrors.transactionType = "Please select a transaction type";
    }

    if (!formData.quantity || formData.quantity <= 0) {
      newErrors.quantity = "Quantity must be greater than 0";
    }

    if (
      formData.unitPrice !== undefined &&
      (formData.unitPrice < 0 || isNaN(formData.unitPrice))
    ) {
      newErrors.unitPrice = "Unit price must be a valid number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!validateForm()) {
      return;
    }

    try {
      if (movementType === MovementType.IN) {
        await createStockIn(formData);
      } else {
        await createStockOut(formData);
      }

      // Reset form and close dialog
      setFormData({
        productId: "",
        transactionType:
          movementType === MovementType.IN
            ? TransactionType.PURCHASE
            : TransactionType.SALE,
        quantity: 0,
        unitPrice: undefined,
        reference: "",
        notes: "",
      });
      onOpenChange(false);
    } catch (error: any) {
      setSubmitError(error.message || "Failed to create stock movement");
    }
  };

  const selectedProduct = products.find(
    (p) => p.productId === formData.productId,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {movementType === MovementType.IN ? "Stock In" : "Stock Out"}
            </DialogTitle>
            <DialogDescription>
              Record a{" "}
              {movementType === MovementType.IN ? "stock in" : "stock out"}{" "}
              transaction
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {submitError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}

            {/* Product Selection */}
            <div className="grid gap-2">
              <Label htmlFor="product">Product *</Label>
              <Select
                value={formData.productId}
                onValueChange={(value) =>
                  setFormData({ ...formData, productId: value })
                }
              >
                <SelectTrigger id="product">
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem
                      key={product.productId}
                      value={product.productId}
                    >
                      {product.name} ({product.sku}) - Stock:{" "}
                      {product.stockQuantity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.productId && (
                <p className="text-sm text-red-500">{errors.productId}</p>
              )}
            </div>

            {/* Transaction Type */}
            <div className="grid gap-2">
              <Label htmlFor="transactionType">Transaction Type *</Label>
              <Select
                value={formData.transactionType}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    transactionType: value as TransactionType,
                  })
                }
              >
                <SelectTrigger id="transactionType">
                  <SelectValue placeholder="Select transaction type" />
                </SelectTrigger>
                <SelectContent>
                  {transactionTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.transactionType && (
                <p className="text-sm text-red-500">{errors.transactionType}</p>
              )}
            </div>

            {/* Quantity */}
            <div className="grid gap-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    quantity: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="Enter quantity"
              />
              {errors.quantity && (
                <p className="text-sm text-red-500">{errors.quantity}</p>
              )}
              {selectedProduct && (
                <p className="text-sm text-muted-foreground">
                  Current stock: {selectedProduct.stockQuantity} units
                </p>
              )}
            </div>

            {/* Unit Price */}
            <div className="grid gap-2">
              <Label htmlFor="unitPrice">Unit Price</Label>
              <Input
                id="unitPrice"
                type="number"
                step="0.01"
                min="0"
                value={formData.unitPrice || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    unitPrice: e.target.value
                      ? parseFloat(e.target.value)
                      : undefined,
                  })
                }
                placeholder="Enter unit price (optional)"
              />
              {errors.unitPrice && (
                <p className="text-sm text-red-500">{errors.unitPrice}</p>
              )}
              {formData.unitPrice && formData.quantity > 0 && (
                <p className="text-sm text-muted-foreground">
                  Total value: $
                  {(formData.unitPrice * formData.quantity).toFixed(2)}
                </p>
              )}
            </div>

            {/* Reference */}
            <div className="grid gap-2">
              <Label htmlFor="reference">Reference</Label>
              <Input
                id="reference"
                value={formData.reference}
                onChange={(e) =>
                  setFormData({ ...formData, reference: e.target.value })
                }
                placeholder="PO/Invoice number (optional)"
              />
            </div>

            {/* Notes */}
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Additional notes (optional)"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {movementType === MovementType.IN
                ? "Record Stock In"
                : "Record Stock Out"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
