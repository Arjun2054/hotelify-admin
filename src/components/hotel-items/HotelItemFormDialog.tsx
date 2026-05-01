import { useEffect } from "react";
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
import { Loader2, Package, DollarSign, Truck } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import type {
  Category,
  CreateHotelItemPayload,
  HotelItem,
  Supplier,
  Unit,
} from "@/types/hotelItem-types";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateHotelItemPayload) => Promise<void>;
  editingItem?: HotelItem | null;
  categories: Category[];
  units: Unit[];
  suppliers: Supplier[];
  isLoading: boolean;
}

export function HotelItemFormDialog({
  open,
  onClose,
  onSubmit,
  editingItem,
  categories,
  units,
  suppliers,
  isLoading,
}: Props) {
  const isEdit = !!editingItem;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateHotelItemPayload>();

  useEffect(() => {
    if (editingItem) {
      reset({
        categoryId: editingItem.categoryId,
        unitId: editingItem.unitId,
        name: editingItem.name,
        description: editingItem.description ?? "",
        sku: editingItem.sku ?? "",
        barcode: editingItem.barcode ?? "",
        stockQuantity: editingItem.stockQuantity,
        minimumStock: editingItem.minimumStock,
        reorderPoint: editingItem.reorderPoint,
        costPrice: editingItem.costPrice,
        imageUrl: editingItem.imageUrl ?? "",
        supplierId: editingItem.supplierId ?? "",
      });
    } else {
      reset({
        categoryId: "",
        unitId: "",
        name: "",
        description: "",
        sku: "",
        barcode: "",
        stockQuantity: 0,
        minimumStock: 0,
        reorderPoint: 0,
        costPrice: 0,
        imageUrl: "",
        supplierId: "",
      });
    }
  }, [editingItem, reset, open]);

  const onFormSubmit = async (data: CreateHotelItemPayload) => {
    const cleanData = {
      ...data,
      description: data.description || undefined,
      sku: data.sku || undefined,
      barcode: data.barcode || undefined,
      imageUrl: data.imageUrl || undefined,
      supplierId: data.supplierId || undefined,
    };
    await onSubmit(cleanData);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-[700px] md:max-w-[800px] lg:max-w-[900px] xl:max-w-[1000px] max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-lg sm:rounded-xl">
        {/* Header */}
        <DialogHeader className="sticky top-0 z-10 bg-background border-b px-4 py-4 sm:px-6 md:px-8 sm:py-5">
          <DialogTitle className="text-base sm:text-lg md:text-xl font-semibold leading-tight">
            {isEdit ? "Edit Hotel Item" : "Add New Hotel Item"}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-1">
            {isEdit
              ? "Update item details. Stock changes should be done via stock movements."
              : "Add a new item to your hotel inventory."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col">
          <div className="px-4 py-4 sm:px-6 md:px-8 sm:py-5 md:py-6 space-y-5 sm:space-y-6 md:space-y-8">
            {/* ── Basic Information ─────────────────────────── */}
            <section>
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <Package className="h-4 w-4 text-primary shrink-0" />
                <h4 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Basic Information
                </h4>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {/* Item Name & Description - side by side on large screens */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="name"
                      className="text-xs sm:text-sm font-medium"
                    >
                      Item Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      {...register("name", { required: "Name is required" })}
                      placeholder="e.g. Bath Towels, Shampoo, Pillows"
                      className="h-9 sm:h-10 md:h-11 text-sm"
                    />
                    {errors.name && (
                      <p className="text-[11px] sm:text-xs text-red-500">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="description"
                      className="text-xs sm:text-sm font-medium"
                    >
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      {...register("description")}
                      placeholder="Optional description..."
                      rows={1}
                      className="text-sm resize-none min-h-[36px] sm:min-h-[40px] md:min-h-[44px]"
                    />
                  </div>
                </div>

                {/* Category & Unit */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div className="space-y-1.5 sm:col-span-1 lg:col-span-1">
                    <Label className="text-xs sm:text-sm font-medium">
                      Category <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={watch("categoryId")}
                      onValueChange={(val) => setValue("categoryId", val)}
                    >
                      <SelectTrigger className="h-9 sm:h-10 md:h-11 text-sm">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories
                          .filter((c) => c.isActive)
                          .map((c) => (
                            <SelectItem key={c.categoryId} value={c.categoryId}>
                              {c.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    {errors.categoryId && (
                      <p className="text-[11px] sm:text-xs text-red-500">
                        Category is required
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5 sm:col-span-1 lg:col-span-1">
                    <Label className="text-xs sm:text-sm font-medium">
                      Unit of Measure <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={watch("unitId")}
                      onValueChange={(val) => setValue("unitId", val)}
                    >
                      <SelectTrigger className="h-9 sm:h-10 md:h-11 text-sm">
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {units.map((u) => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.name} ({u.abbreviation})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.unitId && (
                      <p className="text-[11px] sm:text-xs text-red-500">
                        Unit is required
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="sku"
                      className="text-xs sm:text-sm font-medium"
                    >
                      SKU
                    </Label>
                    <Input
                      id="sku"
                      {...register("sku")}
                      placeholder="e.g. HTL-TWL-001"
                      className="h-9 sm:h-10 md:h-11 text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="barcode"
                      className="text-xs sm:text-sm font-medium"
                    >
                      Barcode
                    </Label>
                    <Input
                      id="barcode"
                      {...register("barcode")}
                      placeholder="Barcode number"
                      className="h-9 sm:h-10 md:h-11 text-sm"
                    />
                  </div>
                </div>
              </div>
            </section>

            <Separator />

            {/* ── Stock & Pricing ───────────────────────────── */}
            <section>
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <DollarSign className="h-4 w-4 text-primary shrink-0" />
                <h4 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Stock & Pricing
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {!isEdit && (
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="stockQuantity"
                      className="text-xs sm:text-sm font-medium"
                    >
                      Initial Stock
                    </Label>
                    <Input
                      id="stockQuantity"
                      type="number"
                      step="0.001"
                      min="0"
                      {...register("stockQuantity", { valueAsNumber: true })}
                      className="h-9 sm:h-10 md:h-11 text-sm"
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label
                    htmlFor="costPrice"
                    className="text-xs sm:text-sm font-medium"
                  >
                    Cost Price (RS)
                  </Label>
                  <Input
                    id="costPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    {...register("costPrice", { valueAsNumber: true })}
                    className="h-9 sm:h-10 md:h-11 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="minimumStock"
                    className="text-xs sm:text-sm font-medium"
                  >
                    Minimum Stock
                  </Label>
                  <Input
                    id="minimumStock"
                    type="number"
                    step="0.001"
                    min="0"
                    {...register("minimumStock", { valueAsNumber: true })}
                    className="h-9 sm:h-10 md:h-11 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="reorderPoint"
                    className="text-xs sm:text-sm font-medium"
                  >
                    Reorder Point
                  </Label>
                  <Input
                    id="reorderPoint"
                    type="number"
                    step="0.001"
                    min="0"
                    {...register("reorderPoint", { valueAsNumber: true })}
                    className="h-9 sm:h-10 md:h-11 text-sm"
                  />
                </div>
              </div>
            </section>

            <Separator />

            {/* ── Supplier & Image ──────────────────────────── */}
            <section>
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <Truck className="h-4 w-4 text-primary shrink-0" />
                <h4 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Supplier & Image
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs sm:text-sm font-medium">
                    Supplier{" "}
                    <span className="text-muted-foreground font-normal">
                      (Optional)
                    </span>
                  </Label>
                  <Select
                    value={watch("supplierId") ?? "none"}
                    onValueChange={(val) =>
                      setValue("supplierId", val === "none" ? "" : val)
                    }
                  >
                    <SelectTrigger className="h-9 sm:h-10 md:h-11 text-sm">
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No supplier</SelectItem>
                      {suppliers.map((s) => (
                        <SelectItem key={s.supplierId} value={s.supplierId}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="imageUrl"
                    className="text-xs sm:text-sm font-medium"
                  >
                    Image URL
                  </Label>
                  <Input
                    id="imageUrl"
                    type="url"
                    {...register("imageUrl")}
                    placeholder="https://example.com/image.jpg"
                    className="h-9 sm:h-10 md:h-11 text-sm"
                  />
                </div>
              </div>
            </section>
          </div>

          {/* Footer */}
          <DialogFooter className="sticky bottom-0 bg-background border-t px-4 py-3 sm:px-6 md:px-8 sm:py-4 flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-full sm:w-auto h-9 sm:h-10 md:h-11 text-sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto h-9 sm:h-10 md:h-11 text-sm"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Update Item" : "Create Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
