// src/components/housekeeping/InspectTaskModal.tsx
"use client";

import { useState } from "react";
import {
  X,
  ClipboardCheck,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  Loader2,
} from "lucide-react";

import type {
  HousekeepingTask,
  InspectTaskPayload,
} from "@/types/houseKeeping-types";
import { useHousekeepingStore } from "@/store/houseKeeping/useHousekeepingStore";

interface InspectTaskModalProps {
  task: HousekeepingTask;
  onClose: () => void;
  onSuccess: () => void;
}

type RoomStatusOption = "AVAILABLE" | "MAINTENANCE" | "OUT_OF_ORDER";

export function InspectTaskModal({
  task,
  onClose,
  onSuccess,
}: InspectTaskModalProps) {
  const { inspectTask, isLoading } = useHousekeepingStore();

  const [approved, setApproved] = useState<boolean | null>(null);
  const [notes, setNotes] = useState("");
  const [roomStatus, setRoomStatus] = useState<RoomStatusOption>("AVAILABLE");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (approved === null) return;

    const payload: InspectTaskPayload = {
      approved,
      notes: notes || undefined,
      roomStatus: approved ? roomStatus : undefined,
    };

    try {
      await inspectTask(task.id, payload);
      onSuccess();
    } catch {
      // handled by store
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <ClipboardCheck className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Inspect Room</h2>
              <p className="text-sm text-gray-500">
                Room {task.room.roomNumber} · {task.user.name}
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
        <form
          id="inspectForm"
          onSubmit={handleSubmit}
          className="px-6 py-4 space-y-5"
        >
          {/* Approval decision */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Inspection Result *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setApproved(true)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  approved === true
                    ? "border-green-500 bg-green-50 shadow-md"
                    : "border-gray-200 hover:border-green-300 hover:bg-green-50"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    approved === true ? "bg-green-500" : "bg-gray-100"
                  }`}
                >
                  <ThumbsUp
                    className={`w-5 h-5 ${approved === true ? "text-white" : "text-gray-400"}`}
                  />
                </div>
                <div>
                  <p
                    className={`text-sm font-semibold ${
                      approved === true ? "text-green-700" : "text-gray-600"
                    }`}
                  >
                    Approve
                  </p>
                  <p className="text-xs text-gray-400 text-center">
                    Room is ready
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setApproved(false)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  approved === false
                    ? "border-red-500 bg-red-50 shadow-md"
                    : "border-gray-200 hover:border-red-300 hover:bg-red-50"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    approved === false ? "bg-red-500" : "bg-gray-100"
                  }`}
                >
                  <ThumbsDown
                    className={`w-5 h-5 ${approved === false ? "text-white" : "text-gray-400"}`}
                  />
                </div>
                <div>
                  <p
                    className={`text-sm font-semibold ${
                      approved === false ? "text-red-700" : "text-gray-600"
                    }`}
                  >
                    Reject
                  </p>
                  <p className="text-xs text-gray-400 text-center">
                    Needs re-clean
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Room Status (only if approved) */}
          {approved === true && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Set Room Status After Inspection
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { value: "AVAILABLE", label: "Available", color: "green" },
                    {
                      value: "MAINTENANCE",
                      label: "Maintenance",
                      color: "yellow",
                    },
                    {
                      value: "OUT_OF_ORDER",
                      label: "Out of Order",
                      color: "red",
                    },
                  ] as {
                    value: RoomStatusOption;
                    label: string;
                    color: string;
                  }[]
                ).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setRoomStatus(opt.value)}
                    className={`py-2 px-2 rounded-lg border text-xs font-medium transition-colors ${
                      roomStatus === opt.value
                        ? opt.color === "green"
                          ? "border-green-500 bg-green-50 text-green-700"
                          : opt.color === "yellow"
                            ? "border-yellow-500 bg-yellow-50 text-yellow-700"
                            : "border-red-500 bg-red-50 text-red-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Rejection warning */}
          {approved === false && (
            <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 shrink-0" />
              <p className="text-sm text-yellow-700">
                Task will be re-opened and staff will be notified to re-clean
                the room.
              </p>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Inspection Notes{" "}
              {approved === false && <span className="text-red-500">*</span>}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                approved === false
                  ? "What needs to be fixed? (Required for rejection)"
                  : "Any comments about the inspection..."
              }
              required={approved === false}
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-200 text-gray-600 rounded-xl hover:bg-white transition-colors"
          >
            Cancel
          </button>
          <button
            form="inspectForm"
            type="submit"
            disabled={isLoading || approved === null}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              approved === true
                ? "bg-green-600 hover:bg-green-700 text-white"
                : approved === false
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-gray-300 text-gray-500"
            }`}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ClipboardCheck className="w-4 h-4" />
            )}
            {approved === true
              ? "Approve & Close"
              : approved === false
                ? "Reject & Re-open"
                : "Choose Result"}
          </button>
        </div>
      </div>
    </div>
  );
}
