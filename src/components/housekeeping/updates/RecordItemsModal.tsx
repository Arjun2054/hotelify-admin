// src/components/housekeeping/RecordItemsModal.tsx
"use client";

import { useState } from "react";
import { X, Package, Plus, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import type {
  HousekeepingTask,
  RecordItemUsedPayload,
} from "@/types/houseKeeping-types";
import { useHousekeepingStore } from "@/store/houseKeeping/useHousekeepingStore";

interface RecordItemsModalProps {
  task: HousekeepingTask;
  onClose: () => void;
  onSuccess: () => void;
}

export function RecordItemsModal({
  task,
  onClose,
  onSuccess,
}: RecordItemsModalProps) {
  const { recordItems, standardItems, isLoading } = useHousekeepingStore();

  const [items, setItems] = useState<
    (RecordItemUsedPayload & { name: string; unit: string })[]
  >([{ itemId: "", name: "", unit: "", quantityUsed: 1, isDamaged: false }]);

  const addItem = () => {
    setItems([
      ...items,
      { itemId: "", name: "", unit: "", quantityUsed: 1, isDamaged: false },
    ]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: any) => {
    setItems(
      items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      ),
    );
  };

  const handleStandardItemSelect = (index: number, itemId: string) => {
    const si = standardItems.find((s) => s.itemId === itemId);
    if (si) {
      setItems(
        items.map((item, i) =>
          i === index
            ? {
                ...item,
                itemId: si.itemId,
                name: si.itemName,
                unit: si.unit.abbreviation,
                quantityUsed: si.standardQty,
              }
            : item,
        ),
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validItems = items.filter((i) => i.itemId && i.quantityUsed > 0);
    if (validItems.length === 0) return;

    try {
      await recordItems(
        task.id,
        validItems.map(({ itemId, quantityUsed, isDamaged, damageNotes }) => ({
          itemId,
          quantityUsed,
          isDamaged,
          damageNotes: damageNotes || undefined,
        })),
      );
      onSuccess();
    } catch {
      // handled by store
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Record Items Used
              </h2>
              <p className="text-sm text-gray-500">
                Room {task.room.roomNumber}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <form
            id="recordItemsForm"
            onSubmit={handleSubmit}
            className="space-y-3"
          >
            {items.map((item, idx) => (
              <div
                key={idx}
                className={`border rounded-xl p-3 space-y-2 ${
                  item.isDamaged
                    ? "border-red-200 bg-red-50"
                    : "border-gray-200"
                }`}
              >
                {/* Select + Remove */}
                <div className="flex items-center gap-2">
                  <select
                    value={item.itemId}
                    onChange={(e) =>
                      handleStandardItemSelect(idx, e.target.value)
                    }
                    className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select item...</option>
                    {standardItems.map((si) => (
                      <option key={si.itemId} value={si.itemId}>
                        {si.itemName} ({si.currentStock} {si.unit.abbreviation}{" "}
                        in stock)
                      </option>
                    ))}
                  </select>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Quantity */}
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-500 w-16">
                    Qty used:
                  </label>
                  <input
                    type="number"
                    min="0.001"
                    step="0.001"
                    value={item.quantityUsed}
                    onChange={(e) =>
                      updateItem(
                        idx,
                        "quantityUsed",
                        parseFloat(e.target.value) || 0,
                      )
                    }
                    className="w-20 px-2 py-1 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  {item.unit && (
                    <span className="text-xs text-gray-400">{item.unit}</span>
                  )}
                </div>

                {/* Damaged */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={item.isDamaged}
                    onChange={(e) =>
                      updateItem(idx, "isDamaged", e.target.checked)
                    }
                    className="w-4 h-4 text-red-500 rounded"
                  />
                  <span className="text-xs text-gray-600 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                    Damaged item
                  </span>
                </label>

                {item.isDamaged && (
                  <textarea
                    placeholder="Damage description..."
                    value={item.damageNotes ?? ""}
                    onChange={(e) =>
                      updateItem(idx, "damageNotes", e.target.value)
                    }
                    rows={2}
                    className="w-full px-2 py-1.5 border border-red-200 rounded-lg text-xs resize-none focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={addItem}
              className="w-full py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-blue-300 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Another Item
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-200 text-gray-600 rounded-xl hover:bg-white transition-colors"
          >
            Cancel
          </button>
          <button
            form="recordItemsForm"
            type="submit"
            disabled={isLoading || items.every((i) => !i.itemId)}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Package className="w-4 h-4" />
            )}
            Save Items
          </button>
        </div>
      </div>
    </div>
  );
}
