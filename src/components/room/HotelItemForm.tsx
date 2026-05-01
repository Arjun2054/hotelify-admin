import { useHotelItemStore } from "@/store/room/hotelItemStore";
import { useUnitStore } from "@/store/room/unitStore";
import type { CreateHotelItemForm, HotelItem } from "@/types/room-types";
import { useState, useEffect } from "react";
import { Button, Input, Select, Textarea } from "../shared/Formfields";
import { useCategoryStore } from "@/store/categoryStore";
import { useSupplierStore } from "@/store/supplierStore";

interface HotelItemFormProps {
  item?: HotelItem;
  onSuccess: () => void;
  onCancel: () => void;
}

const defaultForm: CreateHotelItemForm = {
  categoryId: "",
  supplierId: "",
  unitId: "",
  name: "",
  description: "",
  sku: "",
  barcode: "",
  minimumStock: 0,
  reorderPoint: 0,
  costPrice: 0,
  imageUrl: "",
};

export function HotelItemForm({
  item,
  onSuccess,
  onCancel,
}: HotelItemFormProps) {
  const { createItem, updateItem, isSubmitting, error, clearError } =
    useHotelItemStore();
  const { units, fetchUnits } = useUnitStore();
  const { categories, fetchCategories } = useCategoryStore();
  const { suppliers, fetchSuppliers } = useSupplierStore();

  const [form, setForm] = useState<CreateHotelItemForm>(
    item
      ? {
          categoryId: item.categoryId,
          supplierId: item.supplierId,
          unitId: item.unitId,
          name: item.name,
          description: item.description ?? "",
          sku: item.sku ?? "",
          barcode: item.barcode ?? "",
          minimumStock: Number(item.minimumStock),
          reorderPoint: Number(item.reorderPoint),
          costPrice: Number(item.costPrice),
          imageUrl: item.imageUrl ?? "",
        }
      : defaultForm,
  );
  const [errors, setErrors] = useState<
    Partial<Record<keyof CreateHotelItemForm, string>>
  >({});

  useEffect(() => {
    fetchUnits();
    fetchCategories();
    fetchSuppliers();
    return () => clearError();
  }, []);

  const validate = () => {
    const errs: typeof errors = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.categoryId) errs.categoryId = "Category is required";
    if (!form.supplierId) errs.supplierId = "Supplier is required";
    if (!form.unitId) errs.unitId = "Unit is required";
    if (form.costPrice < 0) errs.costPrice = "Cost price cannot be negative";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      if (item) await updateItem(item.id, form);
      else await createItem(form);
      onSuccess();
    } catch {}
  };

  const set = <K extends keyof CreateHotelItemForm>(
    key: K,
    value: CreateHotelItemForm[K],
  ) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <Input
        label="Item Name"
        required
        value={form.name}
        onChange={(e) => set("name", e.target.value)}
        placeholder="e.g. Bath Towel, Shampoo Bottle, Bed Sheet"
        error={errors.name}
      />

      {/* Stack to 1 col on mobile, 2 col on sm+ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Category"
          required
          value={form.categoryId}
          onChange={(e) => set("categoryId", e.target.value)}
          error={errors.categoryId}
        >
          <option value="" className="bg-gray-800">
            Select category...
          </option>
          {categories.map((c) => (
            <option
              key={c.categoryId}
              value={c.categoryId}
              className="bg-gray-800"
            >
              {c.name}
            </option>
          ))}
        </Select>

        <Select
          label="Supplier"
          required
          value={form.supplierId}
          onChange={(e) => set("supplierId", e.target.value)}
          error={errors.supplierId}
        >
          <option value="" className="bg-gray-800">
            Select supplier...
          </option>
          {suppliers.map((c) => (
            <option
              key={c.supplierId}
              value={c.supplierId}
              className="bg-gray-800"
            >
              {c.name}
            </option>
          ))}
        </Select>

        {/* Unit spans full width on mobile, half on sm */}
        <Select
          label="Unit of Measure"
          required
          value={form.unitId}
          onChange={(e) => set("unitId", e.target.value)}
          error={errors.unitId}
        >
          <option value="" className="bg-gray-800">
            Select unit...
          </option>
          {units.map((u) => (
            <option key={u.id} value={u.id} className="bg-gray-800">
              {u.name} ({u.abbreviation})
            </option>
          ))}
        </Select>
      </div>

      <Textarea
        label="Description"
        value={form.description}
        onChange={(e) => set("description", e.target.value)}
        placeholder="Optional notes about this item..."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="SKU"
          value={form.sku}
          onChange={(e) => set("sku", e.target.value)}
          placeholder="e.g. TOWEL-BATH-WHT"
        />
        <Input
          label="Barcode"
          value={form.barcode}
          onChange={(e) => set("barcode", e.target.value)}
          placeholder="Scan or enter..."
        />
      </div>

      {/* 1 col on mobile, 3 col on sm+ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input
          label="Cost Price"
          type="number"
          min={0}
          step={0.01}
          value={form.costPrice}
          onChange={(e) => set("costPrice", Number(e.target.value))}
          placeholder="0.00"
          error={errors.costPrice as string}
        />
        <Input
          label="Minimum Stock"
          type="number"
          min={0}
          step={0.001}
          value={form.minimumStock}
          onChange={(e) => set("minimumStock", Number(e.target.value))}
          hint="Critical threshold"
        />
        <Input
          label="Reorder Point"
          type="number"
          min={0}
          step={0.001}
          value={form.reorderPoint}
          onChange={(e) => set("reorderPoint", Number(e.target.value))}
          hint="Trigger restocking"
        />
      </div>

      <Input
        label="Image URL"
        type="url"
        value={form.imageUrl}
        onChange={(e) => set("imageUrl", e.target.value)}
        placeholder="https://..."
      />

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          loading={isSubmitting}
          className="w-full sm:w-auto"
        >
          {item ? "Update Item" : "Create Item"}
        </Button>
      </div>
    </form>
  );
}
