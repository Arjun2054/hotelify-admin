// src/components/housekeeping/TaskCard.tsx
"use client";

import {
  Clock,
  User,
  BedDouble,
  AlertTriangle,
  CheckCircle2,
  Package,
  Calendar,
} from "lucide-react";
import type { HousekeepingTask } from "@/types/houseKeeping-types";

interface TaskCardProps {
  task: HousekeepingTask;
  isManager: boolean;
  compact?: boolean;
  onClick?: () => void;
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

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return "Today";
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function isOverdue(scheduledAt: string, status: string) {
  if (status === "COMPLETED" || status === "INSPECTED") return false;
  return new Date(scheduledAt) < new Date();
}

export function TaskCard({ task, compact, onClick }: TaskCardProps) {
  const status = STATUS_CONFIG[task.status] ?? STATUS_CONFIG.PENDING;
  const overdue = isOverdue(task.scheduledAt, task.status);
  const damagedItems = task.itemsUsed.filter((i) => i.isDamaged);

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 ${
        overdue && task.status !== "INSPECTED"
          ? "border-red-200 shadow-sm shadow-red-100"
          : "border-gray-200"
      } ${compact ? "p-3" : "p-4"}`}
    >
      {/* ── Top Row ── */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
            <BedDouble className="w-4 h-4 text-blue-600" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 text-sm truncate">
              Room {task.room.roomNumber}
            </p>
            <p className="text-xs text-gray-400">Floor {task.room.floor}</p>
          </div>
        </div>

        <span
          className={`text-xs px-2 py-0.5 rounded-full border font-medium ${status.classes}`}
        >
          {status.label}
        </span>
      </div>

      {/* ── Room Type ── */}
      <p className="text-xs text-gray-500 mb-2">{task.room.roomType.name}</p>

      {/* ── Staff ── */}
      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
        <User className="w-3.5 h-3.5" />
        <span className="truncate">{task.user.name}</span>
      </div>

      {/* ── Schedule ── */}
      <div
        className={`flex items-center gap-1.5 text-xs mb-2 ${
          overdue ? "text-red-600 font-medium" : "text-gray-500"
        }`}
      >
        <Calendar className="w-3.5 h-3.5" />
        <span>
          {formatDate(task.scheduledAt)} {formatTime(task.scheduledAt)}
        </span>
        {overdue && <AlertTriangle className="w-3.5 h-3.5 ml-auto" />}
      </div>

      {/* ── Timing ── */}
      {task.startedAt && (
        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
          <Clock className="w-3.5 h-3.5" />
          <span>
            Started {formatTime(task.startedAt)}
            {task.completedAt && ` · Done ${formatTime(task.completedAt)}`}
          </span>
        </div>
      )}

      {/* ── Bottom Row ── */}
      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
        {task.itemsUsed.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Package className="w-3 h-3" />
            {task.itemsUsed.length} items
          </div>
        )}

        {damagedItems.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-red-500 ml-auto">
            <AlertTriangle className="w-3 h-3" />
            {damagedItems.length} damaged
          </div>
        )}

        {task.status === "INSPECTED" && (
          <div className="flex items-center gap-1 text-xs text-purple-600 ml-auto">
            <CheckCircle2 className="w-3 h-3" />
            Approved
          </div>
        )}
      </div>
    </div>
  );
}
