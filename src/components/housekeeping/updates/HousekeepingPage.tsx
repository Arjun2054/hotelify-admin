// src/components/housekeeping/HousekeepingPage.tsx
"use client";

import { useEffect, useState } from "react";
import {
  LayoutGrid,
  List,
  Plus,
  RefreshCw,
  BarChart3,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Shield,
  Building2,
  BedDouble,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertTriangle,
  CalendarDays,
  Hotel,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { BoardView } from "./BoardView";
import { ListView } from "./ListView";
import { StatsOverview } from "./StatsOverview";
import { CreateTaskModal } from "./CreateTaskModal";
import { TaskDetailModal } from "./TaskDetailModal";
import type {
  HousekeepingFilters,
  HousekeepingStats,
  HousekeepingTask,
} from "@/types/houseKeeping-types";
import { useHousekeepingStore } from "@/store/houseKeeping/useHousekeepingStore";
import HousekeepingOverview from "./HousekeepingOverview";
import RoomHousekeepingManager from "@/components/room-housekeeping/RoomHousekeepingManager";
import { cn } from "@/lib/utils";

type ViewMode = "overview" | "board" | "list" | "stats" | "rooms";

// ── Guard screens ─────────────────────────────────────────────────────────────
function NoOrgScreen() {
  return (
    <div className="min-h-screen bg-[#f9f7f4] flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-10 max-w-md w-full text-center">
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 mx-auto mb-5">
          <Building2 className="w-7 h-7 text-amber-600" />
        </div>
        <h2
          className="font-bold text-gray-800 mb-2"
          style={{ fontSize: "16px" }}
        >
          No Organization Selected
        </h2>
        <p className="text-gray-400" style={{ fontSize: "12px" }}>
          Please select an organization to continue.
        </p>
      </div>
    </div>
  );
}

function NoAccessScreen({
  isStaff,
  department,
}: {
  isStaff: boolean;
  department?: string | null;
}) {
  return (
    <div className="min-h-screen  flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-10 max-w-md w-full text-center">
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-red-50 border border-red-200 mx-auto mb-5">
          <Shield className="w-7 h-7 text-red-500" />
        </div>
        <h2
          className="font-bold text-gray-800 mb-2"
          style={{ fontSize: "16px" }}
        >
          Access Restricted
        </h2>
        <p
          className="text-gray-400 leading-relaxed"
          style={{ fontSize: "12px" }}
        >
          You don't have access to Housekeeping.
          {isStaff && department && (
            <>
              {" "}
              Your department is{" "}
              <span className="font-semibold text-gray-600">{department}</span>.
              Only Housekeeping staff can access this section.
            </>
          )}
        </p>
      </div>
    </div>
  );
}

// ── Role badge ────────────────────────────────────────────────────────────────
function RoleBadge({
  role,
  department,
}: {
  role: string;
  department: string | null;
}) {
  const config: Record<string, { label: string; className: string }> = {
    OWNER: {
      label: "Owner",
      className: "bg-purple-50 border border-purple-200 text-purple-700",
    },
    ADMIN: {
      label: "Admin",
      className: "bg-blue-50 border border-blue-200 text-blue-700",
    },
    STAFF: {
      label: department ? `Staff · ${department}` : "Staff",
      className: "bg-stone-100 border border-stone-200 text-stone-600",
    },
  };

  const badge = config[role] ?? {
    label: role,
    className: "bg-stone-100 border border-stone-200 text-stone-600",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full font-medium",
        badge.className,
      )}
      style={{ fontSize: "10px" }}
    >
      {badge.label}
    </span>
  );
}

// ── Stat strip ────────────────────────────────────────────────────────────────
function StatsStrip({ stats }: { stats: HousekeepingStats }) {
  const items: {
    label: string;
    value: number;
    icon: React.ElementType;
    accent: string;
    valueColor: string;
  }[] = [
    {
      label: "Total",
      value: stats.total,
      icon: LayoutGrid,
      accent: "bg-stone-100 border-stone-200 text-stone-500",
      valueColor: "text-gray-800",
    },
    {
      label: "Pending",
      value: stats.pending,
      icon: Clock,
      accent: "bg-stone-100 border-stone-200 text-stone-500",
      valueColor: "text-gray-800",
    },
    {
      label: "In Progress",
      value: stats.inProgress,
      icon: RefreshCw,
      accent: "bg-stone-100 border-stone-200 text-stone-500",
      valueColor: "text-gray-800",
    },
    {
      label: "Completed",
      value: stats.completed,
      icon: CheckCircle2,
      accent: "bg-stone-100 border-stone-200 text-stone-500",
      valueColor: "text-gray-800",
    },
    {
      label: "Inspected",
      value: stats.inspected,
      icon: Sparkles,
      accent: "bg-stone-100 border-stone-200 text-stone-500",
      valueColor: "text-gray-800",
    },
    {
      label: "Today",
      value: stats.todayTasks,
      icon: CalendarDays,
      accent: "bg-stone-100 border-stone-200 text-stone-500",
      valueColor: "text-gray-800",
    },
    {
      label: "Overdue",
      value: stats.overdueTasks,
      icon: AlertTriangle,
      accent:
        stats.overdueTasks > 0
          ? "bg-red-50 border-red-200 text-red-600"
          : "bg-stone-50 border-stone-200 text-stone-400",
      valueColor:
        stats.overdueTasks > 0 ? "text-red-700 font-bold" : "text-gray-400",
    },
  ];

  return (
    <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
      {items.map((item) => (
        <div
          key={item.label}
          className="bg-white rounded-xl border border-gray-100 shadow-sm px-3 py-2.5 text-center"
        >
          <div className="flex items-center justify-center mb-1">
            <span
              className={cn(
                "inline-flex items-center justify-center w-6 h-6 rounded-lg border",
                item.accent,
              )}
            >
              <item.icon className="w-3 h-3" />
            </span>
          </div>
          <div
            className={cn("font-bold leading-none", item.valueColor)}
            style={{ fontSize: "16px" }}
          >
            {item.value}
          </div>
          <div className="text-gray-400 mt-0.5" style={{ fontSize: "10px" }}>
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Filter panel ──────────────────────────────────────────────────────────────
function FilterPanel({
  filters,
  onChange,
  onApply,
  onClear,
}: {
  filters: HousekeepingFilters;
  onChange: React.Dispatch<React.SetStateAction<HousekeepingFilters>>;
  onApply: () => void;
  onClear: () => void;
}) {
  const inputCls =
    "w-full px-3 py-2 h-9 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-stone-400/30";
  const labelCls = "block font-medium text-gray-500 mb-1.5";

  return (
    <div className="bg-white border-b border-gray-100 px-8 py-4 shadow-sm">
      <div className="max-w-screen-2xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {/* Status */}
          <div>
            <label className={labelCls} style={{ fontSize: "11px" }}>
              Status
            </label>
            <select
              value={filters.status ?? ""}
              onChange={(e) =>
                onChange((f) => ({
                  ...f,
                  status:
                    (e.target.value as HousekeepingFilters["status"]) ||
                    undefined,
                }))
              }
              className={inputCls}
              style={{ fontSize: "13px" }}
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="INSPECTED">Inspected</option>
            </select>
          </div>

          {/* Floor */}
          <div>
            <label className={labelCls} style={{ fontSize: "11px" }}>
              Floor
            </label>
            <input
              type="number"
              placeholder="All floors"
              value={filters.floor ?? ""}
              onChange={(e) =>
                onChange((f) => ({
                  ...f,
                  floor: e.target.value ? parseInt(e.target.value) : undefined,
                }))
              }
              className={inputCls}
              style={{ fontSize: "13px" }}
            />
          </div>

          {/* Date From */}
          <div>
            <label className={labelCls} style={{ fontSize: "11px" }}>
              From Date
            </label>
            <input
              type="date"
              value={filters.dateFrom ?? ""}
              onChange={(e) =>
                onChange((f) => ({
                  ...f,
                  dateFrom: e.target.value || undefined,
                }))
              }
              className={inputCls}
              style={{ fontSize: "13px" }}
            />
          </div>

          {/* Date To */}
          <div>
            <label className={labelCls} style={{ fontSize: "11px" }}>
              To Date
            </label>
            <input
              type="date"
              value={filters.dateTo ?? ""}
              onChange={(e) =>
                onChange((f) => ({
                  ...f,
                  dateTo: e.target.value || undefined,
                }))
              }
              className={inputCls}
              style={{ fontSize: "13px" }}
            />
          </div>

          {/* Actions */}
          <div className="flex items-end gap-2">
            <button
              onClick={onApply}
              className="flex-1 h-9 px-3 bg-stone-800 hover:bg-stone-700 text-white rounded-xl font-medium transition-colors"
              style={{ fontSize: "13px" }}
            >
              Apply
            </button>
            <button
              onClick={onClear}
              className="h-9 px-3 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors"
              style={{ fontSize: "13px" }}
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function HousekeepingPage() {
  const {
    user,
    getActiveOrganization,
    getActiveRole,
    getActiveDepartment,
    canPerformAction,
    isInDepartment,
  } = useAuthStore();

  const activeOrg = getActiveOrganization();
  const role = getActiveRole();
  const department = getActiveDepartment();
  const isManager = canPerformAction(["OWNER", "ADMIN"]);
  const isStaff = role === "STAFF";
  const hasAccess = isManager || isInDepartment("HOUSEKEEPING");

  const {
    tasks,
    board,
    stats,
    meta,
    filters,
    boardDate,
    isLoading,
    error,
    fetchTasks,
    fetchBoard,
    fetchStats,
    setFilters,
    setBoardDate,
    setSelectedTask,
    clearError,
  } = useHousekeepingStore();

  const [pageSize, setPageSize] = useState(25);
  const [viewMode, setViewMode] = useState<ViewMode>("board");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [localFilters, setLocalFilters] =
    useState<HousekeepingFilters>(filters);

  useEffect(() => {
    if (!hasAccess || !activeOrg) return;
    fetchStats();
  }, [hasAccess, activeOrg?.id]);

  useEffect(() => {
    if (!hasAccess || !activeOrg) return;
    if (viewMode === "board") fetchBoard(boardDate);
    else if (viewMode === "list") fetchTasks(1);
  }, [viewMode, boardDate, hasAccess, activeOrg?.id]);

  useEffect(() => {
    if (viewMode === "list") fetchTasks(1);
  }, [filters]);

  const handleRefresh = () => {
    fetchStats();
    viewMode === "board" ? fetchBoard(boardDate) : fetchTasks(meta?.page ?? 1);
  };

  const handleApplyFilters = () => {
    setFilters(localFilters);
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    const cleared: HousekeepingFilters = {};
    setLocalFilters(cleared);
    setFilters(cleared);
    setShowFilters(false);
  };

  const handleDateNav = (dir: "prev" | "next") => {
    const d = new Date(boardDate);
    d.setDate(d.getDate() + (dir === "next" ? 1 : -1));
    const newDate = d.toISOString().split("T")[0];
    setBoardDate(newDate);
    fetchBoard(newDate);
  };

  const handleTaskClick = (task: HousekeepingTask) => {
    setSelectedTask(task);
    setSelectedTaskId(task.id);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    fetchTasks(1, size);
  };

  const activeFilterCount = Object.values(localFilters).filter(
    (v) => v !== undefined && v !== "" && v !== null,
  ).length;

  // ── Guards ────────────────────────────────────────────────
  if (!activeOrg) return <NoOrgScreen />;
  if (!hasAccess)
    return <NoAccessScreen isStaff={isStaff} department={department} />;

  // ── Tabs config ───────────────────────────────────────────
  const tabs = [
    { id: "overview" as ViewMode, label: "Overview", icon: LayoutGrid },
    { id: "board" as ViewMode, label: "Board", icon: LayoutGrid },
    { id: "list" as ViewMode, label: "List", icon: List },
    ...(isManager
      ? [{ id: "rooms" as ViewMode, label: "Room Manager", icon: BedDouble }]
      : []),
    ...(isManager
      ? [{ id: "stats" as ViewMode, label: "Analytics", icon: BarChart3 }]
      : []),
  ] as { id: ViewMode; label: string; icon: React.ElementType }[];

  return (
    <div className="min-h-screen">
      {/* ── Error banner ────────────────────────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-3 px-8 py-3 bg-red-50 border-b border-red-200">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
          <p className="flex-1 text-red-700" style={{ fontSize: "12px" }}>
            {error}
          </p>
          <button
            onClick={clearError}
            className="text-red-400 hover:text-red-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Hero header ─────────────────────────────────────────────────────── */}
      <div className="relative shrink-0 bg-linear-to-r from-primary via-primary/90 to-primary/75 px-10 py-7 text-primary-foreground overflow-hidden">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-10 -right-10 h-48 w-48 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-8 right-24 h-32 w-32 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute top-4 right-64 h-16 w-16 rounded-full bg-white/5" />

        <div className="relative max-w-screen-2xl mx-auto space-y-5">
          {/* Title row */}
          <div className="flex items-start justify-between gap-6 flex-wrap">
            {/* Left */}
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm shrink-0">
                <Hotel className="w-6 h-6 text-white" />
              </div>

              <div>
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 mb-1">
                  <p
                    className="uppercase tracking-widest font-semibold text-stone-400"
                    style={{ fontSize: "10px" }}
                  >
                    Hotel Management
                  </p>
                  <span className="w-1 h-1 rounded-full bg-stone-500" />
                  <p
                    className="uppercase tracking-widest font-semibold text-stone-400"
                    style={{ fontSize: "10px" }}
                  >
                    Housekeeping
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <h1
                    className="font-bold text-white leading-tight tracking-tight"
                    style={{ fontSize: "22px" }}
                  >
                    Housekeeping
                  </h1>
                  <RoleBadge
                    role={activeOrg.role}
                    department={activeOrg.department ?? null}
                  />
                </div>

                <p className="text-stone-300 mt-1" style={{ fontSize: "13px" }}>
                  {activeOrg.name} ·{" "}
                  {isManager
                    ? "Manage and monitor all cleaning tasks"
                    : "Your assigned cleaning tasks"}
                </p>

                {user && (
                  <p
                    className="text-stone-400 mt-0.5"
                    style={{ fontSize: "11px" }}
                  >
                    Logged in as{" "}
                    <span className="font-medium text-stone-300">
                      {user.name}
                    </span>
                  </p>
                )}
              </div>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Refresh */}
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className={cn(
                  "h-9 w-9 flex items-center justify-center rounded-xl",
                  "bg-white/10 hover:bg-white/20 text-white border border-white/15",
                  "transition-colors disabled:opacity-50",
                )}
              >
                <RefreshCw
                  className={cn("w-4 h-4", isLoading && "animate-spin")}
                />
              </button>

              {/* Filters — list only */}
              {viewMode === "list" && (
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={cn(
                    "h-9 px-4 rounded-xl flex items-center gap-2 border font-medium transition-colors",
                    activeFilterCount > 0
                      ? "bg-amber-400/20 border-amber-400/30 text-amber-200"
                      : "bg-white/10 hover:bg-white/20 text-white border-white/15",
                  )}
                  style={{ fontSize: "13px" }}
                >
                  <Filter className="w-3.5 h-3.5" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span
                      className="flex items-center justify-center w-4 h-4 rounded-full bg-amber-400 text-stone-900 font-bold leading-none"
                      style={{ fontSize: "9px" }}
                    >
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              )}

              {/* Assign Task — managers only */}
              {isManager && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="h-9 px-5 rounded-xl flex items-center gap-2 bg-white text-stone-800 hover:bg-stone-50 font-semibold shadow-md transition-colors"
                  style={{ fontSize: "13px" }}
                >
                  <Plus className="w-3.5 h-3.5" />
                  Assign Task
                </button>
              )}
            </div>
          </div>

          {/* Stats strip */}
          {stats && <StatsStrip stats={stats} />}

          {/* Tab bar — sits flush at the bottom of the hero */}
          <div className="flex items-center gap-0.5 -mx-8 px-8">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setViewMode(id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition-all",
                  "whitespace-nowrap",
                  viewMode === id
                    ? "border-white text-white"
                    : "border-transparent text-stone-400 hover:text-stone-200 hover:border-stone-500",
                )}
                style={{ fontSize: "13px" }}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Filter panel ────────────────────────────────────────────────────── */}
      {showFilters && viewMode === "list" && (
        <FilterPanel
          filters={localFilters}
          onChange={setLocalFilters}
          onApply={handleApplyFilters}
          onClear={handleClearFilters}
        />
      )}

      {/* ── Main content ────────────────────────────────────────────────────── */}
      <div className="max-w-screen-2xl mx-auto px-8 py-6">
        {/* Board date navigator */}
        {viewMode === "board" && (
          <div className="flex items-center gap-2 mb-5 flex-wrap">
            <button
              onClick={() => handleDateNav("prev")}
              className="h-9 w-9 flex items-center justify-center rounded-xl bg-white border border-gray-200 shadow-sm text-gray-500 hover:bg-stone-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <input
              type="date"
              value={boardDate}
              onChange={(e) => {
                setBoardDate(e.target.value);
                fetchBoard(e.target.value);
              }}
              className="h-9 px-3 border border-gray-200 rounded-xl text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-400/30"
            />

            <button
              onClick={() => handleDateNav("next")}
              className="h-9 w-9 flex items-center justify-center rounded-xl bg-white border border-gray-200 shadow-sm text-gray-500 hover:bg-stone-50 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                const today = new Date().toISOString().split("T")[0];
                setBoardDate(today);
                fetchBoard(today);
              }}
              className="h-9 px-4 border border-gray-200 rounded-xl bg-white shadow-sm text-gray-600 hover:bg-stone-50 transition-colors font-medium"
              style={{ fontSize: "13px" }}
            >
              Today
            </button>

            {isStaff && (
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-medium"
                style={{ fontSize: "11px" }}
              >
                <Shield className="w-3 h-3" />
                Showing your tasks only
              </span>
            )}
          </div>
        )}

        {/* View content */}
        {viewMode === "overview" && (
          <HousekeepingOverview
            onNavigateToTask={(id) => setSelectedTaskId(id)}
            onNavigateToBoard={() => setViewMode("board")}
            onNavigateToList={() => setViewMode("list")}
          />
        )}

        {viewMode === "board" && (
          <BoardView
            board={board}
            isLoading={isLoading}
            isManager={isManager}
            onTaskClick={handleTaskClick}
          />
        )}

        {viewMode === "list" && (
          <ListView
            tasks={tasks}
            meta={meta}
            isLoading={isLoading}
            isManager={isManager}
            onTaskClick={handleTaskClick}
            onPageChange={(p) => fetchTasks(p, pageSize)}
            onPageSizeChange={handlePageSizeChange}
          />
        )}

        {viewMode === "rooms" && isManager && <RoomHousekeepingManager />}

        {viewMode === "stats" && isManager && <StatsOverview stats={stats} />}
      </div>

      {/* ── Modals ──────────────────────────────────────────────────────────── */}
      {showCreateModal && (
        <CreateTaskModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            handleRefresh();
          }}
        />
      )}

      {selectedTaskId && (
        <TaskDetailModal
          taskId={selectedTaskId}
          onClose={() => {
            setSelectedTaskId(null);
            setSelectedTask(null);
          }}
          onSuccess={() => {
            setSelectedTaskId(null);
            setSelectedTask(null);
            handleRefresh();
          }}
        />
      )}
    </div>
  );
}
