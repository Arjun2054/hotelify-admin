// src/components/housekeeping/HousekeepingOverview.tsx
"use client";

import { useEffect, useState } from "react";
import {
  BedDouble,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Package,
  Play,
  ClipboardCheck,
  RefreshCw,
  ChevronRight,
  Loader2,
  BarChart3,
  Zap,
  Award,
  Activity,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import type {
  HousekeepingTask,
  HousekeepingStats,
} from "@/types/houseKeeping-types";
import { useHousekeepingStore } from "@/store/houseKeeping/useHousekeepingStore";

// ── Types ──────────────────────────────────────────────────
interface HousekeepingOverviewProps {
  onNavigateToTask?: (taskId: string) => void;
  onNavigateToBoard?: () => void;
  onNavigateToList?: () => void;
}

// ── Status Config ──────────────────────────────────────────
const STATUS_CONFIG = {
  PENDING: {
    label: "Pending",
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    text: "text-yellow-700",
    dot: "bg-yellow-400",
    icon: Clock,
  },
  IN_PROGRESS: {
    label: "In Progress",
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
    dot: "bg-blue-500",
    icon: Play,
  },
  COMPLETED: {
    label: "Completed",
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-700",
    dot: "bg-green-500",
    icon: CheckCircle2,
  },
  INSPECTED: {
    label: "Inspected",
    bg: "bg-purple-50",
    border: "border-purple-200",
    text: "text-purple-700",
    dot: "bg-purple-500",
    icon: ClipboardCheck,
  },
} as const;

// ── Helpers ────────────────────────────────────────────────
function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function isOverdue(scheduledAt: string, status: string) {
  if (status === "COMPLETED" || status === "INSPECTED") return false;
  return new Date(scheduledAt) < new Date();
}

function calcDuration(start: string | null, end: string | null) {
  if (!start || !end) return null;
  const mins = Math.round(
    (new Date(end).getTime() - new Date(start).getTime()) / 60000,
  );
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════
export default function HousekeepingOverview({
  onNavigateToTask,
  onNavigateToBoard,
  onNavigateToList,
}: HousekeepingOverviewProps) {
  // ── Auth ───────────────────────────────────────────────
  const { user, getActiveOrganization, canPerformAction } = useAuthStore();
  const activeOrg = getActiveOrganization();
  const isManager = canPerformAction(["OWNER", "ADMIN"]);

  // ── Store ──────────────────────────────────────────────
  const {
    tasks,
    stats,
    board,
    itemUsage,
    isLoading,
    fetchTasks,
    fetchStats,
    fetchBoard,
    fetchItemUsage,
    startTask,
  } = useHousekeepingStore();

  // ── Local State ────────────────────────────────────────
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  // ── Load Data ──────────────────────────────────────────
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    const today = new Date().toISOString().split("T")[0];
    await Promise.all([
      fetchStats(),
      fetchBoard(today),
      fetchTasks(1),
      isManager ? fetchItemUsage() : Promise.resolve(),
    ]);
    setLastRefreshed(new Date());
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadDashboardData();
    setIsRefreshing(false);
  };

  // ── Derived Data ───────────────────────────────────────
  const today = new Date().toISOString().split("T")[0];

  // Today's tasks from board
  const todayTasks = board.flatMap((col) => col.tasks);

  // My tasks (for staff view)
  const myTasks = tasks.filter((t) => t.userId === user?.userId);
  const myPendingTasks = myTasks.filter((t) => t.status === "PENDING");
  const myInProgressTasks = myTasks.filter((t) => t.status === "IN_PROGRESS");
  const myCompletedToday = myTasks.filter(
    (t) =>
      t.status === "COMPLETED" &&
      t.completedAt &&
      new Date(t.completedAt).toDateString() === new Date().toDateString(),
  );

  // Overdue tasks
  const overdueTasks = todayTasks.filter((t) =>
    isOverdue(t.scheduledAt, t.status),
  );

  // Tasks needing inspection (manager only)
  const needsInspection = todayTasks.filter((t) => t.status === "COMPLETED");

  // In progress tasks
  const inProgressTasks = todayTasks.filter((t) => t.status === "IN_PROGRESS");

  // Completion rate
  const completionRate =
    stats && stats.total > 0
      ? Math.round(((stats.completed + stats.inspected) / stats.total) * 100)
      : 0;

  // ── Start Task Handler ────────────────────────────────
  const handleStartTask = async (taskId: string) => {
    setActionLoading(taskId);
    try {
      await startTask(taskId);
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading && !stats) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-sm text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {getGreeting()}, {user?.name?.split(" ")[0]} 👋
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {new Date().toLocaleDateString([], {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}{" "}
            · {activeOrg?.name}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">
            Updated{" "}
            {lastRefreshed.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw
              className={`w-4 h-4 text-gray-500 ${isRefreshing ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* ── Render based on role ── */}
      {isManager ? (
        <ManagerDashboard
          stats={stats}
          todayTasks={todayTasks}
          overdueTasks={overdueTasks}
          needsInspection={needsInspection}
          inProgressTasks={inProgressTasks}
          completionRate={completionRate}
          itemUsage={itemUsage}
          onNavigateToTask={onNavigateToTask}
          onNavigateToBoard={onNavigateToBoard}
          onNavigateToList={onNavigateToList}
        />
      ) : (
        <StaffDashboard
          myTasks={myTasks}
          myPendingTasks={myPendingTasks}
          myInProgressTasks={myInProgressTasks}
          myCompletedToday={myCompletedToday}
          overdueTasks={overdueTasks.filter((t) => t.userId === user?.userId)}
          actionLoading={actionLoading}
          onStartTask={handleStartTask}
          onNavigateToTask={onNavigateToTask}
          onNavigateToBoard={onNavigateToBoard}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// MANAGER DASHBOARD
// ═══════════════════════════════════════════════════════════
function ManagerDashboard({
  stats,
  todayTasks,
  overdueTasks,
  needsInspection,
  inProgressTasks,
  completionRate,
  itemUsage,
  onNavigateToTask,
  onNavigateToBoard,
  onNavigateToList,
}: {
  stats: HousekeepingStats | null;
  todayTasks: HousekeepingTask[];
  overdueTasks: HousekeepingTask[];
  needsInspection: HousekeepingTask[];
  inProgressTasks: HousekeepingTask[];
  completionRate: number;
  itemUsage: any[];
  onNavigateToTask?: (id: string) => void;
  onNavigateToBoard?: () => void;
  onNavigateToList?: () => void;
}) {
  return (
    <div className="space-y-6">
      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Tasks"
          value={stats?.total ?? 0}
          sub="All time"
          icon={BedDouble}
          color="blue"
        />
        <KpiCard
          label="Today's Tasks"
          value={stats?.todayTasks ?? 0}
          sub="Scheduled today"
          icon={Calendar}
          color="indigo"
        />
        <KpiCard
          label="Completion Rate"
          value={`${completionRate}%`}
          sub={`${(stats?.completed ?? 0) + (stats?.inspected ?? 0)} done`}
          icon={TrendingUp}
          color="green"
        />
        <KpiCard
          label="Overdue"
          value={stats?.overdueTasks ?? 0}
          sub="Need attention"
          icon={AlertTriangle}
          color={(stats?.overdueTasks ?? 0 > 0) ? "red" : "gray"}
        />
      </div>

      {/* ── Status Overview ── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" />
            Today's Status Overview
          </h3>
          <button
            onClick={onNavigateToBoard}
            className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
          >
            View Board <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(["PENDING", "IN_PROGRESS", "COMPLETED", "INSPECTED"] as const).map(
            (status) => {
              const cfg = STATUS_CONFIG[status];
              const Icon = cfg.icon;
              const count = todayTasks.filter(
                (t) => t.status === status,
              ).length;
              const pct =
                todayTasks.length > 0
                  ? Math.round((count / todayTasks.length) * 100)
                  : 0;

              return (
                <div
                  key={status}
                  className={`rounded-xl border p-4 ${cfg.bg} ${cfg.border}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={`w-4 h-4 ${cfg.text}`} />
                    <span
                      className={`text-xs font-medium ${cfg.text} bg-white/60 px-1.5 py-0.5 rounded-full`}
                    >
                      {pct}%
                    </span>
                  </div>
                  <p className={`text-2xl font-bold ${cfg.text}`}>{count}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{cfg.label}</p>
                </div>
              );
            },
          )}
        </div>

        {/* Progress bar */}
        {todayTasks.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
              <span>Overall Progress</span>
              <span>{completionRate}% complete</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden flex">
              {(
                [
                  { status: "INSPECTED", color: "bg-purple-500" },
                  { status: "COMPLETED", color: "bg-green-500" },
                  { status: "IN_PROGRESS", color: "bg-blue-500" },
                  { status: "PENDING", color: "bg-yellow-400" },
                ] as const
              ).map(({ status, color }) => {
                const count = todayTasks.filter(
                  (t) => t.status === status,
                ).length;
                const pct =
                  todayTasks.length > 0 ? (count / todayTasks.length) * 100 : 0;
                return (
                  <div
                    key={status}
                    className={`h-full ${color} transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Alert Sections ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Overdue Tasks */}
        <AlertSection
          title="Overdue Tasks"
          icon={AlertTriangle}
          iconColor="text-red-500"
          count={overdueTasks.length}
          emptyMessage="No overdue tasks 🎉"
          emptyColor="text-green-600"
          accentColor="border-red-200 bg-red-50"
          tasks={overdueTasks.slice(0, 4)}
          onTaskClick={onNavigateToTask}
          onViewAll={onNavigateToList}
        />

        {/* Needs Inspection */}
        <AlertSection
          title="Ready for Inspection"
          icon={ClipboardCheck}
          iconColor="text-purple-500"
          count={needsInspection.length}
          emptyMessage="No rooms waiting for inspection"
          emptyColor="text-gray-400"
          accentColor="border-purple-200 bg-purple-50"
          tasks={needsInspection.slice(0, 4)}
          onTaskClick={onNavigateToTask}
          onViewAll={onNavigateToList}
        />
      </div>

      {/* ── In Progress & Staff Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Currently In Progress */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Play className="w-4 h-4 text-blue-600" />
              Currently Cleaning
              {inProgressTasks.length > 0 && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                  {inProgressTasks.length}
                </span>
              )}
            </h3>
          </div>

          {inProgressTasks.length === 0 ? (
            <EmptyState message="No rooms being cleaned right now" />
          ) : (
            <div className="space-y-2">
              {inProgressTasks.slice(0, 5).map((task) => (
                <InProgressCard
                  key={task.id}
                  task={task}
                  onClick={() => onNavigateToTask?.(task.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Staff Performance */}
        <StaffPerformancePanel tasks={todayTasks} />
      </div>

      {/* ── Item Usage ── */}
      {itemUsage.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Package className="w-4 h-4 text-blue-600" />
              Top Items Used
            </h3>
          </div>

          <div className="space-y-2">
            {itemUsage.slice(0, 5).map((item, idx) => (
              <div
                key={item.itemId}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {item.itemName}
                  </p>
                  <p className="text-xs text-gray-400">
                    Used {item.usageCount}x
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-gray-900">
                    {item.totalUsed}{" "}
                    <span className="text-xs text-gray-400 font-normal">
                      {item.unit}
                    </span>
                  </p>
                  {item.currentStock < 5 && (
                    <p className="text-xs text-red-500 font-medium">
                      Low stock!
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Avg Completion Time ── */}
      {stats?.avgCompletionMinutes && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium mb-1">
                Average Completion Time
              </p>
              <p className="text-4xl font-bold">
                {stats.avgCompletionMinutes < 60
                  ? `${stats.avgCompletionMinutes}m`
                  : `${Math.floor(stats.avgCompletionMinutes / 60)}h ${stats.avgCompletionMinutes % 60}m`}
              </p>
              <p className="text-blue-200 text-xs mt-1">
                Per housekeeping task
              </p>
            </div>
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
              <Zap className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// STAFF DASHBOARD
// ═══════════════════════════════════════════════════════════
function StaffDashboard({
  myTasks,
  myPendingTasks,
  myInProgressTasks,
  myCompletedToday,
  overdueTasks,
  actionLoading,
  onStartTask,
  onNavigateToTask,
  onNavigateToBoard,
}: {
  myTasks: HousekeepingTask[];
  myPendingTasks: HousekeepingTask[];
  myInProgressTasks: HousekeepingTask[];
  myCompletedToday: HousekeepingTask[];
  overdueTasks: HousekeepingTask[];
  actionLoading: string | null;
  onStartTask: (id: string) => void;
  onNavigateToTask?: (id: string) => void;
  onNavigateToBoard?: () => void;
}) {
  return (
    <div className="space-y-6">
      {/* ── My Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard
          label="My Tasks"
          value={myTasks.length}
          sub="Total assigned"
          icon={BedDouble}
          color="blue"
        />
        <KpiCard
          label="Pending"
          value={myPendingTasks.length}
          sub="To be started"
          icon={Clock}
          color="yellow"
        />
        <KpiCard
          label="In Progress"
          value={myInProgressTasks.length}
          sub="Currently cleaning"
          icon={Play}
          color="indigo"
        />
        <KpiCard
          label="Done Today"
          value={myCompletedToday.length}
          sub="Completed today"
          icon={CheckCircle2}
          color="green"
        />
      </div>

      {/* ── Overdue Warning ── */}
      {overdueTasks.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h3 className="font-semibold text-red-700">
              {overdueTasks.length} Overdue Task
              {overdueTasks.length !== 1 ? "s" : ""}
            </h3>
          </div>
          <div className="space-y-2">
            {overdueTasks.map((task) => (
              <button
                key={task.id}
                onClick={() => onNavigateToTask?.(task.id)}
                className="w-full flex items-center justify-between p-3 bg-white rounded-xl border border-red-100 hover:border-red-300 transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <BedDouble className="w-4 h-4 text-red-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      Room {task.room.roomNumber}
                    </p>
                    <p className="text-xs text-red-500">
                      Scheduled: {formatDate(task.scheduledAt)}{" "}
                      {formatTime(task.scheduledAt)}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-red-400" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Active Task (In Progress) ── */}
      {myInProgressTasks.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
            <h3 className="font-semibold text-blue-800">Currently Cleaning</h3>
          </div>
          <div className="space-y-3">
            {myInProgressTasks.map((task) => (
              <ActiveTaskCard
                key={task.id}
                task={task}
                onClick={() => onNavigateToTask?.(task.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Pending Tasks ── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-yellow-500" />
            Pending Tasks
            {myPendingTasks.length > 0 && (
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">
                {myPendingTasks.length}
              </span>
            )}
          </h3>
          <button
            onClick={onNavigateToBoard}
            className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
          >
            View All <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {myPendingTasks.length === 0 ? (
          <EmptyState message="No pending tasks — you're all caught up! 🎉" />
        ) : (
          <div className="space-y-2">
            {myPendingTasks.slice(0, 5).map((task) => (
              <StaffTaskCard
                key={task.id}
                task={task}
                actionLoading={actionLoading}
                onStart={onStartTask}
                onClick={() => onNavigateToTask?.(task.id)}
              />
            ))}
            {myPendingTasks.length > 5 && (
              <button
                onClick={onNavigateToBoard}
                className="w-full py-2.5 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-xl transition-colors font-medium"
              >
                View {myPendingTasks.length - 5} more tasks →
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Completed Today ── */}
      {myCompletedToday.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <Award className="w-4 h-4 text-green-500" />
            Completed Today
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
              {myCompletedToday.length}
            </span>
          </h3>
          <div className="space-y-2">
            {myCompletedToday.map((task) => (
              <button
                key={task.id}
                onClick={() => onNavigateToTask?.(task.id)}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left border border-gray-100"
              >
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">
                    Room {task.room.roomNumber}
                  </p>
                  <p className="text-xs text-gray-400">
                    {task.room.roomType.name} ·{" "}
                    {task.completedAt && formatTime(task.completedAt)}
                    {task.startedAt &&
                      task.completedAt &&
                      ` · ${calcDuration(task.startedAt, task.completedAt)}`}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    task.status === "INSPECTED"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {task.status === "INSPECTED" ? "Approved" : "Completed"}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Performance Summary ── */}
      <StaffPerformanceSummary
        myTasks={myTasks}
        myCompletedToday={myCompletedToday}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════

// ── KPI Card ──────────────────────────────────────────────
const KPI_COLOR_MAP: Record<
  string,
  { bg: string; icon: string; text: string; border: string }
> = {
  blue: {
    bg: "bg-blue-50",
    icon: "bg-blue-100 text-blue-600",
    text: "text-blue-900",
    border: "border-blue-100",
  },
  indigo: {
    bg: "bg-indigo-50",
    icon: "bg-indigo-100 text-indigo-600",
    text: "text-indigo-900",
    border: "border-indigo-100",
  },
  green: {
    bg: "bg-green-50",
    icon: "bg-green-100 text-green-600",
    text: "text-green-900",
    border: "border-green-100",
  },
  yellow: {
    bg: "bg-yellow-50",
    icon: "bg-yellow-100 text-yellow-600",
    text: "text-yellow-900",
    border: "border-yellow-100",
  },
  red: {
    bg: "bg-red-50",
    icon: "bg-red-100 text-red-600",
    text: "text-red-900",
    border: "border-red-100",
  },
  purple: {
    bg: "bg-purple-50",
    icon: "bg-purple-100 text-purple-600",
    text: "text-purple-900",
    border: "border-purple-100",
  },
  gray: {
    bg: "bg-gray-50",
    icon: "bg-gray-100 text-gray-500",
    text: "text-gray-700",
    border: "border-gray-100",
  },
};

function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  sub: string;
  icon: React.ElementType;
  color: string;
}) {
  const c = KPI_COLOR_MAP[color] ?? KPI_COLOR_MAP.gray;
  return (
    <div
      className={`rounded-2xl border ${c.border} ${c.bg} p-4 flex flex-col gap-3`}
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.icon}`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className={`text-2xl font-bold ${c.text}`}>{value}</p>
        <p className="text-sm font-medium text-gray-700 mt-0.5">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

// ── Alert Section ─────────────────────────────────────────
function AlertSection({
  title,
  icon: Icon,
  iconColor,
  count,
  emptyMessage,
  emptyColor,
  accentColor,
  tasks,
  onTaskClick,
  onViewAll,
}: {
  title: string;
  icon: React.ElementType;
  iconColor: string;
  count: number;
  emptyMessage: string;
  emptyColor: string;
  accentColor: string;
  tasks: HousekeepingTask[];
  onTaskClick?: (id: string) => void;
  onViewAll?: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Icon className={`w-4 h-4 ${iconColor}`} />
          {title}
          {count > 0 && (
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium border ${accentColor}`}
            >
              {count}
            </span>
          )}
        </h3>
        {count > 0 && onViewAll && (
          <button
            onClick={onViewAll}
            className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
          >
            View all <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {tasks.length === 0 ? (
        <EmptyState message={emptyMessage} color={emptyColor} />
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <button
              key={task.id}
              onClick={() => onTaskClick?.(task.id)}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left border border-gray-100"
            >
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                <BedDouble className="w-4 h-4 text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800">
                  Room {task.room.roomNumber}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {task.user.name} · {formatDate(task.scheduledAt)}{" "}
                  {formatTime(task.scheduledAt)}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── In Progress Card (Manager) ────────────────────────────
function InProgressCard({
  task,
  onClick,
}: {
  task: HousekeepingTask;
  onClick: () => void;
}) {
  const elapsed = task.startedAt
    ? Math.round(
        (new Date().getTime() - new Date(task.startedAt).getTime()) / 60000,
      )
    : 0;

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 transition-colors text-left border border-blue-100 bg-white"
    >
      <div className="relative shrink-0">
        <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
          <BedDouble className="w-4 h-4 text-blue-600" />
        </div>
        <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-white animate-pulse" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800">
          Room {task.room.roomNumber}
        </p>
        <p className="text-xs text-gray-400 truncate">
          {task.user.name} · {elapsed}m elapsed
        </p>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
    </button>
  );
}

// ── Staff Task Card ───────────────────────────────────────
function StaffTaskCard({
  task,
  actionLoading,
  onStart,
  onClick,
}: {
  task: HousekeepingTask;
  actionLoading: string | null;
  onStart: (id: string) => void;
  onClick: () => void;
}) {
  const overdue = isOverdue(task.scheduledAt, task.status);
  const loading = actionLoading === task.id;

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
        overdue
          ? "border-red-200 bg-red-50"
          : "border-gray-100 hover:border-gray-200 bg-white"
      }`}
    >
      {/* Room info — clickable */}
      <button
        onClick={onClick}
        className="flex items-center gap-3 flex-1 min-w-0 text-left"
      >
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
            overdue ? "bg-red-100" : "bg-gray-100"
          }`}
        >
          <BedDouble
            className={`w-4 h-4 ${overdue ? "text-red-500" : "text-gray-500"}`}
          />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-800">
            Room {task.room.roomNumber}
          </p>
          <p
            className={`text-xs truncate ${overdue ? "text-red-500 font-medium" : "text-gray-400"}`}
          >
            {overdue && "⚠ Overdue · "}
            {formatDate(task.scheduledAt)} {formatTime(task.scheduledAt)}
          </p>
        </div>
      </button>

      {/* Start button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onStart(task.id);
        }}
        disabled={loading}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 shrink-0"
      >
        {loading ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <Play className="w-3 h-3" />
        )}
        Start
      </button>
    </div>
  );
}

// ── Active Task Card (Staff In Progress) ──────────────────
function ActiveTaskCard({
  task,
  onClick,
}: {
  task: HousekeepingTask;
  onClick: () => void;
}) {
  const elapsed = task.startedAt
    ? Math.round(
        (new Date().getTime() - new Date(task.startedAt).getTime()) / 60000,
      )
    : 0;

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-4 bg-white rounded-xl border border-blue-100 hover:border-blue-300 transition-colors text-left"
    >
      <div className="relative shrink-0">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
          <BedDouble className="w-5 h-5 text-white" />
        </div>
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900">
          Room {task.room.roomNumber}
        </p>
        <p className="text-xs text-gray-500">
          {task.room.roomType.name} · Floor {task.room.floor}
        </p>
        <p className="text-xs text-blue-600 font-medium mt-0.5">
          {elapsed}m elapsed · Tap to manage
        </p>
      </div>
      <ChevronRight className="w-5 h-5 text-blue-400 shrink-0" />
    </button>
  );
}

// ── Staff Performance Panel (Manager) ────────────────────
function StaffPerformancePanel({ tasks }: { tasks: HousekeepingTask[] }) {
  // Group tasks by staff member
  const staffMap = tasks.reduce(
    (acc, task) => {
      const uid = task.userId;
      if (!acc[uid]) {
        acc[uid] = {
          userId: uid,
          name: task.user.name,
          total: 0,
          completed: 0,
          inProgress: 0,
          pending: 0,
        };
      }
      acc[uid].total++;
      if (task.status === "COMPLETED" || task.status === "INSPECTED")
        acc[uid].completed++;
      else if (task.status === "IN_PROGRESS") acc[uid].inProgress++;
      else if (task.status === "PENDING") acc[uid].pending++;
      return acc;
    },
    {} as Record<
      string,
      {
        userId: string;
        name: string;
        total: number;
        completed: number;
        inProgress: number;
        pending: number;
      }
    >,
  );

  const staffList = Object.values(staffMap).sort(
    (a, b) => b.completed - a.completed,
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
        <BarChart3 className="w-4 h-4 text-blue-600" />
        Staff Activity Today
      </h3>

      {staffList.length === 0 ? (
        <EmptyState message="No staff activity today" />
      ) : (
        <div className="space-y-3">
          {staffList.slice(0, 5).map((staff) => {
            const rate =
              staff.total > 0
                ? Math.round((staff.completed / staff.total) * 100)
                : 0;
            return (
              <div key={staff.userId} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-gray-600">
                    {staff.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {staff.name}
                    </p>
                    <span className="text-xs text-gray-500 ml-2 shrink-0">
                      {staff.completed}/{staff.total}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all duration-500"
                      style={{ width: `${rate}%` }}
                    />
                  </div>
                </div>
                {staff.inProgress > 0 && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Staff Performance Summary (Staff) ────────────────────
function StaffPerformanceSummary({
  myTasks,
  myCompletedToday,
}: {
  myTasks: HousekeepingTask[];
  myCompletedToday: HousekeepingTask[];
}) {
  const totalCompleted = myTasks.filter(
    (t) => t.status === "COMPLETED" || t.status === "INSPECTED",
  ).length;

  const avgDuration =
    myCompletedToday.length > 0
      ? Math.round(
          myCompletedToday
            .filter((t) => t.startedAt && t.completedAt)
            .reduce(
              (sum, t) =>
                sum +
                (new Date(t.completedAt!).getTime() -
                  new Date(t.startedAt!).getTime()) /
                  60000,
              0,
            ) / Math.max(myCompletedToday.length, 1),
        )
      : null;

  if (totalCompleted === 0) return null;

  return (
    <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-5 text-white">
      <div className="flex items-center gap-2 mb-3">
        <Award className="w-5 h-5 text-green-100" />
        <h3 className="font-semibold text-white">Your Performance</h3>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-3xl font-bold">{totalCompleted}</p>
          <p className="text-green-100 text-sm">Total completed</p>
        </div>
        {avgDuration !== null && (
          <div>
            <p className="text-3xl font-bold">
              {avgDuration < 60
                ? `${avgDuration}m`
                : `${Math.floor(avgDuration / 60)}h ${avgDuration % 60}m`}
            </p>
            <p className="text-green-100 text-sm">Avg. today</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Empty State ───────────────────────────────────────────
function EmptyState({
  message,
  color = "text-gray-400",
}: {
  message: string;
  color?: string;
}) {
  return (
    <div className="py-8 text-center">
      <p className={`text-sm ${color}`}>{message}</p>
    </div>
  );
}
