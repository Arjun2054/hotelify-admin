import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import type {
  CreateStockMovementPayload,
  HotelItem,
  StockMovementType,
} from "@/types/hotelItem-types";
import { authService } from "@/services/authService";

interface Props {
  open: boolean;
  item: HotelItem | null;
  initialType?: StockMovementType;
  isLoading: boolean;
  onClose: () => void;
  onSubmit: (data: CreateStockMovementPayload) => Promise<void>;
}

const movementTypeLabels: Record<StockMovementType, string> = {
  STOCK_IN: "Stock In (Add)",
  STOCK_OUT: "Stock Out (Remove)",
  DAMAGE: "Damage Report",
  TRANSFER: "Transfer",
  ADJUSTMENT: "Stock Adjustment",
  WASTAGE: "Wastage",
};

const movementTypeColors: Record<StockMovementType, string> = {
  STOCK_IN: "bg-emerald-100 text-emerald-800",
  STOCK_OUT: "bg-blue-100 text-blue-800",
  DAMAGE: "bg-red-100 text-red-800",
  TRANSFER: "bg-purple-100 text-purple-800",
  ADJUSTMENT: "bg-gray-100 text-gray-800",
  WASTAGE: "bg-amber-100 text-amber-800",
};

export function StockMovementDialog({
  open,
  item,
  initialType = "STOCK_IN",
  isLoading,
  onClose,
  onSubmit,
}: Props) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<{
    type: StockMovementType;
    quantity: number;
    unitCost?: number;
    referenceId?: string;
    notes?: string;
  }>({
    defaultValues: {
      type: initialType,
      quantity: 0,
    },
  });

  const selectedType = watch("type");

  // Reset when dialog opens/item changes
  const resetForm = () => {
    reset({
      type: initialType,
      quantity: 0,
      unitCost: item?.costPrice ?? 0,
      referenceId: "",
      notes: "",
    });
  };

  const onFormSubmit = async (data: {
    type: StockMovementType;
    quantity: number;
    unitCost?: number;
    referenceId?: string;
    notes?: string;
  }) => {
    if (!item) return;

    await onSubmit({
      hotelItemId: item.id,
      userId: authService.getCurrentUser.name, // In real app, get from auth context
      type: data.type,
      quantity: data.quantity,
      unitCost: data.unitCost,
      referenceId: data.referenceId,
      notes: data.notes,
    });

    resetForm();
    onClose();
  };

  if (!item) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        resetForm();
        onClose();
      }}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Stock Movement</DialogTitle>
          <DialogDescription>
            Record a stock change for{" "}
            <span className="font-semibold">{item.name}</span>
          </DialogDescription>
        </DialogHeader>

        {/* Current Stock Display */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
          <div>
            <p className="text-sm text-muted-foreground">Current Stock</p>
            <p className="text-2xl font-bold">
              {item.stockQuantity}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                {item.unit.abbreviation}
              </span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Reorder Point</p>
            <p className="text-sm font-medium">{item.reorderPoint}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          {/* Movement Type */}
          <div className="space-y-2">
            <Label>Movement Type *</Label>
            <Select
              value={selectedType}
              onValueChange={(val) =>
                setValue("type", val as StockMovementType)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(
                  Object.entries(movementTypeLabels) as [
                    StockMovementType,
                    string,
                  ][]
                ).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`text-xs ${movementTypeColors[key]}`}
                      >
                        {key.replace("_", " ")}
                      </Badge>
                      {label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quantity */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">
                Quantity ({item.unit.abbreviation}) *
              </Label>
              <Input
                id="quantity"
                type="number"
                step="0.001"
                min="0.001"
                {...register("quantity", {
                  required: "Quantity is required",
                  valueAsNumber: true,
                  min: {
                    value: 0.001,
                    message: "Must be greater than 0",
                  },
                })}
              />
              {errors.quantity && (
                <p className="text-xs text-red-500">
                  {errors.quantity.message}
                </p>
              )}
            </div>

            {/* Unit Cost (show for STOCK_IN) */}
            {(selectedType === "STOCK_IN" || selectedType === "ADJUSTMENT") && (
              <div className="space-y-2">
                <Label htmlFor="unitCost">Unit Cost ($)</Label>
                <Input
                  id="unitCost"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register("unitCost", { valueAsNumber: true })}
                />
              </div>
            )}
          </div>

          {/* Reference */}
          <div className="space-y-2">
            <Label htmlFor="referenceId">Reference / PO Number</Label>
            <Input
              id="referenceId"
              {...register("referenceId")}
              placeholder="e.g. PO-2024-001"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              placeholder={
                selectedType === "DAMAGE"
                  ? "Describe the damage..."
                  : "Additional notes..."
              }
              rows={3}
            />
          </div>

          {/* Preview */}
          {watch("quantity") > 0 && (
            <div className="p-3 rounded-lg bg-muted/50 border">
              <p className="text-sm text-muted-foreground mb-1">
                After this movement:
              </p>
              <p className="text-lg font-bold">
                {["STOCK_IN", "ADJUSTMENT"].includes(selectedType)
                  ? item.stockQuantity + watch("quantity")
                  : item.stockQuantity - watch("quantity")}{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  {item.unit.abbreviation}
                </span>
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                onClose();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Record Movement
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
