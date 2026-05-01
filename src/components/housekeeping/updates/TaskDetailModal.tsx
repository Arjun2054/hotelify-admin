// src/components/housekeeping/TaskDetailModal.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  X,
  BedDouble,
  User,
  Calendar,
  Clock,
  Package,
  AlertTriangle,
  CheckCircle2,
  Play,
  ClipboardCheck,
  XCircle,
  Edit3,
  Loader2,
  ChevronDown,
  ChevronUp,
  MapPin,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { CompleteTaskModal } from "./CompleteTaskModal";
import { InspectTaskModal } from "./InspectTaskModal";
import { RecordItemsModal } from "./RecordItemsModal";
import { useHousekeepingStore } from "@/store/houseKeeping/useHousekeepingStore";

interface TaskDetailModalProps {
  taskId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const STATUS_CONFIG = {
  PENDING: {
    label: "Pending",
    classes: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  IN_PROGRESS: {
    label: "In Progress",
    classes: "bg-blue-100 text-blue-700 border-blue-200",
  },
  COMPLETED: {
    label: "Completed",
    classes: "bg-green-100 text-green-700 border-green-200",
  },
  INSPECTED: {
    label: "Inspected",
    classes: "bg-purple-100 text-purple-700 border-purple-200",
  },
};

export function TaskDetailModal({
  taskId,
  onClose,
  onSuccess,
}: TaskDetailModalProps) {
  // ── Auth ────────────────────────────────────────────────
  const { user, canPerformAction } = useAuthStore();
  const isManager = canPerformAction(["OWNER", "ADMIN"]);

  // ── Store ───────────────────────────────────────────────
  const {
    selectedTask,
    isLoading,
    fetchTaskById,
    startTask,
    cancelTask,
    fetchStandardItems,
    standardItems,
  } = useHousekeepingStore();

  // ── Sub-modal state ─────────────────────────────────────
  type ActiveModal = "complete" | "inspect" | "recordItems" | null;
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);

  const [showItems, setShowItems] = useState(true);
  const [showStandardItems, setShowStandardItems] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  /**
   * FIX 1 — Transition lock
   * Prevents a new sub-modal from opening in the ~50 ms gap between
   * setActiveModal(null) and the completion of fetchTaskById after
   * RecordItemsModal / CompleteTaskModal close. Without this, the user
   * can click "Mark Complete" while the refresh is still in-flight,
   * causing a stale task snapshot to be passed into CompleteTaskModal.
   */
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Tracks whether the component is still mounted to avoid setState after unmount
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // ── Fetch task on mount ─────────────────────────────────
  useEffect(() => {
    fetchTaskById(taskId);
  }, [taskId]);

  // ── Fetch standard items when in progress ───────────────
  useEffect(() => {
    if (selectedTask?.status === "IN_PROGRESS") {
      fetchStandardItems(taskId);
    }
  }, [selectedTask?.status, taskId]);

  const task = selectedTask;

  // ── Permission derivations ──────────────────────────────
  const isAssignedToMe = task?.userId === user?.userId;
  const staffCanAct = isManager || isAssignedToMe;

  const canStart = task?.status === "PENDING" && staffCanAct;
  const canComplete = task?.status === "IN_PROGRESS" && staffCanAct;
  const canInspect = task?.status === "COMPLETED" && isManager;
  const canCancel = task?.status !== "INSPECTED" && isManager;
  const canRecordItems =
    (task?.status === "IN_PROGRESS" || task?.status === "COMPLETED") &&
    staffCanAct;

  /**
   * FIX 2 — Already-recorded item IDs
   * Pass these to CompleteTaskModal so it knows which items were saved
   * via RecordItemsModal and must NOT be re-submitted, preventing the
   * 2× duplication that occurred when both modals submitted the same items.
   */
  const existingItemIds = task?.itemsUsed.map((i) => i.hotelItem.id) ?? [];

  // ── Handlers ────────────────────────────────────────────
  const handleStart = async () => {
    if (!task) return;
    setActionLoading("start");
    try {
      await startTask(task.id);
      if (isMountedRef.current) {
        await fetchTaskById(taskId);
      }
    } finally {
      if (isMountedRef.current) {
        setActionLoading(null);
      }
    }
  };

  const handleCancel = async () => {
    if (!task) return;
    if (!confirm("Are you sure you want to cancel this task?")) return;
    setActionLoading("cancel");
    try {
      await cancelTask(task.id);
      onSuccess();
    } finally {
      if (isMountedRef.current) {
        setActionLoading(null);
      }
    }
  };

  // ── Sub-modal open handlers ──────────────────────────────
  // Guard: block open if another modal is active OR a refresh is in-flight
  const openCompleteModal = useCallback(() => {
    if (activeModal !== null || isTransitioning) return;
    setActiveModal("complete");
  }, [activeModal, isTransitioning]);

  const openInspectModal = useCallback(() => {
    if (activeModal !== null || isTransitioning) return;
    setActiveModal("inspect");
  }, [activeModal, isTransitioning]);

  const openRecordItemsModal = useCallback(() => {
    if (activeModal !== null || isTransitioning) return;
    setActiveModal("recordItems");
  }, [activeModal, isTransitioning]);

  // Close handler — always resets to null
  const closeActiveModal = useCallback(() => {
    setActiveModal(null);
  }, []);

  // ── Helper: close → wait → refresh ──────────────────────
  // Shared by complete & recordItems success handlers.
  // Sets isTransitioning=true for the entire async window so no second
  // modal can open until the latest task data is in the store.
  const closeAndRefresh = useCallback(
    async (onDone?: () => void) => {
      setActiveModal(null);
      setIsTransitioning(true);
      try {
        // Brief settle — lets React flush the state update above
        await new Promise((resolve) => setTimeout(resolve, 50));
        if (isMountedRef.current) {
          await fetchTaskById(taskId);
        }
      } finally {
        if (isMountedRef.current) {
          setIsTransitioning(false);
          onDone?.();
        }
      }
    },
    [taskId, fetchTaskById],
  );

  // ── Complete success ─────────────────────────────────────
  const handleCompleteSuccess = useCallback(async () => {
    await closeAndRefresh();
  }, [closeAndRefresh]);

  // ── Inspect success ──────────────────────────────────────
  const handleInspectSuccess = useCallback(() => {
    setActiveModal(null);
    onSuccess(); // propagate up — parent will close everything
  }, [onSuccess]);

  // ── Record items success ─────────────────────────────────
  const handleRecordItemsSuccess = useCallback(async () => {
    await closeAndRefresh();
  }, [closeAndRefresh]);

  // ── Helpers ──────────────────────────────────────────────
  function formatDateTime(iso: string | null) {
    if (!iso) return "—";
    return new Date(iso).toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function calcDuration(start: string | null, end: string | null) {
    if (!start || !end) return null;
    const mins = Math.round(
      (new Date(end).getTime() - new Date(start).getTime()) / 60000,
    );
    if (mins < 60) return `${mins} min`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  }

  const duration = task ? calcDuration(task.startedAt, task.completedAt) : null;
  const damagedItems = task?.itemsUsed.filter((i) => i.isDamaged) ?? [];

  // Buttons are disabled when: an action is loading, a modal is open, OR
  // we are in the middle of a post-close refresh (isTransitioning).
  const actionsDisabled =
    !!actionLoading || activeModal !== null || isTransitioning;

  return (
    <>
      {/* ── Main Modal ── */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <BedDouble className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {task ? `Room ${task.room.roomNumber}` : "Loading..."}
                </h2>
                <p className="text-sm text-gray-400">
                  {task?.room.roomType.name} · Floor {task?.room.floor}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {task && (
                <span
                  className={`text-xs px-3 py-1 rounded-full border font-medium ${
                    STATUS_CONFIG[task.status].classes
                  }`}
                >
                  {STATUS_CONFIG[task.status].label}
                </span>
              )}
              {/* Show a subtle spinner in the header while transitioning */}
              {isTransitioning && (
                <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
              )}
              <button
                onClick={onClose}
                disabled={activeModal !== null || isTransitioning}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {isLoading && !task ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            ) : task ? (
              <>
                {/* Not your task warning */}
                {!isManager && !isAssignedToMe && (
                  <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 shrink-0" />
                    <p className="text-sm text-yellow-700">
                      This task is assigned to another staff member.
                    </p>
                  </div>
                )}

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <InfoItem
                    icon={User}
                    label="Assigned To"
                    value={task.user.name}
                    highlight={isAssignedToMe ? "You" : undefined}
                  />
                  <InfoItem
                    icon={MapPin}
                    label="Room"
                    value={`Room ${task.room.roomNumber} · Floor ${task.room.floor}`}
                  />
                  <InfoItem
                    icon={Calendar}
                    label="Scheduled"
                    value={formatDateTime(task.scheduledAt)}
                  />
                  <InfoItem
                    icon={Clock}
                    label="Started"
                    value={formatDateTime(task.startedAt)}
                  />
                  <InfoItem
                    icon={CheckCircle2}
                    label="Completed"
                    value={formatDateTime(task.completedAt)}
                  />
                  {duration && (
                    <InfoItem icon={Clock} label="Duration" value={duration} />
                  )}
                </div>

                {/* Notes */}
                {task.notes && (
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-xs font-medium text-gray-400 mb-1 uppercase tracking-wide">
                      Notes
                    </p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {task.notes}
                    </p>
                  </div>
                )}

                {/* Damage Notes */}
                {task.damageNotes && (
                  <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      <p className="text-xs font-medium text-red-700 uppercase tracking-wide">
                        Damage Report
                      </p>
                    </div>
                    <p className="text-sm text-red-700 whitespace-pre-wrap">
                      {task.damageNotes}
                    </p>
                  </div>
                )}

                {/* Items Used */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowItems(!showItems)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">
                        Items Used ({task.itemsUsed.length})
                      </span>
                      {damagedItems.length > 0 && (
                        <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                          <AlertTriangle className="w-3 h-3" />
                          {damagedItems.length} damaged
                        </span>
                      )}
                    </div>
                    {showItems ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </button>

                  {showItems && (
                    <div className="divide-y divide-gray-100">
                      {task.itemsUsed.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-8">
                          No items recorded yet
                        </p>
                      ) : (
                        task.itemsUsed.map((item) => (
                          <div
                            key={item.id}
                            className={`flex items-center justify-between px-4 py-3 ${
                              item.isDamaged ? "bg-red-50" : ""
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              {item.isDamaged && (
                                <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                              )}
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-800 truncate">
                                  {item.hotelItem.name}
                                </p>
                                {item.damageNotes && (
                                  <p className="text-xs text-red-500 truncate">
                                    {item.damageNotes}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="text-right ml-3 shrink-0">
                              <p className="text-sm font-semibold text-gray-900">
                                {item.quantityUsed}{" "}
                                <span className="text-gray-400 font-normal text-xs">
                                  {item.hotelItem.unit.abbreviation}
                                </span>
                              </p>
                              {item.isDamaged && (
                                <p className="text-xs text-red-500">Damaged</p>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Standard Items Reference */}
                {task.status === "IN_PROGRESS" && standardItems.length > 0 && (
                  <div className="border border-blue-200 rounded-xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setShowStandardItems(!showStandardItems)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-blue-50 hover:bg-blue-100 transition-colors"
                    >
                      <p className="text-sm font-medium text-blue-700">
                        Room Standard Items ({standardItems.length})
                      </p>
                      {showStandardItems ? (
                        <ChevronUp className="w-4 h-4 text-blue-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-blue-400" />
                      )}
                    </button>
                    {showStandardItems && (
                      <div className="divide-y divide-blue-100">
                        {standardItems.map((si) => (
                          <div
                            key={si.itemId}
                            className="flex items-center justify-between px-4 py-2.5"
                          >
                            <div>
                              <p className="text-sm text-gray-800">
                                {si.itemName}
                              </p>
                              <p className="text-xs text-gray-400">
                                In stock:{" "}
                                <span
                                  className={
                                    si.currentStock < si.standardQty
                                      ? "text-red-500 font-medium"
                                      : "text-gray-500"
                                  }
                                >
                                  {si.currentStock}
                                </span>{" "}
                                {si.unit.abbreviation}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-blue-700">
                                {si.standardQty} {si.unit.abbreviation}
                              </p>
                              <p className="text-xs text-gray-400">standard</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : null}
          </div>

          {/* Action Footer */}
          {task && (
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                {/* Destructive */}
                <div>
                  {canCancel && (
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={actionsDisabled}
                      className="flex items-center gap-2 px-3 py-2 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      {actionLoading === "cancel" ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      Cancel Task
                    </button>
                  )}
                </div>

                {/* Primary actions */}
                <div className="flex gap-2 flex-wrap">
                  {canRecordItems && (
                    <button
                      type="button"
                      onClick={openRecordItemsModal}
                      disabled={actionsDisabled}
                      className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      <Edit3 className="w-4 h-4" />
                      Record Items
                    </button>
                  )}

                  {canStart && (
                    <button
                      type="button"
                      onClick={handleStart}
                      disabled={actionsDisabled}
                      className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {actionLoading === "start" ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                      Start Cleaning
                    </button>
                  )}

                  {canComplete && (
                    <button
                      type="button"
                      onClick={openCompleteModal}
                      disabled={actionsDisabled}
                      className="flex items-center gap-2 px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Mark Complete
                    </button>
                  )}

                  {canInspect && (
                    <button
                      type="button"
                      onClick={openInspectModal}
                      disabled={actionsDisabled}
                      className="flex items-center gap-2 px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                    >
                      <ClipboardCheck className="w-4 h-4" />
                      Inspect Room
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Sub-modals ── */}
      {activeModal === "complete" && task && (
        <CompleteTaskModal
          task={task}
          // FIX 2: Tell CompleteTaskModal which items are already saved so it
          // skips re-submitting them — prevents the 2× duplication bug.
          existingItemIds={existingItemIds}
          onClose={closeActiveModal}
          onSuccess={handleCompleteSuccess}
        />
      )}

      {activeModal === "inspect" && task && (
        <InspectTaskModal
          task={task}
          onClose={closeActiveModal}
          onSuccess={handleInspectSuccess}
        />
      )}

      {activeModal === "recordItems" && task && (
        <RecordItemsModal
          task={task}
          onClose={closeActiveModal}
          onSuccess={handleRecordItemsSuccess}
        />
      )}
    </>
  );
}

// ── InfoItem ──────────────────────────────────────────────
function InfoItem({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: any;
  label: string;
  value: string;
  highlight?: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-3.5 h-3.5 text-gray-500" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">
          {label}
        </p>
        <p className="text-sm font-medium text-gray-800 truncate">
          {value}
          {highlight && (
            <span className="ml-1.5 text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">
              {highlight}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
