import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle } from "lucide-react";
import type { StockTransactionType } from "@/lib/types";
import { useProductStore } from "@/store/productStore";

interface StockOutFormValues {
  productId: string;
  transactionType: StockTransactionType;
  quantity: number;
  unitPrice?: number;
  reference?: string;
  notes?: string;
}

interface StockOutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: StockOutFormValues) => Promise<void>;
  loading?: boolean;
}

const stockOutTypes: { value: StockTransactionType; label: string }[] = [
  { value: "SALE", label: "Sale to Customer" },
  { value: "DAMAGE", label: "Damaged/Expired" },
  { value: "RETURN_TO_SUPPLIER", label: "Return to Supplier" },
  { value: "ADJUSTMENT_OUT", label: "Manual Adjustment (Decrease)" },
];

export function StockOutDialog({
  open,
  onOpenChange,
  onSubmit,
  loading = false,
}: StockOutDialogProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const { products, fetchProducts } = useProductStore();

  const form = useForm<StockOutFormValues>({
    defaultValues: {
      productId: "",
      transactionType: "SALE",
      quantity: 0,
      unitPrice: 0,
      reference: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (open) {
      fetchProducts({ limit: 100 });
    }
  }, [open]);

  const validateForm = (data: StockOutFormValues): boolean => {
    const newErrors: Record<string, string> = {};

    if (!data.productId) {
      newErrors.productId = "Product is required";
    }

    if (!data.transactionType) {
      newErrors.transactionType = "Transaction type is required";
    }

    if (!data.quantity || data.quantity <= 0) {
      newErrors.quantity = "Quantity must be greater than 0";
    }

    // Check if quantity exceeds available stock
    if (selectedProduct && data.quantity > selectedProduct.stockQuantity) {
      newErrors.quantity = `Insufficient stock. Available: ${selectedProduct.stockQuantity}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (data: StockOutFormValues) => {
    if (!validateForm(data)) {
      return;
    }

    try {
      await onSubmit(data);
      form.reset();
      setSelectedProduct(null);
      onOpenChange(false);
    } catch (error) {
      // Error handled by parent
    }
  };

  const handleProductChange = (productId: string) => {
    const product = products.find((p) => p.productId === productId);
    setSelectedProduct(product);
    form.setValue("productId", productId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-2xl sm:max-w-3xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>Stock Out</DialogTitle>
          <DialogDescription>
            Remove stock from inventory. This will decrease the product
            quantity.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-3 sm:space-y-4"
          >
            <FormField
              control={form.control}
              name="productId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product *</FormLabel>
                  <Select
                    onValueChange={handleProductChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a product" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-60 overflow-y-auto">
                      {products.map((product) => (
                        <SelectItem
                          key={product.productId}
                          value={product.productId}
                          className="py-2"
                        >
                          <div className="flex flex-col">
                            <span className="font-medium wrap-break-word">
                              {product.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              SKU: {product.sku} • Available:{" "}
                              {product.stockQuantity}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.productId && (
                    <p className="text-xs sm:text-sm font-medium text-destructive">
                      {errors.productId}
                    </p>
                  )}
                </FormItem>
              )}
            />
            {selectedProduct && selectedProduct.stockQuantity <= 10 && (
              <div className="flex items-start gap-2 rounded-md bg-yellow-500/10 p-3 text-xs sm:text-sm text-yellow-600 dark:text-yellow-500">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>
                  Low stock warning: Only {selectedProduct.stockQuantity} units
                  available
                </span>
              </div>
            )}
            <FormField
              control={form.control}
              name="transactionType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transaction Type *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-50 sm:max-h-75">
                      {stockOutTypes.map((type) => (
                        <SelectItem
                          key={type.value}
                          value={type.value}
                          className="text-sm"
                        >
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.transactionType && (
                    <p className="text-xs sm:text-sm font-medium text-destructive">
                      {errors.transactionType}
                    </p>
                  )}
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={() => (
                  <FormItem>
                    <FormLabel>Quantity *</FormLabel>
                    <FormControl>
                      <Controller
                        name="quantity"
                        control={form.control}
                        render={({ field }) => (
                          <Input
                            type="number"
                            placeholder="0"
                            value={field.value || ""}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                            className="w-full"
                          />
                        )}
                      />
                    </FormControl>
                    {errors.quantity && (
                      <p className="text-xs sm:text-sm font-medium text-destructive">
                        {errors.quantity}
                      </p>
                    )}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unitPrice"
                render={() => (
                  <FormItem>
                    <FormLabel>Unit Price</FormLabel>
                    <FormControl>
                      <Controller
                        name="unitPrice"
                        control={form.control}
                        render={({ field }) => (
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={field.value || ""}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                            className="w-full"
                          />
                        )}
                      />
                    </FormControl>
                    <FormDescription className="text-xs sm:text-sm">
                      Sale price per unit
                    </FormDescription>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="reference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reference Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="INV-12345"
                      {...field}
                      className="w-full"
                    />
                  </FormControl>
                  <FormDescription className="text-xs sm:text-sm">
                    Invoice or order number
                  </FormDescription>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional notes..."
                      {...field}
                      rows={3}
                      className="w-full resize-none"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter className="sticky bottom-0 bg-background pt-3 flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="destructive"
                className="w-full sm:w-auto"
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Remove Stock
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
