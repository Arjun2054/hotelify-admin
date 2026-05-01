import { useState, useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
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
import { Loader2, Plus, Trash2 } from "lucide-react";
import type { PaymentMethod, Sale, SaleStatus } from "@/lib/types";
import { useProductStore } from "@/store/productStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatCurrency } from "@/lib/utils";

interface SaleFormValues {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  saleDate: string;
  status: SaleStatus;
  paymentMethod: PaymentMethod;
  discount: number;
  tax: number;
  shippingCost: number;
  amountPaid: number;
  notes?: string;
  items: {
    productId: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    tax: number;
  }[];
}

interface SaleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sale?: Sale | null;
  onSubmit: (data: SaleFormValues) => Promise<void>;
  loading?: boolean;
}

const paymentMethods: { value: PaymentMethod; label: string }[] = [
  { value: "CASH", label: "Cash" },
  { value: "CREDIT_CARD", label: "Credit Card" },
  { value: "DEBIT_CARD", label: "Debit Card" },
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
  { value: "OTHER", label: "Other" },
];

export function SaleDialog({
  open,
  onOpenChange,
  sale,
  onSubmit,
  loading = false,
}: SaleDialogProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { products, fetchProducts } = useProductStore();

  const form = useForm<SaleFormValues>({
    defaultValues: {
      customerName: sale?.customerName || "",
      customerEmail: sale?.customerEmail || "",
      customerPhone: sale?.customerPhone || "",
      saleDate: sale?.saleDate
        ? new Date(sale.saleDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      status: sale?.status || "PENDING",
      paymentMethod: sale?.paymentMethod || "CASH",
      discount: sale?.discount || 0,
      tax: sale?.tax || 0,
      shippingCost: sale?.shippingCost || 0,
      amountPaid: sale?.amountPaid || 0,
      notes: sale?.notes || "",
      items: sale?.items?.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount || 0,
        tax: item.tax || 0,
      })) || [
        { productId: "", quantity: 1, unitPrice: 0, discount: 0, tax: 0 },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  useEffect(() => {
    if (open) {
      fetchProducts({ limit: 100 });
    }
  }, [open, fetchProducts]);

  useEffect(() => {
    if (open && sale) {
      form.reset({
        customerName: sale.customerName || "",
        customerEmail: sale.customerEmail || "",
        customerPhone: sale.customerPhone || "",
        saleDate: new Date(sale.saleDate).toISOString().split("T")[0],
        status: sale.status,
        paymentMethod: sale.paymentMethod,
        discount: sale.discount || 0,
        tax: sale.tax || 0,
        shippingCost: sale.shippingCost || 0,
        amountPaid: sale.amountPaid || 0,
        notes: sale.notes || "",
        items: sale.items?.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount || 0,
          tax: item.tax || 0,
        })) || [
          { productId: "", quantity: 1, unitPrice: 0, discount: 0, tax: 0 },
        ],
      });
    }
  }, [open, sale, form]);

  const watchItems = form.watch("items");
  const watchDiscount = form.watch("discount");
  const watchTax = form.watch("tax");
  const watchShipping = form.watch("shippingCost");

  // Calculate totals
  const subtotal = watchItems.reduce((sum, item) => {
    return sum + (Number(item.unitPrice) || 0) * (Number(item.quantity) || 0);
  }, 0);

  const total =
    subtotal -
    (Number(watchDiscount) || 0) +
    (Number(watchTax) || 0) +
    (Number(watchShipping) || 0);

  const handleProductChange = (index: number, productId: string) => {
    const product = products.find((p) => p.productId === productId);
    if (product) {
      form.setValue(`items.${index}.unitPrice`, product.price);
    }
  };

  const validateForm = (data: SaleFormValues): boolean => {
    const newErrors: Record<string, string> = {};

    if (!data.items || data.items.length === 0) {
      newErrors.items = "At least one item is required";
    }

    if (!data.saleDate) {
      newErrors.saleDate = "Sale date is required";
    }

    if (!data.paymentMethod) {
      newErrors.paymentMethod = "Payment method is required";
    }

    data.items.forEach((item, index) => {
      if (!item.productId) {
        newErrors[`items.${index}.productId`] = "Product is required";
      }
      if (!item.quantity || item.quantity <= 0) {
        newErrors[`items.${index}.quantity`] =
          "Quantity must be greater than 0";
      }
      if (!item.unitPrice || item.unitPrice <= 0) {
        newErrors[`items.${index}.unitPrice`] =
          "Unit price must be greater than 0";
      }
    });

    // Validate amount paid doesn't exceed total
    const subtotal = data.items.reduce(
      (sum, item) =>
        sum + (Number(item.unitPrice) || 0) * (Number(item.quantity) || 0),
      0,
    );
    const total =
      subtotal -
      (Number(data.discount) || 0) +
      (Number(data.tax) || 0) +
      (Number(data.shippingCost) || 0);

    if (Number(data.amountPaid) > total) {
      newErrors.amountPaid = "Amount paid cannot exceed total amount";
    }

    if (Number(data.amountPaid) < 0) {
      newErrors.amountPaid = "Amount paid cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (data: SaleFormValues) => {
    if (!validateForm(data)) return;

    try {
      await onSubmit(data);
      form.reset();
      setErrors({});
      onOpenChange(false);
    } catch (error) {
      // Error handled by parent
    }
  };

  const handleAddItem = () => {
    append({ productId: "", quantity: 1, unitPrice: 0, discount: 0, tax: 0 });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[90vw] lg:max-w-5xl max-h-screen overflow-hidden p-0">
        <DialogHeader className="px-4 pt-6 sm:px-6">
          <DialogTitle className="text-lg sm:text-xl">
            {sale ? "Edit Sale" : "Create Sale"}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {sale
              ? "Update the sale information below"
              : "Create a new sale transaction"}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-140px)] px-4 sm:px-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6 pb-6"
            >
              {/* Customer Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Customer Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="customerEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="john@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="customerPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 234 567 8900" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Sale Details */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Sale Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="saleDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sale Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="COMPLETED">Completed</SelectItem>
                            <SelectItem value="CANCELLED" disabled={!sale}>
                              Cancelled
                            </SelectItem>
                            <SelectItem value="REFUNDED" disabled={!sale}>
                              Refunded
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Method</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select payment method" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {paymentMethods.map((method) => (
                              <SelectItem
                                key={method.value}
                                value={method.value}
                              >
                                {method.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Items */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Items</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddItem}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>

                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="flex flex-col sm:flex-row gap-3 p-4 border rounded-lg bg-muted/30"
                    >
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {/* Product Select */}
                        <FormField
                          control={form.control}
                          name={`items.${index}.productId`}
                          render={({ field }) => (
                            <FormItem className="sm:col-span-2">
                              <FormLabel className="text-xs">Product</FormLabel>
                              <Select
                                onValueChange={(value) => {
                                  field.onChange(value);
                                  handleProductChange(index, value);
                                }}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="truncate">
                                    <SelectValue placeholder="Select product" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {products.map((product) => (
                                    <SelectItem
                                      key={product.productId}
                                      value={product.productId}
                                    >
                                      <span className="truncate text-wrap lg:text-sm">
                                        {product.name} - ${product.price}
                                      </span>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {errors[`items.${index}.productId`] && (
                                <p className="text-xs text-destructive">
                                  {errors[`items.${index}.productId`]}
                                </p>
                              )}
                            </FormItem>
                          )}
                        />

                        {/* Quantity */}
                        <FormField
                          control={form.control}
                          name={`items.${index}.quantity`}
                          render={() => (
                            <FormItem>
                              <FormLabel className="text-xs">Qty</FormLabel>
                              <Controller
                                name={`items.${index}.quantity`}
                                control={form.control}
                                render={({ field }) => (
                                  <Input
                                    type="number"
                                    min="1"
                                    placeholder="1"
                                    value={field.value || ""}
                                    onChange={(e) =>
                                      field.onChange(Number(e.target.value))
                                    }
                                  />
                                )}
                              />
                              {errors[`items.${index}.quantity`] && (
                                <p className="text-xs text-destructive">
                                  {errors[`items.${index}.quantity`]}
                                </p>
                              )}
                            </FormItem>
                          )}
                        />

                        {/* Unit Price */}
                        <FormField
                          control={form.control}
                          name={`items.${index}.unitPrice`}
                          render={() => (
                            <FormItem>
                              <FormLabel className="text-xs">Price</FormLabel>
                              <Controller
                                name={`items.${index}.unitPrice`}
                                control={form.control}
                                render={({ field }) => (
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="0.00"
                                    value={field.value || ""}
                                    onChange={(e) =>
                                      field.onChange(Number(e.target.value))
                                    }
                                  />
                                )}
                              />
                              {errors[`items.${index}.unitPrice`] && (
                                <p className="text-xs text-destructive">
                                  {errors[`items.${index}.unitPrice`]}
                                </p>
                              )}
                            </FormItem>
                          )}
                        />

                        {/* Total for this item */}
                        <div className="flex flex-col justify-end sm:col-span-2 lg:col-span-4">
                          <div className="text-xs text-muted-foreground mb-1">
                            Item Total
                          </div>
                          <div className="text-sm font-semibold">
                            {formatCurrency(
                              (Number(watchItems[index]?.quantity) || 0) *
                                (Number(watchItems[index]?.unitPrice) || 0),
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Remove button */}
                      {fields.length > 1 && (
                        <div className="flex items-start sm:items-center">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => remove(index)}
                            className="h-8 w-8"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}

                  {errors.items && (
                    <p className="text-sm font-medium text-destructive">
                      {errors.items}
                    </p>
                  )}
                </div>
              </div>

              {/* Pricing */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <FormField
                    control={form.control}
                    name="discount"
                    render={() => (
                      <FormItem>
                        <FormLabel>Discount</FormLabel>
                        <Controller
                          name="discount"
                          control={form.control}
                          render={({ field }) => (
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={field.value || ""}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value) || 0)
                              }
                            />
                          )}
                        />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tax"
                    render={() => (
                      <FormItem>
                        <FormLabel>Tax</FormLabel>
                        <Controller
                          name="tax"
                          control={form.control}
                          render={({ field }) => (
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={field.value || ""}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value) || 0)
                              }
                            />
                          )}
                        />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="shippingCost"
                    render={() => (
                      <FormItem>
                        <FormLabel>Shipping</FormLabel>
                        <Controller
                          name="shippingCost"
                          control={form.control}
                          render={({ field }) => (
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={field.value || ""}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value) || 0)
                              }
                            />
                          )}
                        />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="amountPaid"
                    render={() => (
                      <FormItem>
                        <FormLabel>Amount Paid</FormLabel>
                        <Controller
                          name="amountPaid"
                          control={form.control}
                          render={({ field }) => (
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={field.value || ""}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value) || 0)
                              }
                            />
                          )}
                        />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Summary */}
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span className="font-medium">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Discount:</span>
                    <span className="font-medium text-destructive">
                      {formatCurrency(Number(watchDiscount) || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax:</span>
                    <span className="font-medium">
                      {formatCurrency(Number(watchTax) || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping:</span>
                    <span className="font-medium">
                      {formatCurrency(Number(watchShipping) || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-base sm:text-lg font-bold border-t pt-2 mt-2">
                    <span>Total:</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Amount Due:</span>
                    <span className="font-medium">
                      {formatCurrency(total - Number(form.watch("amountPaid")))}
                    </span>
                  </div>
                </div>
              </div>

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
                        className="resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </ScrollArea>

        <DialogFooter className="px-4 pb-6 sm:px-6 flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              form.reset();
              setErrors({});
              onOpenChange(false);
            }}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={form.handleSubmit(handleSubmit)}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {sale ? "Update Sale" : "Create Sale"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
