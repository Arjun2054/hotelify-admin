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

type ViewMode = "overview" | "board" | "list" | "stats" | "rooms";

export default function HousekeepingPage() {
  // ── Auth Store ────────────────────────────────────────────
  const {
    user,
    getActiveOrganization,
    getActiveRole,
    getActiveDepartment,
    canPerformAction,
    isInDepartment,
  } = useAuthStore();

  // ── Derived Identity ──────────────────────────────────────
  // role and department live in activeOrg, NOT in user object
  const activeOrg = getActiveOrganization();
  const role = getActiveRole(); // → activeOrg.role
  const department = getActiveDepartment(); // → activeOrg.department

  // Convenience flags
  const isManager = canPerformAction(["OWNER", "ADMIN"]);
  const isStaff = role === "STAFF";

  // OWNER/ADMIN → always access
  // STAFF → only if department is HOUSEKEEPING
  const hasAccess = isManager || isInDepartment("HOUSEKEEPING");

  // ── Housekeeping Store ────────────────────────────────────
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

  // ── Local UI State ────────────────────────────────────────
  const [pageSize, setPageSize] = useState(25);
  const [viewMode, setViewMode] = useState<ViewMode>("board");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [localFilters, setLocalFilters] =
    useState<HousekeepingFilters>(filters);

  // ── Effects ───────────────────────────────────────────────
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

  // ── Handlers ──────────────────────────────────────────────
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
    fetchTasks(1, size); // reset to page 1 when changing size
  };

  const activeFilterCount = Object.values(localFilters).filter(
    (v) => v !== undefined && v !== "" && v !== null,
  ).length;

  // ── Guard: No Organization ────────────────────────────────
  if (!activeOrg) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-yellow-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            No Organization Selected
          </h2>
          <p className="text-gray-500 text-sm">
            Please select an organization to continue.
          </p>
        </div>
      </div>
    );
  }

  // ── Guard: No Department Access ───────────────────────────
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Access Restricted
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            You don't have access to Housekeeping.
            {isStaff && department && (
              <>
                {" "}
                Your department is{" "}
                <span className="font-semibold text-gray-700">
                  {department}
                </span>
                . Only Housekeeping staff can access this section.
              </>
            )}
          </p>
        </div>
      </div>
    );
  }

  // ── Main Render ───────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Error Banner ── */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-3 flex items-center justify-between">
          <p className="text-sm text-red-700">{error}</p>
          <button
            onClick={clearError}
            className="text-red-400 hover:text-red-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Page Header ── */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-screen-2xl mx-auto space-y-4">
          {/* Title Row */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h1 className="text-2xl font-bold text-gray-900">
                  Housekeeping
                </h1>
                {/* 
                  RoleBadge uses activeOrg.role + activeOrg.department
                  NOT user.role (user has no role property)
                */}
                <RoleBadge
                  role={activeOrg.role}
                  department={activeOrg.department ?? null}
                />
              </div>

              {/* org name from activeOrg */}
              <p className="text-sm text-gray-500">
                {activeOrg.name} ·{" "}
                {isManager
                  ? "Manage and monitor all cleaning tasks"
                  : "Your assigned cleaning tasks"}
              </p>

              {/* user greeting from user object */}
              {user && (
                <p className="text-xs text-gray-400 mt-0.5">
                  Logged in as{" "}
                  <span className="font-medium text-gray-600">{user.name}</span>
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                title="Refresh"
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
                />
              </button>

              {/* Filters button — list view only */}

              {viewMode === "list" && (
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    activeFilterCount > 0
                      ? "bg-blue-50 border-blue-200 text-blue-700"
                      : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center leading-none">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              )}

              {/* Only OWNER/ADMIN see Assign Task button */}
              {isManager && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Assign Task
                </button>
              )}
            </div>
          </div>

          {/* Stats Strip — typed with HousekeepingStats */}
          {stats && <StatsStrip stats={stats} />}

          {/* Tab Bar */}
          <div className="flex items-center gap-1 border-b border-gray-100 -mb-4">
            {(
              [
                {
                  id: "overview" as ViewMode,
                  label: "Overview",
                  icon: LayoutGrid,
                },
                { id: "board" as ViewMode, label: "Board", icon: LayoutGrid },
                { id: "list" as ViewMode, label: "List", icon: List },

                ...(isManager
                  ? [
                      {
                        id: "rooms" as ViewMode,
                        label: "Room Manager",
                        icon: BedDouble,
                      },
                    ]
                  : []),

                // Analytics tab only visible to managers
                ...(isManager
                  ? [
                      {
                        id: "stats" as ViewMode,
                        label: "Analytics",
                        icon: BarChart3,
                      },
                    ]
                  : []),
              ] as { id: ViewMode; label: string; icon: React.ElementType }[]
            ).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setViewMode(id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                  viewMode === id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Filter Panel ── */}
      {showFilters && viewMode === "list" && (
        <FilterPanel
          filters={localFilters}
          onChange={setLocalFilters}
          onApply={handleApplyFilters}
          onClear={handleClearFilters}
        />
      )}

      {/* ── Main Content ── */}
      <div className="max-w-screen-2xl mx-auto px-6 py-6">
        {/* Board Date Navigator */}
        {viewMode === "board" && (
          <div className="flex items-center gap-2 mb-5">
            <button
              onClick={() => handleDateNav("prev")}
              className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>

            <input
              type="date"
              value={boardDate}
              onChange={(e) => {
                setBoardDate(e.target.value);
                fetchBoard(e.target.value);
              }}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              onClick={() => handleDateNav("next")}
              className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>

            <button
              onClick={() => {
                const today = new Date().toISOString().split("T")[0];
                setBoardDate(today);
                fetchBoard(today);
              }}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 bg-white transition-colors"
            >
              Today
            </button>

            {/* Staff sees reminder that they only see their own tasks */}
            {isStaff && (
              <span className="text-xs text-gray-400 ml-2 italic">
                Showing your tasks only
              </span>
            )}
          </div>
        )}

        {viewMode === "overview" && (
          <HousekeepingOverview
            onNavigateToTask={(id) => {
              setSelectedTaskId(id);
            }}
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
            onPageSizeChange={handlePageSizeChange} // ← new
          />
        )}
        {viewMode === "rooms" && isManager && <RoomHousekeepingManager />}

        {/* Analytics only for managers */}
        {viewMode === "stats" && isManager && <StatsOverview stats={stats} />}
      </div>

      {/* ── Modals ── */}
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

// ── RoleBadge ──────────────────────────────────────────────
// Reads from activeOrg.role and activeOrg.department
// user object has NO role property
function RoleBadge({
  role,
  department,
}: {
  role: string;
  department: string | null;
}) {
  const config: Record<string, { label: string; classes: string }> = {
    OWNER: {
      label: "Owner",
      classes: "bg-purple-100 text-purple-700",
    },
    ADMIN: {
      label: "Admin",
      classes: "bg-blue-100 text-blue-700",
    },
    STAFF: {
      label: department ? `Staff · ${department}` : "Staff",
      classes: "bg-gray-100 text-gray-600",
    },
  };

  const badge = config[role] ?? {
    label: role,
    classes: "bg-gray-100 text-gray-600",
  };

  return (
    <span
      className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${badge.classes}`}
    >
      {badge.label}
    </span>
  );
}

// ── StatsStrip ─────────────────────────────────────────────
// Uses imported HousekeepingStats type — fixes "Property does not exist" error
function StatsStrip({ stats }: { stats: HousekeepingStats }) {
  const items: {
    label: string;
    value: number;
    color: string;
  }[] = [
    {
      label: "Total",
      value: stats.total,
      color: "text-gray-900",
    },
    {
      label: "Pending",
      value: stats.pending,
      color: "text-yellow-600",
    },
    {
      label: "In Progress",
      value: stats.inProgress,
      color: "text-blue-600",
    },
    {
      label: "Completed",
      value: stats.completed,
      color: "text-green-600",
    },
    {
      label: "Inspected",
      value: stats.inspected,
      color: "text-purple-600",
    },
    {
      label: "Today",
      value: stats.todayTasks,
      color: "text-indigo-600",
    },
    {
      label: "Overdue",
      value: stats.overdueTasks,
      color:
        stats.overdueTasks > 0 ? "text-red-600 font-bold" : "text-gray-400",
    },
  ];

  return (
    <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
      {items.map((item) => (
        <div
          key={item.label}
          className="bg-gray-50 rounded-lg px-3 py-2 text-center border border-gray-100"
        >
          <div className={`text-lg font-bold ${item.color}`}>{item.value}</div>
          <div className="text-xs text-gray-400 mt-0.5">{item.label}</div>
        </div>
      ))}
    </div>
  );
}

// ── FilterPanel ────────────────────────────────────────────
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
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-screen-2xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {/* Status */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
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
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <label className="block text-xs font-medium text-gray-600 mb-1">
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
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Date From */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
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
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Date To */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
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
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-end gap-2">
            <button
              onClick={onApply}
              className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Apply
            </button>
            <button
              onClick={onClear}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
