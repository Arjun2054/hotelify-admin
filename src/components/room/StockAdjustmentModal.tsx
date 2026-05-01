import { useState } from "react";
import {
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  RefreshCw,
  MoveRight,
  Trash2,
} from "lucide-react";
import type {
  HotelItem,
  StockAdjustmentForm,
  StockMovementType,
} from "@/types/room-types";
import { useHotelItemStore } from "@/store/room/hotelItemStore";
import { Modal } from "../shared/Modal";
import { Button, Input, Textarea } from "../shared/Formfields";

interface StockAdjustmentModalProps {
  item: HotelItem;
  onClose: () => void;
}

interface MovementTypeConfig {
  label: string;
  icon: React.ReactNode;
  direction: "in" | "out" | "neutral";
  color: string;
}

const movementTypes: Record<StockMovementType, MovementTypeConfig> = {
  STOCK_IN: {
    label: "Stock In",
    icon: <ArrowUp size={14} />,
    direction: "in",
    color: "text-emerald-400",
  },
  STOCK_OUT: {
    label: "Stock Out",
    icon: <ArrowDown size={14} />,
    direction: "out",
    color: "text-blue-400",
  },
  DAMAGE: {
    label: "Damage",
    icon: <AlertTriangle size={14} />,
    direction: "out",
    color: "text-red-400",
  },
  TRANSFER: {
    label: "Transfer",
    icon: <MoveRight size={14} />,
    direction: "neutral",
    color: "text-violet-400",
  },
  ADJUSTMENT: {
    label: "Adjustment",
    icon: <RefreshCw size={14} />,
    direction: "neutral",
    color: "text-amber-400",
  },
  WASTAGE: {
    label: "Wastage",
    icon: <Trash2 size={14} />,
    direction: "out",
    color: "text-orange-400",
  },
};

export function StockAdjustmentModal({
  item,
  onClose,
}: StockAdjustmentModalProps) {
  const {
    adjustStock,
    isSubmitting,
    error,
    clearError,
    fetchItems,
    fetchSummary,
  } = useHotelItemStore();
  const [form, setForm] = useState<StockAdjustmentForm>({
    type: "STOCK_IN",
    quantity: 0,
    unitCost: undefined,
    notes: "",
  });
  const [localError, setLocalError] = useState("");

  const currentStock = Number(item.stockQuantity);
  const config = movementTypes[form.type];
  const outTypes: StockMovementType[] = ["STOCK_OUT", "DAMAGE", "WASTAGE"];
  const isOut = outTypes.includes(form.type);
  const newStock = isOut
    ? Math.max(0, currentStock - form.quantity)
    : form.type === "ADJUSTMENT"
      ? form.quantity
      : currentStock + form.quantity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    if (form.quantity <= 0) {
      setLocalError("Quantity must be greater than 0");
      return;
    }
    try {
      await adjustStock(item.id, form);
      await Promise.all([fetchItems(), fetchSummary()]);
      onClose();
    } catch {}
  };

  const set = <K extends keyof StockAdjustmentForm>(
    key: K,
    val: StockAdjustmentForm[K],
  ) => setForm((f) => ({ ...f, [key]: val }));

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Adjust Stock"
      subtitle={item.name}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {(error || localError) && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error || localError}
          </div>
        )}

        {/* Movement type grid — 2 cols on mobile, 3 on sm+ */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium uppercase tracking-wider text-slate-400">
            Movement Type
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {(Object.keys(movementTypes) as StockMovementType[]).map((t) => {
              const cfg = movementTypes[t];
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => set("type", t)}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-medium transition-all ${
                    form.type === t
                      ? `border-current bg-current/10 ${cfg.color}`
                      : "border-white/8 bg-white/3 text-slate-500 hover:border-white/15 hover:text-slate-300"
                  }`}
                >
                  <span className={form.type === t ? cfg.color : ""}>
                    {cfg.icon}
                  </span>
                  {cfg.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Current → New preview */}
        <div className="flex items-center gap-3 sm:gap-4 rounded-2xl border border-white/8 bg-white/3 px-4 sm:px-5 py-4">
          <div className="text-center">
            <p className="text-[10px] text-slate-600">Current</p>
            <p className="text-xl sm:text-2xl font-light text-white">
              {currentStock}
            </p>
            <p className="text-[10px] text-slate-600">
              {item.unit?.abbreviation}
            </p>
          </div>
          <div
            className={`flex flex-1 items-center justify-center ${config.color}`}
          >
            <div className="h-px flex-1 bg-current opacity-30" />
            <span className="mx-2">{config.icon}</span>
            <div className="h-px flex-1 bg-current opacity-30" />
          </div>
          <div className="text-center">
            <p className="text-[10px] text-slate-600">New Stock</p>
            <p
              className={`text-xl sm:text-2xl font-light ${
                newStock < Number(item.reorderPoint)
                  ? "text-amber-400"
                  : "text-white"
              }`}
            >
              {form.type === "ADJUSTMENT" ? form.quantity : newStock}
            </p>
            <p className="text-[10px] text-slate-600">
              {item.unit?.abbreviation}
            </p>
          </div>
        </div>

        {/* Quantity + unit cost */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={form.type === "ADJUSTMENT" ? "Set to Quantity" : "Quantity"}
            required
            type="number"
            min={0.001}
            step={0.001}
            value={form.quantity || ""}
            onChange={(e) => set("quantity", Number(e.target.value))}
            placeholder="0"
          />
          {form.type === "STOCK_IN" && (
            <Input
              label="Unit Cost"
              type="number"
              min={0}
              step={0.01}
              value={form.unitCost ?? ""}
              onChange={(e) =>
                set(
                  "unitCost",
                  e.target.value ? Number(e.target.value) : undefined,
                )
              }
              placeholder="0.00"
              hint="Cost per unit"
            />
          )}
        </div>

        <Textarea
          label="Notes"
          value={form.notes ?? ""}
          onChange={(e) => set("notes", e.target.value)}
          placeholder="Reason for adjustment, supplier name, reference..."
        />

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            className="w-full sm:w-auto"
            onClick={() => {
              clearError();
              onClose();
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={isSubmitting}
            className="w-full sm:w-auto"
          >
            Confirm Adjustment
          </Button>
        </div>
      </form>
    </Modal>
  );
}
