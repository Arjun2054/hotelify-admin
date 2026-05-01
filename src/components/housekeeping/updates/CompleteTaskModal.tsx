// src/components/housekeeping/CompleteTaskModal.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import {
  X,
  CheckCircle2,
  Plus,
  Trash2,
  AlertTriangle,
  Loader2,
  Package,
} from "lucide-react";
import type {
  CompleteTaskPayload,
  HousekeepingTask,
  RecordItemUsedPayload,
  RoomItemStandard,
} from "@/types/houseKeeping-types";
import { useHousekeepingStore } from "@/store/houseKeeping/useHousekeepingStore";

interface CompleteTaskModalProps {
  task: HousekeepingTask;
  onClose: () => void;
  onSuccess: () => void;
  /**
   * IDs of hotelItems already saved via RecordItemsModal.
   * These are excluded from the standard-items prefill AND from the
   * submit payload so they are never recorded a second time.
   *
   * Passed in from TaskDetailModal as:
   *   existingItemIds={task.itemsUsed.map(i => i.hotelItem.id)}
   */
  existingItemIds?: string[];
}

export function CompleteTaskModal({
  task,
  onClose,
  onSuccess,
  existingItemIds = [],
}: CompleteTaskModalProps) {
  const { completeTask, fetchStandardItems, standardItems, isLoading } =
    useHousekeepingStore();

  // ── Guard against double submission ───────────────────
  const isSubmittingRef = useRef(false);

  const [notes, setNotes] = useState("");
  const [damageNotes, setDamageNotes] = useState("");
  const [items, setItems] = useState<
    (RecordItemUsedPayload & { name: string; unit: string })[]
  >([]);
  const [loadingStandard, setLoadingStandard] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);

  // ── Load standard items ────────────────────────────────
  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setLoadingStandard(true);
    try {
      await fetchStandardItems(task.id);
    } finally {
      setLoadingStandard(false);
    }
  };

  /**
   * Prefill from standard items — but SKIP any item that was already
   * recorded via RecordItemsModal (present in existingItemIds).
   *
   * The `items.length === 0` guard prevents overwriting manual edits if
   * standardItems updates again mid-session.
   */
  useEffect(() => {
    if (standardItems.length > 0 && items.length === 0) {
      const existingSet = new Set(existingItemIds);
      setItems(
        standardItems
          .filter((si) => si.isActive && !existingSet.has(si.itemId))
          .map((si) => ({
            itemId: si.itemId,
            name: si.itemName,
            unit: si.unit.abbreviation,
            quantityUsed: si.standardQty,
            isDamaged: false,
            damageNotes: undefined,
          })),
      );
    }
  }, [standardItems]);

  // ── Item handlers ──────────────────────────────────────
  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        itemId: "",
        name: "",
        unit: "",
        quantityUsed: 1,
        isDamaged: false,
      },
    ]);
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: any) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  const selectStandardItem = (index: number, si: RoomItemStandard) => {
    setItems((prev) =>
      prev.map((item, i) =>
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
  };

  // ── Submit handler ─────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isSubmittingRef.current) return;

    setLocalError(null);

    /**
     * Safety net: even if the user somehow re-added an already-recorded
     * item manually, strip it from the payload before sending.
     */
    const existingSet = new Set(existingItemIds);
    const validItems = items.filter(
      (i) => i.itemId && i.quantityUsed > 0 && !existingSet.has(i.itemId),
    );

    // Check damaged items have notes
    const damagedWithoutNotes = validItems.filter(
      (i) => i.isDamaged && !i.damageNotes?.trim(),
    );
    if (damagedWithoutNotes.length > 0) {
      setLocalError(
        `Please add damage notes for: ${damagedWithoutNotes.map((i) => i.name).join(", ")}`,
      );
      return;
    }

    isSubmittingRef.current = true;

    const payload: CompleteTaskPayload = {
      notes: notes.trim() || undefined,
      damageNotes: damageNotes.trim() || undefined,
      items: validItems.map(
        ({ itemId, quantityUsed, isDamaged, damageNotes: dn }) => ({
          itemId,
          quantityUsed,
          isDamaged,
          damageNotes: dn?.trim() || undefined,
        }),
      ),
    };

    try {
      await completeTask(task.id, payload);
      onSuccess();
    } catch (err) {
      setLocalError((err as Error).message);
      isSubmittingRef.current = false;
    }
  };

  const hasDamage = items.some((i) => i.isDamaged);
  const isSubmitting = isLoading || isSubmittingRef.current;

  // Items already recorded — shown read-only for reference
  const alreadyRecorded = task.itemsUsed;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Complete Task</h2>
              <p className="text-sm text-gray-400">
                Room {task.room.roomNumber} · {task.room.roomType.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Error */}
          {localError && (
            <div className="flex items-start gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{localError}</p>
            </div>
          )}

          {/* ── Already-recorded items (read-only) ── */}
          {alreadyRecorded.length > 0 && (
            <div className="mb-5 border border-gray-200 rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-200">
                <Package className="w-4 h-4 text-gray-400" />
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Already Recorded ({alreadyRecorded.length})
                </p>
              </div>
              <div className="divide-y divide-gray-100">
                {alreadyRecorded.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between px-4 py-2.5"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {item.isDamaged && (
                        <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      )}
                      <p className="text-sm text-gray-700 truncate">
                        {item.hotelItem.name}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-gray-500 ml-3 shrink-0">
                      {item.quantityUsed}{" "}
                      <span className="text-xs font-normal text-gray-400">
                        {item.hotelItem.unit.abbreviation}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <form
            id="completeTaskForm"
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* ── Additional Items ── */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-gray-400" />
                  {alreadyRecorded.length > 0
                    ? "Additional Items Used"
                    : "Items Used"}
                </label>
                <button
                  type="button"
                  onClick={addItem}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Item
                </button>
              </div>

              {loadingStandard ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                </div>
              ) : items.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
                  <Package className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">
                    {alreadyRecorded.length > 0
                      ? "All standard items already recorded"
                      : "No items added"}
                  </p>
                  <button
                    type="button"
                    onClick={addItem}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    + Add item
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item, idx) => (
                    <div
                      key={idx}
                      className={`border rounded-xl p-3 space-y-2.5 ${
                        item.isDamaged
                          ? "border-red-200 bg-red-50"
                          : "border-gray-200"
                      }`}
                    >
                      {/* Item selector + remove */}
                      <div className="flex items-center gap-2">
                        <select
                          value={item.itemId}
                          onChange={(e) => {
                            const si = standardItems.find(
                              (s) => s.itemId === e.target.value,
                            );
                            if (si) {
                              selectStandardItem(idx, si);
                            } else {
                              updateItem(idx, "itemId", e.target.value);
                            }
                          }}
                          className="flex-1 px-2.5 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select item...</option>
                          {/* Hide already-recorded items from the dropdown */}
                          {standardItems
                            .filter(
                              (si) => !new Set(existingItemIds).has(si.itemId),
                            )
                            .map((si) => (
                              <option key={si.itemId} value={si.itemId}>
                                {si.itemName} — {si.currentStock}{" "}
                                {si.unit.abbreviation} in stock
                              </option>
                            ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => removeItem(idx)}
                          className="p-1.5 text-gray-400 hover:text-red-500 transition-colors shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Quantity */}
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-500 w-16 shrink-0">
                          Quantity:
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
                          className="w-24 px-2.5 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {item.unit && (
                          <span className="text-xs text-gray-400">
                            {item.unit}
                          </span>
                        )}
                      </div>

                      {/* Damaged toggle */}
                      <label className="flex items-center gap-2 cursor-pointer w-fit">
                        <input
                          type="checkbox"
                          checked={item.isDamaged}
                          onChange={(e) =>
                            updateItem(idx, "isDamaged", e.target.checked)
                          }
                          className="w-4 h-4 text-red-600 rounded"
                        />
                        <span className="text-xs text-gray-600 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                          Mark as damaged
                        </span>
                      </label>

                      {/* Damage notes */}
                      {item.isDamaged && (
                        <textarea
                          placeholder="Describe the damage... (required)"
                          value={item.damageNotes ?? ""}
                          onChange={(e) =>
                            updateItem(idx, "damageNotes", e.target.value)
                          }
                          rows={2}
                          className="w-full px-2.5 py-1.5 border border-red-200 rounded-lg text-xs resize-none focus:outline-none focus:ring-2 focus:ring-red-400 bg-white"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Completion Notes ── */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Completion Notes{" "}
                <span className="text-xs text-gray-400 font-normal">
                  (optional)
                </span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any notes about the cleaning..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* ── General damage notes ── */}
            {hasDamage && (
              <div>
                <label className="block text-sm font-medium text-red-700 mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  General Damage Summary
                </label>
                <textarea
                  value={damageNotes}
                  onChange={(e) => setDamageNotes(e.target.value)}
                  placeholder="Overall damage summary for this room..."
                  rows={2}
                  className="w-full px-3 py-2 border border-red-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-400 bg-red-50"
                />
              </div>
            )}
          </form>
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm border border-gray-200 text-gray-600 rounded-xl hover:bg-white transition-colors disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            form="completeTaskForm"
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Completing...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Mark as Complete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
