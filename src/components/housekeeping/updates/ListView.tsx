// src/components/housekeeping/ListView.tsx
"use client";

import {
  BedDouble,
  Calendar,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Clock,
  ChevronsLeft,
  ChevronsRight,
  Search,
  X,
} from "lucide-react";
import { useState } from "react";
import type { HousekeepingTask } from "@/types/houseKeeping-types";

// ── Types ──────────────────────────────────────────────────
interface Meta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface ListViewProps {
  tasks: HousekeepingTask[];
  meta: Meta | null;
  isLoading: boolean;
  isManager: boolean;
  onTaskClick: (task: HousekeepingTask) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

// ── Status Config ──────────────────────────────────────────
const STATUS_CONFIG = {
  PENDING: {
    label: "Pending",
    dot: "bg-yellow-400",
    text: "text-yellow-700",
    bg: "bg-yellow-50",
  },
  IN_PROGRESS: {
    label: "In Progress",
    dot: "bg-blue-500",
    text: "text-blue-700",
    bg: "bg-blue-50",
  },
  COMPLETED: {
    label: "Completed",
    dot: "bg-green-500",
    text: "text-green-700",
    bg: "bg-green-50",
  },
  INSPECTED: {
    label: "Inspected",
    dot: "bg-purple-500",
    text: "text-purple-700",
    bg: "bg-purple-50",
  },
} as const;

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// ── Helpers ────────────────────────────────────────────────
function isOverdue(scheduledAt: string, status: string) {
  if (status === "COMPLETED" || status === "INSPECTED") return false;
  return new Date(scheduledAt) < new Date();
}

function calcDuration(startedAt: string | null, completedAt: string | null) {
  if (!startedAt || !completedAt) return null;
  const mins = Math.round(
    (new Date(completedAt).getTime() - new Date(startedAt).getTime()) / 60000,
  );
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const isToday = d.toDateString() === today.toDateString();
  const time = d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  if (isToday) return `Today, ${time}`;
  return (
    d.toLocaleDateString([], { month: "short", day: "numeric" }) + ` · ${time}`
  );
}

// ── Page Number Generation ─────────────────────────────────
function getPageNumbers(
  currentPage: number,
  totalPages: number,
): (number | "...")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | "...")[] = [];

  // Always show first page
  pages.push(1);

  if (currentPage > 3) {
    pages.push("...");
  }

  // Show pages around current
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (currentPage < totalPages - 2) {
    pages.push("...");
  }

  // Always show last page
  pages.push(totalPages);

  return pages;
}

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════
export function ListView({
  tasks,
  meta,
  isLoading,
  isManager,
  onTaskClick,
  onPageChange,
  onPageSizeChange,
}: ListViewProps) {
  const [search, setSearch] = useState("");

  // ── Local search filter ────────────────────────────────
  const filteredTasks = search.trim()
    ? tasks.filter(
        (t) =>
          t.room.roomNumber.toLowerCase().includes(search.toLowerCase()) ||
          t.user.name.toLowerCase().includes(search.toLowerCase()) ||
          t.room.roomType.name.toLowerCase().includes(search.toLowerCase()),
      )
    : tasks;

  // ── Loading skeleton ───────────────────────────────────
  if (isLoading && tasks.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <TableSkeleton isManager={isManager} />
      </div>
    );
  }

  const pageNumbers = meta ? getPageNumbers(meta.page, meta.totalPages) : [];

  const startItem = meta ? (meta.page - 1) * meta.pageSize + 1 : 0;
  const endItem = meta ? Math.min(meta.page * meta.pageSize, meta.total) : 0;

  return (
    <div className="space-y-3">
      {/* ── Table Card ── */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {/* ── Table Header Bar ── */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
          {/* Search */}
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search rooms, staff..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-8 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2"
              >
                <X className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          {/* Right side: count + page size */}
          <div className="flex items-center gap-3">
            {isLoading && (
              <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
            )}

            {meta && (
              <p className="text-xs text-gray-500">
                <span className="font-medium text-gray-700">{meta.total}</span>{" "}
                total tasks
              </p>
            )}

            {/* Page size selector */}
            {onPageSizeChange && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-gray-500">Show</span>
                <select
                  value={meta?.pageSize ?? 25}
                  onChange={(e) => onPageSizeChange(parseInt(e.target.value))}
                  className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
                <span className="text-xs text-gray-500">per page</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Table ── */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Room
                </th>
                {isManager && (
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Staff
                  </th>
                )}
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Scheduled
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Duration
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Items
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={isManager ? 7 : 6} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <BedDouble className="w-10 h-10 text-gray-200" />
                      <p className="text-sm text-gray-400">
                        {search
                          ? `No tasks match "${search}"`
                          : "No housekeeping tasks found"}
                      </p>
                      {search && (
                        <button
                          onClick={() => setSearch("")}
                          className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          Clear search
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    isManager={isManager}
                    onClick={() => onTaskClick(task)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        {meta && meta.totalPages > 0 && (
          <div className="border-t border-gray-100">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3">
              {/* Left: showing x-y of z */}
              <p className="text-xs text-gray-500 order-2 sm:order-1">
                Showing{" "}
                <span className="font-semibold text-gray-700">{startItem}</span>
                –<span className="font-semibold text-gray-700">{endItem}</span>{" "}
                of{" "}
                <span className="font-semibold text-gray-700">
                  {meta.total}
                </span>{" "}
                tasks
              </p>

              {/* Center/Right: page controls */}
              <div className="flex items-center gap-1 order-1 sm:order-2">
                {/* First page */}
                <PageButton
                  onClick={() => onPageChange(1)}
                  disabled={meta.page === 1}
                  title="First page"
                >
                  <ChevronsLeft className="w-3.5 h-3.5" />
                </PageButton>

                {/* Previous page */}
                <PageButton
                  onClick={() => onPageChange(meta.page - 1)}
                  disabled={meta.page === 1}
                  title="Previous page"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </PageButton>

                {/* Page numbers */}
                <div className="flex items-center gap-1">
                  {pageNumbers.map((page, idx) =>
                    page === "..." ? (
                      <span
                        key={`ellipsis-${idx}`}
                        className="w-8 h-8 flex items-center justify-center text-xs text-gray-400"
                      >
                        ···
                      </span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => onPageChange(page as number)}
                        className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                          page === meta.page
                            ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {page}
                      </button>
                    ),
                  )}
                </div>

                {/* Next page */}
                <PageButton
                  onClick={() => onPageChange(meta.page + 1)}
                  disabled={meta.page === meta.totalPages}
                  title="Next page"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </PageButton>

                {/* Last page */}
                <PageButton
                  onClick={() => onPageChange(meta.totalPages)}
                  disabled={meta.page === meta.totalPages}
                  title="Last page"
                >
                  <ChevronsRight className="w-3.5 h-3.5" />
                </PageButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════

// ── Task Row ───────────────────────────────────────────────
function TaskRow({
  task,
  isManager,
  onClick,
}: {
  task: HousekeepingTask;
  isManager: boolean;
  onClick: () => void;
}) {
  const status =
    STATUS_CONFIG[task.status as keyof typeof STATUS_CONFIG] ??
    STATUS_CONFIG.PENDING;
  const overdue = isOverdue(task.scheduledAt, task.status);
  const duration = calcDuration(task.startedAt, task.completedAt);
  const damagedCount = task.itemsUsed.filter((i) => i.isDamaged).length;

  return (
    <tr
      onClick={onClick}
      className={`cursor-pointer transition-colors group ${
        overdue ? "bg-red-50/50 hover:bg-red-50" : "hover:bg-blue-50/40"
      }`}
    >
      {/* ── Room ── */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              overdue ? "bg-red-100" : "bg-blue-50"
            }`}
          >
            <BedDouble
              className={`w-4 h-4 ${overdue ? "text-red-500" : "text-blue-600"}`}
            />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm leading-tight">
              Room {task.room.roomNumber}
            </p>
            <p className="text-xs text-gray-400 leading-tight">
              {task.room.roomType.name} · Floor {task.room.floor}
            </p>
          </div>
        </div>
      </td>

      {/* ── Staff (manager only) ── */}
      {isManager && (
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-gray-500">
                {task.user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-sm text-gray-700 truncate max-w-[120px]">
              {task.user.name}
            </span>
          </div>
        </td>
      )}

      {/* ── Status ── */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full shrink-0 ${status.dot}`} />
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${status.bg} ${status.text}`}
          >
            {status.label}
          </span>
          {overdue && (
            <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
          )}
        </div>
      </td>

      {/* ── Scheduled ── */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-gray-300 shrink-0" />
          <span
            className={`text-xs ${
              overdue ? "text-red-600 font-semibold" : "text-gray-600"
            }`}
          >
            {formatDateTime(task.scheduledAt)}
          </span>
        </div>
      </td>

      {/* ── Duration ── */}
      <td className="px-4 py-3">
        {duration ? (
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-gray-300 shrink-0" />
            <span className="text-xs text-gray-600">{duration}</span>
          </div>
        ) : task.startedAt && !task.completedAt ? (
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-xs text-blue-600 font-medium">
              In progress
            </span>
          </div>
        ) : (
          <span className="text-xs text-gray-300">—</span>
        )}
      </td>

      {/* ── Items ── */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-600">{task.itemsUsed.length}</span>
          {damagedCount > 0 && (
            <span className="text-xs text-red-600 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded-full font-medium">
              {damagedCount} dmg
            </span>
          )}
        </div>
      </td>

      {/* ── Notes ── */}
      <td className="px-4 py-3">
        <p className="text-xs text-gray-400 max-w-[140px] truncate">
          {task.notes ?? "—"}
        </p>
      </td>
    </tr>
  );
}

// ── Page Button ────────────────────────────────────────────
function PageButton({
  onClick,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  disabled: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
    >
      {children}
    </button>
  );
}

// ── Table Skeleton ─────────────────────────────────────────
function TableSkeleton({ isManager }: { isManager: boolean }) {
  const cols = isManager ? 7 : 6;
  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
        <div className="w-48 h-8 bg-gray-200 rounded-lg animate-pulse" />
        <div className="w-32 h-8 bg-gray-200 rounded-lg animate-pulse" />
      </div>

      {/* Table header */}
      <div className="border-b border-gray-100 px-4 py-3 flex gap-6">
        {Array.from({ length: cols }).map((_, i) => (
          <div
            key={i}
            className="h-3 bg-gray-100 rounded animate-pulse"
            style={{ width: `${[120, 100, 80, 100, 60, 50, 100][i]}px` }}
          />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: 8 }).map((_, rowIdx) => (
        <div
          key={rowIdx}
          className="flex items-center gap-6 px-4 py-4 border-b border-gray-50"
        >
          {/* Room cell */}
          <div className="flex items-center gap-2.5 w-[140px] shrink-0">
            <div className="w-8 h-8 bg-gray-100 rounded-lg animate-pulse shrink-0" />
            <div className="space-y-1.5 flex-1">
              <div className="h-3 bg-gray-100 rounded animate-pulse w-20" />
              <div className="h-2.5 bg-gray-100 rounded animate-pulse w-16" />
            </div>
          </div>

          {/* Other cells */}
          {Array.from({ length: cols - 1 }).map((_, colIdx) => (
            <div
              key={colIdx}
              className="h-3 bg-gray-100 rounded animate-pulse"
              style={{
                width: `${[80, 70, 90, 50, 40, 100][colIdx]}px`,
              }}
            />
          ))}
        </div>
      ))}

      {/* Pagination skeleton */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
        <div className="w-40 h-4 bg-gray-100 rounded animate-pulse" />
        <div className="flex gap-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="w-8 h-8 bg-gray-100 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    </>
  );
}
