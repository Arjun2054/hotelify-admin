// src/components/room-housekeeping/RoomHousekeepingManager.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BedDouble,
  Zap,
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Play,
  RefreshCw,
  Filter,
  Star,
  ArrowUpCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Info,
  X,
  LayoutGrid,
  List,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { organizationService } from "@/services/organizationService";
import type { OrganizationMember } from "@/services/organizationService";
import {
  autoAssignRooms,
  calculateStaffScore,
  determinePriority,
  determineCleaningType,
} from "@/lib/autoAssignEngine";
import type {
  RoomHousekeepingStatus,
  AutoAssignSuggestion,
  StaffWorkload,
  TaskPriority,
  CleaningType,
} from "@/types/room-housekeeping.types";
import { useHousekeepingStore } from "@/store/houseKeeping/useHousekeepingStore";
import { useRoomStore } from "@/store/room/useRoomStore";

// ── Priority Config ────────────────────────────────────────
const PRIORITY_CONFIG: Record<
  TaskPriority,
  { label: string; color: string; bg: string; border: string; dot: string }
> = {
  URGENT: {
    label: "Urgent",
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-300",
    dot: "bg-red-500",
  },
  VIP: {
    label: "VIP",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-300",
    dot: "bg-amber-500",
  },
  HIGH: {
    label: "High",
    color: "text-orange-700",
    bg: "bg-orange-50",
    border: "border-orange-300",
    dot: "bg-orange-400",
  },
  NORMAL: {
    label: "Normal",
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-300",
    dot: "bg-blue-400",
  },
  LOW: {
    label: "Low",
    color: "text-gray-600",
    bg: "bg-gray-50",
    border: "border-gray-200",
    dot: "bg-gray-400",
  },
};

const CLEANING_TYPE_LABELS: Record<CleaningType, string> = {
  STANDARD: "Standard",
  DEPARTURE: "Departure Clean",
  DEEP_CLEAN: "Deep Clean",
  VIP_ARRIVAL: "VIP Arrival",
  INSPECTION_ONLY: "Inspection",
};

// ── Room Status Config ─────────────────────────────────────
const ROOM_STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  AVAILABLE: {
    label: "Available",
    color: "text-green-700",
    bg: "bg-green-100",
  },
  OCCUPIED: { label: "Occupied", color: "text-blue-700", bg: "bg-blue-100" },
  CLEANING: {
    label: "Cleaning",
    color: "text-yellow-700",
    bg: "bg-yellow-100",
  },
  MAINTENANCE: {
    label: "Maintenance",
    color: "text-orange-700",
    bg: "bg-orange-100",
  },
  OUT_OF_ORDER: {
    label: "Out of Order",
    color: "text-red-700",
    bg: "bg-red-100",
  },
};

type ViewMode = "grid" | "list";

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════
export default function RoomHousekeepingManager() {
  // ── Auth ───────────────────────────────────────────────
  const { getActiveOrganization, canPerformAction } = useAuthStore();
  const activeOrg = getActiveOrganization();
  const isManager = canPerformAction(["OWNER", "ADMIN"]);

  // ── Stores ─────────────────────────────────────────────
  const { rooms, fetchRooms, isLoading: roomsLoading } = useRoomStore();

  const {
    tasks,
    fetchTasks,
    fetchStats,
    createTask,
    batchCreateTasks,
    isLoading: tasksLoading,
  } = useHousekeepingStore();

  // ── Local State ────────────────────────────────────────
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedFloor, setSelectedFloor] = useState<number | "all">("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAutoAssign, setShowAutoAssign] = useState(false);
  const [autoAssignDate, setAutoAssignDate] = useState(
    new Date().toISOString().slice(0, 16),
  );
  const [suggestions, setSuggestions] = useState<AutoAssignSuggestion[]>([]);
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<string>>(
    new Set(),
  );
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignSuccess, setAssignSuccess] = useState<string | null>(null);
  const [assignError, setAssignError] = useState<string | null>(null);

  // ── Load Data ──────────────────────────────────────────
  useEffect(() => {
    loadAllData();
  }, [activeOrg?.id]);

  const loadAllData = async () => {
    if (!activeOrg?.id) return;
    await Promise.all([
      fetchRooms(),
      fetchTasks(1, 100), // load enough for workload calculation
      fetchStats(),
      loadMembers(activeOrg.id),
    ]);
  };

  const loadMembers = async (orgId: string) => {
    setMembersLoading(true);
    try {
      const res = await organizationService.getMembers(orgId);
      const housekeepingStaff = res.members.filter(
        (m) => m.department === "HOUSEKEEPING" && m.role === "STAFF",
      );
      setMembers(housekeepingStaff);
    } catch {
      console.error("Failed to load members");
    } finally {
      setMembersLoading(false);
    }
  };

  // ── Build Room Housekeeping Status ─────────────────────
  const roomStatuses = useMemo((): RoomHousekeepingStatus[] => {
    return rooms.map((room) => {
      // Find active task for this room
      const activeTask = tasks.find(
        (t) =>
          t.roomId === room.id &&
          (t.status === "PENDING" || t.status === "IN_PROGRESS"),
      );

      const completedTask = tasks.find(
        (t) =>
          t.roomId === room.id &&
          (t.status === "COMPLETED" || t.status === "INSPECTED"),
      );

      const hasGuest = !!(room as any).currentGuest;
      const guestName = (room as any).currentGuest?.guestName ?? null;

      const priority = determinePriority(room.status, hasGuest, guestName);
      const cleaningType = determineCleaningType(
        room.status,
        hasGuest,
        false, // isCheckout - would need checkout detection
      );

      const needsCleaning = room.status === "CLEANING" && !activeTask;

      return {
        roomId: room.id,
        roomNumber: room.roomNumber,
        floor: room.floor,
        roomStatus: room.status,
        roomType: room.roomType?.name ?? "Unknown",
        hasActiveTask: !!activeTask,
        activeTask: activeTask
          ? {
              id: activeTask.id,
              status: activeTask.status,
              assignedTo: activeTask.user.name,
              scheduledAt: activeTask.scheduledAt,
              priority,
            }
          : null,
        lastCleaned: completedTask?.completedAt ?? null,
        currentGuest: guestName,
        priority,
        cleaningType,
        needsCleaning,
      };
    });
  }, [rooms, tasks]);

  // ── Staff Workloads ────────────────────────────────────
  const staffWorkloads = useMemo((): StaffWorkload[] => {
    return members.map((member) => calculateStaffScore(member, tasks, 1));
  }, [members, tasks]);

  // ── Floor list ─────────────────────────────────────────
  const floors = useMemo(() => {
    const unique = [...new Set(rooms.map((r) => r.floor))].sort(
      (a, b) => a - b,
    );
    return unique;
  }, [rooms]);

  // ── Filtered rooms ─────────────────────────────────────
  const filteredRooms = useMemo(() => {
    return roomStatuses.filter((r) => {
      if (selectedFloor !== "all" && r.floor !== selectedFloor) return false;
      if (selectedStatus !== "all" && r.roomStatus !== selectedStatus)
        return false;
      if (selectedPriority !== "all" && r.priority !== selectedPriority)
        return false;
      if (
        searchQuery &&
        !r.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !r.roomType.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false;
      return true;
    });
  }, [
    roomStatuses,
    selectedFloor,
    selectedStatus,
    selectedPriority,
    searchQuery,
  ]);

  // ── Rooms needing attention ────────────────────────────
  const needsAttention = useMemo(() => {
    return roomStatuses.filter((r) => r.needsCleaning && !r.hasActiveTask);
  }, [roomStatuses]);

  // ── Generate suggestions ───────────────────────────────
  const handleGenerateSuggestions = useCallback(() => {
    const newSuggestions = autoAssignRooms(
      roomStatuses,
      members,
      tasks,
      autoAssignDate,
    );
    setSuggestions(newSuggestions);
    setSelectedSuggestions(new Set(newSuggestions.map((s) => s.roomId)));
  }, [roomStatuses, members, tasks, autoAssignDate]);

  // ── Open auto-assign panel ─────────────────────────────
  const handleOpenAutoAssign = () => {
    handleGenerateSuggestions();
    setShowAutoAssign(true);
  };

  // ── Toggle suggestion selection ────────────────────────
  const toggleSuggestion = (roomId: string) => {
    setSelectedSuggestions((prev) => {
      const next = new Set(prev);
      if (next.has(roomId)) next.delete(roomId);
      else next.add(roomId);
      return next;
    });
  };

  // ── Confirm auto-assign ────────────────────────────────
  const handleConfirmAutoAssign = async () => {
    const toAssign = suggestions.filter((s) =>
      selectedSuggestions.has(s.roomId),
    );
    if (toAssign.length === 0) return;

    setIsAssigning(true);
    setAssignError(null);

    try {
      // Group by userId + scheduledAt for batch efficiency
      const groups = toAssign.reduce(
        (acc, s) => {
          const key = `${s.suggestedUserId}__${s.scheduledAt}`;
          if (!acc[key]) {
            acc[key] = {
              userId: s.suggestedUserId,
              scheduledAt: s.scheduledAt,
              roomIds: [],
            };
          }
          acc[key].roomIds.push(s.roomId);
          return acc;
        },
        {} as Record<
          string,
          { userId: string; scheduledAt: string; roomIds: string[] }
        >,
      );

      const results = await Promise.allSettled(
        Object.values(groups).map((group) => {
          if (group.roomIds.length === 1) {
            return createTask({
              roomId: group.roomIds[0],
              userId: group.userId,
              scheduledAt: group.scheduledAt,
            });
          } else {
            return batchCreateTasks({
              roomIds: group.roomIds,
              userId: group.userId,
              scheduledAt: group.scheduledAt,
            });
          }
        }),
      );

      const failed = results.filter((r) => r.status === "rejected");
      const succeeded = results.filter((r) => r.status === "fulfilled").length;

      if (failed.length > 0) {
        setAssignError(
          `${succeeded} assigned, ${failed.length} failed. Please retry failed ones manually.`,
        );
      } else {
        setAssignSuccess(
          `Successfully assigned ${toAssign.length} task${toAssign.length !== 1 ? "s" : ""}!`,
        );
        setShowAutoAssign(false);
        setSuggestions([]);
        await loadAllData();
      }
    } catch {
      setAssignError("Failed to create assignments. Please try again.");
    } finally {
      setIsAssigning(false);
    }
  };

  const isLoading = roomsLoading || tasksLoading || membersLoading;

  // ─────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* ── Success / Error Banners ── */}
      {assignSuccess && (
        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <p className="text-sm text-green-700">{assignSuccess}</p>
          </div>
          <button onClick={() => setAssignSuccess(null)}>
            <X className="w-4 h-4 text-green-500" />
          </button>
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            Room & Housekeeping
          </h2>
          <p className="text-sm text-gray-500">
            {needsAttention.length > 0
              ? `${needsAttention.length} room${needsAttention.length !== 1 ? "s" : ""} need${needsAttention.length === 1 ? "s" : ""} cleaning`
              : "All rooms up to date"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden bg-white">
            {(["grid", "list"] as ViewMode[]).map((v) => (
              <button
                key={v}
                onClick={() => setViewMode(v)}
                className={`p-2 transition-colors ${
                  viewMode === v
                    ? "bg-blue-600 text-white"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                {v === "grid" ? (
                  <LayoutGrid className="w-4 h-4" />
                ) : (
                  <List className="w-4 h-4" />
                )}
              </button>
            ))}
          </div>

          <button
            onClick={loadAllData}
            disabled={isLoading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 text-gray-500 ${isLoading ? "animate-spin" : ""}`}
            />
          </button>

          {/* Auto-assign button — manager only */}
          {isManager && needsAttention.length > 0 && (
            <button
              onClick={handleOpenAutoAssign}
              className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm"
            >
              <Zap className="w-4 h-4" />
              Auto-Assign ({needsAttention.length})
            </button>
          )}
        </div>
      </div>

      {/* ── Summary KPIs ── */}
      <SummaryKPIs
        roomStatuses={roomStatuses}
        staffWorkloads={staffWorkloads}
      />

      {/* ── Staff Workload Bar ── */}
      {isManager && <StaffWorkloadBar workloads={staffWorkloads} />}

      {/* ── Filters ── */}
      <FilterBar
        floors={floors}
        selectedFloor={selectedFloor}
        selectedStatus={selectedStatus}
        selectedPriority={selectedPriority}
        searchQuery={searchQuery}
        onFloorChange={setSelectedFloor}
        onStatusChange={setSelectedStatus}
        onPriorityChange={setSelectedPriority}
        onSearchChange={setSearchQuery}
      />

      {/* ── Room Grid / List ── */}
      {isLoading && rooms.length === 0 ? (
        <LoadingSkeleton />
      ) : filteredRooms.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <BedDouble className="w-10 h-10 text-gray-200 mx-auto mb-2" />
          <p className="text-gray-400 text-sm">No rooms match your filters</p>
        </div>
      ) : viewMode === "grid" ? (
        <RoomGrid
          rooms={filteredRooms}
          members={members}
          tasks={tasks}
          isManager={isManager}
          onAssignTask={async (roomId, userId) => {
            await createTask({
              roomId,
              userId,
              scheduledAt: new Date().toISOString(),
            });
            await loadAllData();
          }}
        />
      ) : (
        <RoomListView
          rooms={filteredRooms}
          members={members}
          tasks={tasks}
          isManager={isManager}
          onAssignTask={async (roomId, userId) => {
            await createTask({
              roomId,
              userId,
              scheduledAt: new Date().toISOString(),
            });
            await loadAllData();
          }}
        />
      )}

      {/* ── Auto-Assign Panel ── */}
      {showAutoAssign && (
        <AutoAssignPanel
          suggestions={suggestions}
          selectedSuggestions={selectedSuggestions}
          members={members}
          staffWorkloads={staffWorkloads}
          autoAssignDate={autoAssignDate}
          isAssigning={isAssigning}
          assignError={assignError}
          onDateChange={(d) => {
            setAutoAssignDate(d);
            handleGenerateSuggestions();
          }}
          onToggleSuggestion={toggleSuggestion}
          onSelectAll={() =>
            setSelectedSuggestions(new Set(suggestions.map((s) => s.roomId)))
          }
          onDeselectAll={() => setSelectedSuggestions(new Set())}
          onConfirm={handleConfirmAutoAssign}
          onClose={() => {
            setShowAutoAssign(false);
            setAssignError(null);
          }}
          onRegenerate={handleGenerateSuggestions}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SUMMARY KPIs
// ═══════════════════════════════════════════════════════════
function SummaryKPIs({
  roomStatuses,
  staffWorkloads,
}: {
  roomStatuses: RoomHousekeepingStatus[];
  staffWorkloads: StaffWorkload[];
}) {
  const needsCleaning = roomStatuses.filter(
    (r) => r.needsCleaning && !r.hasActiveTask,
  ).length;
  const inProgress = roomStatuses.filter((r) => r.hasActiveTask).length;
  const urgent = roomStatuses.filter(
    (r) =>
      (r.priority === "URGENT" || r.priority === "VIP") &&
      r.needsCleaning &&
      !r.hasActiveTask,
  ).length;
  const available = staffWorkloads.filter((s) => s.isAvailable).length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {[
        {
          label: "Needs Cleaning",
          value: needsCleaning,
          icon: BedDouble,
          color: needsCleaning > 0 ? "text-yellow-600" : "text-gray-400",
          bg: needsCleaning > 0 ? "bg-yellow-50" : "bg-gray-50",
          border: needsCleaning > 0 ? "border-yellow-200" : "border-gray-100",
        },
        {
          label: "In Progress",
          value: inProgress,
          icon: Play,
          color: "text-blue-600",
          bg: "bg-blue-50",
          border: "border-blue-100",
        },
        {
          label: "Urgent / VIP",
          value: urgent,
          icon: Star,
          color: urgent > 0 ? "text-red-600" : "text-gray-400",
          bg: urgent > 0 ? "bg-red-50" : "bg-gray-50",
          border: urgent > 0 ? "border-red-200" : "border-gray-100",
        },
        {
          label: "Staff Available",
          value: available,
          icon: Users,
          color: "text-green-600",
          bg: "bg-green-50",
          border: "border-green-100",
        },
      ].map(({ label, value, icon: Icon, color, bg, border }) => (
        <div
          key={label}
          className={`rounded-2xl border ${border} ${bg} p-4 flex items-center gap-3`}
        >
          <div className="w-10 h-10 bg-white/70 rounded-xl flex items-center justify-center shrink-0">
            <Icon className={`w-5 h-5 ${color}`} />
          </div>
          <div>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// STAFF WORKLOAD BAR
// ═══════════════════════════════════════════════════════════
function StaffWorkloadBar({ workloads }: { workloads: StaffWorkload[] }) {
  const [expanded, setExpanded] = useState(false);

  if (workloads.length === 0) return null;

  const displayed = expanded ? workloads : workloads.slice(0, 4);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-600" />
          Staff Workload
        </h3>
        {workloads.length > 4 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            {expanded ? "Show less" : `+${workloads.length - 4} more`}
            {expanded ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {displayed.map((staff) => {
          const maxTasks = 5;
          const pct = Math.min((staff.activeTasks / maxTasks) * 100, 100);
          const barColor =
            pct >= 80
              ? "bg-red-500"
              : pct >= 60
                ? "bg-yellow-500"
                : "bg-green-500";

          return (
            <div
              key={staff.userId}
              className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 border border-gray-100"
            >
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-blue-700">
                  {staff.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-medium text-gray-800 truncate">
                    {staff.name}
                  </p>
                  <span
                    className={`text-xs font-semibold ml-1 shrink-0 ${
                      staff.isAvailable ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {staff.activeTasks}/{maxTasks}
                  </span>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${barColor} transition-all`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  {staff.completedToday} done today
                  {staff.currentFloor !== null &&
                    ` · Floor ${staff.currentFloor}`}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// FILTER BAR
// ═══════════════════════════════════════════════════════════
function FilterBar({
  floors,
  selectedFloor,
  selectedStatus,
  selectedPriority,
  searchQuery,
  onFloorChange,
  onStatusChange,
  onPriorityChange,
  onSearchChange,
}: {
  floors: number[];
  selectedFloor: number | "all";
  selectedStatus: string;
  selectedPriority: string;
  searchQuery: string;
  onFloorChange: (v: number | "all") => void;
  onStatusChange: (v: string) => void;
  onPriorityChange: (v: string) => void;
  onSearchChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Search */}
      <div className="relative flex-1 min-w-40">
        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
        <input
          type="text"
          placeholder="Search rooms..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Floor */}
      <select
        value={selectedFloor}
        onChange={(e) =>
          onFloorChange(
            e.target.value === "all" ? "all" : parseInt(e.target.value),
          )
        }
        className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="all">All Floors</option>
        {floors.map((f) => (
          <option key={f} value={f}>
            Floor {f}
          </option>
        ))}
      </select>

      {/* Status */}
      <select
        value={selectedStatus}
        onChange={(e) => onStatusChange(e.target.value)}
        className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="all">All Statuses</option>
        {Object.entries(ROOM_STATUS_CONFIG).map(([key, val]) => (
          <option key={key} value={key}>
            {val.label}
          </option>
        ))}
      </select>

      {/* Priority */}
      <select
        value={selectedPriority}
        onChange={(e) => onPriorityChange(e.target.value)}
        className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="all">All Priorities</option>
        {Object.entries(PRIORITY_CONFIG).map(([key, val]) => (
          <option key={key} value={key}>
            {val.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// ROOM GRID
// ═══════════════════════════════════════════════════════════
function RoomGrid({
  rooms,
  members,
  tasks,
  isManager,
  onAssignTask,
}: {
  rooms: RoomHousekeepingStatus[];
  members: OrganizationMember[];
  tasks: any[];
  isManager: boolean;
  onAssignTask: (roomId: string, userId: string) => Promise<void>;
}) {
  // Group by floor
  const byFloor = rooms.reduce(
    (acc, room) => {
      if (!acc[room.floor]) acc[room.floor] = [];
      acc[room.floor].push(room);
      return acc;
    },
    {} as Record<number, RoomHousekeepingStatus[]>,
  );

  return (
    <div className="space-y-6">
      {Object.entries(byFloor)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([floor, floorRooms]) => (
          <div key={floor}>
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-sm font-semibold text-gray-600">
                Floor {floor}
              </h3>
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-xs text-gray-400">
                {floorRooms.length} rooms
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {floorRooms.map((room) => (
                <RoomCard
                  key={room.roomId}
                  room={room}
                  members={members}
                  tasks={tasks}
                  isManager={isManager}
                  onAssignTask={onAssignTask}
                />
              ))}
            </div>
          </div>
        ))}
    </div>
  );
}

// ── Room Card ──────────────────────────────────────────────
function RoomCard({
  room,
  members,
  isManager,
  onAssignTask,
}: {
  room: RoomHousekeepingStatus;
  members: OrganizationMember[];
  tasks: any[];
  isManager: boolean;
  onAssignTask: (roomId: string, userId: string) => Promise<void>;
}) {
  const [selectedUserId, setSelectedUserId] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [showAssignForm, setShowAssignForm] = useState(false);

  const priority = PRIORITY_CONFIG[room.priority];
  const roomStatus = ROOM_STATUS_CONFIG[room.roomStatus] ?? {
    label: room.roomStatus,
    color: "text-gray-600",
    bg: "bg-gray-100",
  };

  const isUrgent = room.priority === "URGENT" || room.priority === "VIP";

  const handleAssign = async () => {
    if (!selectedUserId) return;
    setAssigning(true);
    try {
      await onAssignTask(room.roomId, selectedUserId);
      setShowAssignForm(false);
      setSelectedUserId("");
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div
      className={`bg-white rounded-2xl border-2 overflow-hidden transition-all ${
        isUrgent && room.needsCleaning && !room.hasActiveTask
          ? "border-red-300 shadow-md shadow-red-100"
          : room.hasActiveTask
            ? "border-blue-200"
            : room.needsCleaning
              ? "border-yellow-300"
              : "border-gray-200"
      }`}
    >
      {/* Priority strip */}
      {(isUrgent || room.needsCleaning) && (
        <div
          className={`h-1 w-full ${
            isUrgent
              ? "bg-linear-to-r from-red-500 to-amber-500"
              : "bg-yellow-400"
          }`}
        />
      )}

      <div className="p-4">
        {/* Room header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900">
                Room {room.roomNumber}
              </span>
              {/* Priority badge */}
              {room.priority !== "NORMAL" && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium border ${priority.bg} ${priority.color} ${priority.border}`}
                >
                  {room.priority === "VIP" && (
                    <Star className="w-3 h-3 inline mr-0.5" />
                  )}
                  {priority.label}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              {room.roomType} · Floor {room.floor}
            </p>
          </div>

          {/* Room status */}
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${roomStatus.bg} ${roomStatus.color}`}
          >
            {roomStatus.label}
          </span>
        </div>

        {/* Current guest */}
        {room.currentGuest && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
            <Users className="w-3.5 h-3.5 text-gray-400" />
            <span className="truncate">{room.currentGuest}</span>
          </div>
        )}

        {/* Cleaning type */}
        {room.needsCleaning && (
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-xs text-gray-400">Type:</span>
            <span className="text-xs font-medium text-gray-700">
              {CLEANING_TYPE_LABELS[room.cleaningType]}
            </span>
          </div>
        )}

        {/* Active Task info */}
        {room.hasActiveTask && room.activeTask ? (
          <div className="mt-2 p-2.5 bg-blue-50 rounded-xl border border-blue-100">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-xs font-medium text-blue-700">
                {room.activeTask.status === "IN_PROGRESS"
                  ? "Cleaning in progress"
                  : "Task assigned"}
              </span>
            </div>
            <p className="text-xs text-blue-600 truncate">
              → {room.activeTask.assignedTo}
            </p>
            <p className="text-xs text-blue-400">
              {new Date(room.activeTask.scheduledAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        ) : room.needsCleaning && isManager ? (
          // Quick assign
          showAssignForm ? (
            <div className="mt-2 space-y-2">
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select staff...</option>
                {members.map((m) => (
                  <option key={m.user.userId} value={m.user.userId}>
                    {m.user.name}
                  </option>
                ))}
              </select>
              <div className="flex gap-1.5">
                <button
                  onClick={handleAssign}
                  disabled={!selectedUserId || assigning}
                  className="flex-1 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                >
                  {assigning ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    "Assign"
                  )}
                </button>
                <button
                  onClick={() => setShowAssignForm(false)}
                  className="px-2 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAssignForm(true)}
              className={`mt-2 w-full py-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${
                isUrgent
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              <ArrowUpCircle className="w-3.5 h-3.5" />
              {isUrgent ? "Assign Now (Urgent)" : "Assign Cleaning"}
            </button>
          )
        ) : room.lastCleaned ? (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-green-600">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>
              Cleaned{" "}
              {new Date(room.lastCleaned).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// ROOM LIST VIEW
// ═══════════════════════════════════════════════════════════
function RoomListView({
  rooms,
  members,
  tasks,
  isManager,
  onAssignTask,
}: {
  rooms: RoomHousekeepingStatus[];
  members: OrganizationMember[];
  tasks: any[];
  isManager: boolean;
  onAssignTask: (roomId: string, userId: string) => Promise<void>;
}) {
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [quickAssignUserId, setQuickAssignUserId] = useState<
    Record<string, string>
  >({});

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Room
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Status
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Priority
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Type
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Task
              </th>
              {isManager && (
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Action
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rooms.map((room) => {
              const priority = PRIORITY_CONFIG[room.priority];
              const roomStatus = ROOM_STATUS_CONFIG[room.roomStatus] ?? {
                label: room.roomStatus,
                color: "text-gray-600",
                bg: "bg-gray-100",
              };
              const isUrgent =
                room.priority === "URGENT" || room.priority === "VIP";

              return (
                <tr
                  key={room.roomId}
                  className={`transition-colors ${
                    isUrgent && room.needsCleaning && !room.hasActiveTask
                      ? "bg-red-50/40 hover:bg-red-50"
                      : "hover:bg-gray-50/60"
                  }`}
                >
                  {/* Room */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isUrgent ? "bg-red-100" : "bg-blue-50"
                        }`}
                      >
                        <BedDouble
                          className={`w-4 h-4 ${
                            isUrgent ? "text-red-500" : "text-blue-600"
                          }`}
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm leading-tight">
                          Room {room.roomNumber}
                        </p>
                        <p className="text-xs text-gray-400">
                          {room.roomType} · Floor {room.floor}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${roomStatus.bg} ${roomStatus.color}`}
                    >
                      {roomStatus.label}
                    </span>
                  </td>

                  {/* Priority */}
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium border ${priority.bg} ${priority.color} ${priority.border}`}
                    >
                      {room.priority === "VIP" && (
                        <Star className="w-3 h-3 inline mr-0.5" />
                      )}
                      {priority.label}
                    </span>
                  </td>

                  {/* Type */}
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-600">
                      {CLEANING_TYPE_LABELS[room.cleaningType]}
                    </span>
                  </td>

                  {/* Task */}
                  <td className="px-4 py-3">
                    {room.hasActiveTask && room.activeTask ? (
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shrink-0" />
                        <span className="text-xs text-blue-700 font-medium">
                          {room.activeTask.assignedTo}
                        </span>
                      </div>
                    ) : room.needsCleaning ? (
                      <span className="text-xs text-yellow-600 font-medium flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Unassigned
                      </span>
                    ) : room.lastCleaned ? (
                      <span className="text-xs text-green-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Cleaned
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>

                  {/* Action */}
                  {isManager && (
                    <td className="px-4 py-3">
                      {room.needsCleaning && !room.hasActiveTask ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={quickAssignUserId[room.roomId] ?? ""}
                            onChange={(e) =>
                              setQuickAssignUserId((prev) => ({
                                ...prev,
                                [room.roomId]: e.target.value,
                              }))
                            }
                            className="px-2 py-1 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-[120px]"
                          >
                            <option value="">Staff...</option>
                            {members.map((m) => (
                              <option key={m.user.userId} value={m.user.userId}>
                                {m.user.name}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={async () => {
                              const uid = quickAssignUserId[room.roomId];
                              if (!uid) return;
                              setAssigningId(room.roomId);
                              try {
                                await onAssignTask(room.roomId, uid);
                              } finally {
                                setAssigningId(null);
                              }
                            }}
                            disabled={
                              !quickAssignUserId[room.roomId] ||
                              assigningId === room.roomId
                            }
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 flex items-center gap-1 ${
                              isUrgent
                                ? "bg-red-600 text-white hover:bg-red-700"
                                : "bg-blue-600 text-white hover:bg-blue-700"
                            }`}
                          >
                            {assigningId === room.roomId ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              "Assign"
                            )}
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// AUTO-ASSIGN PANEL
// ═══════════════════════════════════════════════════════════
function AutoAssignPanel({
  suggestions,
  selectedSuggestions,
  members,
  staffWorkloads,
  autoAssignDate,
  isAssigning,
  assignError,
  onDateChange,
  onToggleSuggestion,
  onSelectAll,
  onDeselectAll,
  onConfirm,
  onClose,
  onRegenerate,
}: {
  suggestions: AutoAssignSuggestion[];
  selectedSuggestions: Set<string>;
  members: OrganizationMember[];
  staffWorkloads: StaffWorkload[];
  autoAssignDate: string;
  isAssigning: boolean;
  assignError: string | null;
  onDateChange: (d: string) => void;
  onToggleSuggestion: (roomId: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onConfirm: () => void;
  onClose: () => void;
  onRegenerate: () => void;
}) {
  const selectedCount = selectedSuggestions.size;

  // Priority-sorted suggestions
  const sorted = [...suggestions].sort((a, b) => {
    const order: Record<TaskPriority, number> = {
      URGENT: 0,
      VIP: 1,
      HIGH: 2,
      NORMAL: 3,
      LOW: 4,
    };
    return order[a.priority] - order[b.priority];
  });

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Auto-Assign Tasks
              </h2>
              <p className="text-sm text-gray-400">
                {suggestions.length} room
                {suggestions.length !== 1 ? "s" : ""} · AI-optimised assignment
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

        {/* Settings bar */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-3 flex-wrap shrink-0">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            <label className="text-xs text-gray-600 font-medium">
              Schedule for:
            </label>
            <input
              type="datetime-local"
              value={autoAssignDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="px-2 py-1 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={onRegenerate}
            className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 transition-colors ml-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Regenerate
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {/* Error */}
          {assignError && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{assignError}</p>
            </div>
          )}

          {/* Algorithm info */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded-xl">
            <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700">
              Assignments optimised by: workload balance · floor proximity ·
              task history · priority order (Urgent → VIP → High → Normal → Low)
            </p>
          </div>

          {/* Select all / deselect all */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedCount === suggestions.length}
                onChange={(e) =>
                  e.target.checked ? onSelectAll() : onDeselectAll()
                }
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm text-gray-700 font-medium">
                Select All ({suggestions.length})
              </span>
            </label>
            <span className="text-xs text-gray-500">
              {selectedCount} selected
            </span>
          </div>

          {/* Suggestion list */}
          {sorted.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle2 className="w-10 h-10 text-green-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">
                All rooms with cleaning needs already have tasks assigned!
              </p>
            </div>
          ) : (
            sorted.map((suggestion) => {
              const priority = PRIORITY_CONFIG[suggestion.priority];
              const isSelected = selectedSuggestions.has(suggestion.roomId);
              const staffWorkload = staffWorkloads.find(
                (s) => s.userId === suggestion.suggestedUserId,
              );
              const isUrgent =
                suggestion.priority === "URGENT" ||
                suggestion.priority === "VIP";

              return (
                <label
                  key={suggestion.roomId}
                  className={`flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    isSelected
                      ? isUrgent
                        ? "border-red-400 bg-red-50"
                        : "border-blue-400 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSuggestion(suggestion.roomId)}
                    className="w-4 h-4 text-blue-600 rounded mt-0.5 shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    {/* Room + priority */}
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span className="font-semibold text-gray-900 text-sm">
                        Room {suggestion.roomNumber}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium border ${priority.bg} ${priority.color} ${priority.border}`}
                      >
                        {suggestion.priority === "VIP" && (
                          <Star className="w-3 h-3 inline mr-0.5" />
                        )}
                        {priority.label}
                      </span>
                      <span className="text-xs text-gray-400">
                        · Floor {suggestion.floor}
                      </span>
                      <span className="text-xs text-gray-500">
                        · {CLEANING_TYPE_LABELS[suggestion.cleaningType]}
                      </span>
                    </div>

                    {/* Staff assignment */}
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-blue-700">
                          {suggestion.suggestedUserName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-800">
                        {suggestion.suggestedUserName}
                      </span>
                      {staffWorkload && (
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                            staffWorkload.activeTasks === 0
                              ? "bg-green-100 text-green-700"
                              : staffWorkload.activeTasks < 3
                                ? "bg-blue-100 text-blue-700"
                                : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {staffWorkload.activeTasks} tasks
                        </span>
                      )}
                    </div>

                    {/* Reason */}
                    <p className="text-xs text-gray-400">
                      Reason: {suggestion.reason}
                    </p>
                  </div>
                </label>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between shrink-0">
          <p className="text-sm text-gray-500">
            {selectedCount > 0 ? (
              <>
                Assigning{" "}
                <strong className="text-gray-700">{selectedCount}</strong> task
                {selectedCount !== 1 ? "s" : ""}
              </>
            ) : (
              "No tasks selected"
            )}
          </p>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm border border-gray-200 text-gray-600 rounded-xl hover:bg-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={selectedCount === 0 || isAssigning}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-medium hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {isAssigning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Assigning...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Confirm {selectedCount > 0 ? selectedCount : ""} Assignment
                  {selectedCount !== 1 ? "s" : ""}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Loading Skeleton ───────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3"
        >
          <div className="flex justify-between">
            <div className="h-5 w-24 bg-gray-100 rounded animate-pulse" />
            <div className="h-5 w-16 bg-gray-100 rounded animate-pulse" />
          </div>
          <div className="h-3 w-32 bg-gray-100 rounded animate-pulse" />
          <div className="h-8 w-full bg-gray-100 rounded-xl animate-pulse" />
        </div>
      ))}
    </div>
  );
}
