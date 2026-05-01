// hooks/useHousekeepingPage.ts

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import {
  organizationService,
  type OrganizationMember,
} from "@/services/organizationService";
import { useHousekeepingStore } from "@/store/houseKeeping/useHousekeepingStore";
import { useRoomStore } from "@/store/room/useRoomStore";
import { useAuthStore } from "@/store/useAuthStore";
import type {
  CreateHousekeepingTaskPayload,
  HousekeepingFilters,
  HousekeepingTask,
  InspectTaskPayload,
  RecordItemUsedPayload,
} from "@/types/houseKeeping-types";

export function useHousekeepingPage() {
  const {
    tasks,
    stats,
    filters,
    meta,
    isLoading,
    fetchTasks,
    fetchStats,
    createTask,
    batchCreateTasks,
    startTask,
    completeTask,
    inspectTask,
    recordItems,
    cancelTask,
    setFilters,
  } = useHousekeepingStore();

  const { rooms, floors, fetchRooms, fetchFloors } = useRoomStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeOrgId = useAuthStore((s) => s.activeOrganizationId);

  // ─── Role & Department awareness ──────────────────
  const activeRole = useAuthStore((s) => s.getActiveRole());
  const activeDepartment = useAuthStore((s) => s.getActiveDepartment());
  const currentUserId = useAuthStore((s) => s.user?.userId);

  const isStaff = activeRole === "STAFF";
  const isAdmin = activeRole === "OWNER" || activeRole === "ADMIN";

  // Determine if the current user is housekeeping-specific staff
  const isHousekeepingStaff = isStaff && activeDepartment === "HOUSEKEEPING";

  // Staff with no department set → general staff → same as old behavior
  const isGeneralStaff =
    isStaff && (!activeDepartment || activeDepartment === "GENERAL");

  // ── Organization members ──────────────────────────
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(true);

  // UPDATE THIS BLOCK:
  const staff = useMemo(
    () =>
      members
        // 1. Filter the members to only include those in Housekeeping
        .filter((m) => m.role === "STAFF")
        // 2. Map them to the required structure
        .map((m) => ({
          userId: m.user.userId,
          name: m.user.name,
        })),
    [members],
  );

  // ── Dialog state ──────────────────────────────────
  const [createOpen, setCreateOpen] = useState(false);
  const [detailTask, setDetailTask] = useState<HousekeepingTask | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [recordItemsTask, setRecordItemsTask] =
    useState<HousekeepingTask | null>(null);
  const [inspectDialogTask, setInspectDialogTask] =
    useState<HousekeepingTask | null>(null);
  const [cancelTarget, setCancelTarget] = useState<HousekeepingTask | null>(
    null,
  );

  // ── Initialization ────────────────────────────────
  useEffect(() => {
    fetchStats();
    fetchFloors();
    fetchRooms();
  }, []);

  useEffect(() => {
    if (!activeOrgId) return;

    const loadMembers = async () => {
      try {
        setMembersLoading(true);
        const data = await organizationService.getMembers(activeOrgId);
        setMembers(data.members);
      } catch (err) {
        console.error("Failed to fetch members:", err);
      } finally {
        setMembersLoading(false);
      }
    };

    loadMembers();
  }, [activeOrgId]);

  // ─── Lock userId filter for STAFF ─────────────────
  useEffect(() => {
    if (isStaff && currentUserId) {
      setFilters({ userId: currentUserId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStaff, currentUserId]);

  // Sync URL params → filters
  useEffect(() => {
    const roomId = searchParams.get("roomId");
    const status = searchParams.get("status");
    const createForRoom = searchParams.get("createForRoom");

    const patch: Record<string, string | undefined> = {};
    if (roomId) patch.roomId = roomId;
    if (status) patch.status = status;
    if (Object.keys(patch).length) setFilters(patch as any);
    if (createForRoom) setCreateOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Highlight task from URL
  useEffect(() => {
    const highlight = searchParams.get("highlight");
    if (!highlight || tasks.length === 0) return;

    const found = tasks.find((t) => t.id === highlight);
    if (found) {
      setDetailTask(found);
      setDetailOpen(true);
      searchParams.delete("highlight");
      setSearchParams(searchParams, { replace: true });
    }
  }, [tasks, searchParams, setSearchParams]);

  // Re-fetch when filters change
  useEffect(() => {
    fetchTasks();
  }, [filters, fetchTasks]);

  const preselectedRoomId = searchParams.get("createForRoom") ?? undefined;

  // ── Safe filter setter (prevents staff from unlocking userId) ──
  const safeSetFilters = useCallback(
    (newFilters: Partial<HousekeepingFilters>) => {
      if (isStaff && currentUserId) {
        newFilters.userId = currentUserId;
      }
      setFilters(newFilters);
    },
    [isStaff, currentUserId, setFilters],
  );

  // ── Handlers ──────────────────────────────────────

  const handleCreate = useCallback(
    async (data: CreateHousekeepingTaskPayload) => {
      await createTask(data);
      toast.success("Task created successfully");
      fetchRooms();
    },
    [createTask, fetchRooms],
  );

  const handleBatchCreate = useCallback(
    async (
      roomIds: string[],
      userId: string,
      scheduledAt: string,
      notes?: string,
    ) => {
      const result = await batchCreateTasks({
        roomIds,
        userId,
        scheduledAt,
        notes,
      });
      toast.success(`${result.created.length} task(s) created`);
      if (result.errors.length > 0) {
        toast.warning(`${result.errors.length} room(s) skipped`);
      }
      fetchRooms();
    },
    [batchCreateTasks, fetchRooms],
  );

  const handleStart = useCallback(
    async (task: HousekeepingTask) => {
      try {
        await startTask(task.id);
        toast.success(`Started cleaning Room ${task.room.roomNumber}`);
        fetchRooms();
      } catch (err) {
        toast.error((err as Error).message);
      }
    },
    [startTask, fetchRooms],
  );

  const handleComplete = useCallback(
    async (task: HousekeepingTask) => {
      try {
        await completeTask(task.id, {});
        toast.success(`Room ${task.room.roomNumber} cleaning completed`);
      } catch (err) {
        toast.error((err as Error).message);
      }
    },
    [completeTask],
  );

  const handleInspect = useCallback(
    async (taskId: string, data: InspectTaskPayload) => {
      try {
        const result = await inspectTask(taskId, data);
        if (result.approved) {
          toast.success("Inspection approved — room is now available");
        } else {
          toast.info("Sent back for re-cleaning");
        }
        fetchRooms();
      } catch (err) {
        toast.error((err as Error).message);
      }
    },
    [inspectTask, fetchRooms],
  );

  const handleRecordItems = useCallback(
    async (taskId: string, items: RecordItemUsedPayload[]) => {
      try {
        await recordItems(taskId, items);
        toast.success("Items recorded successfully");
      } catch (err) {
        toast.error((err as Error).message);
      }
    },
    [recordItems],
  );

  const handleCancel = useCallback(async () => {
    if (!cancelTarget) return;
    try {
      await cancelTask(cancelTarget.id);
      toast.success("Task cancelled");
      fetchRooms();
    } catch (err) {
      toast.error((err as Error).message);
    }
    setCancelTarget(null);
  }, [cancelTarget, cancelTask, fetchRooms]);

  const handleClearFilters = useCallback(() => {
    const base: Partial<HousekeepingFilters> = {
      status: undefined,
      dateFrom: undefined,
      dateTo: undefined,
      floor: undefined,
      roomId: undefined,
      userId: undefined,
    };
    if (isStaff && currentUserId) {
      base.userId = currentUserId;
    }
    setFilters(base as any);
  }, [setFilters, isStaff, currentUserId]);

  const openDetail = useCallback((task: HousekeepingTask) => {
    setDetailTask(task);
    setDetailOpen(true);
  }, []);

  const closeCreateDialog = useCallback(() => {
    setCreateOpen(false);
    if (searchParams.has("createForRoom")) {
      searchParams.delete("createForRoom");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const openInspectFromDetail = useCallback((task: HousekeepingTask) => {
    setDetailOpen(false);
    setInspectDialogTask(task);
  }, []);

  const openRecordItemsFromDetail = useCallback((task: HousekeepingTask) => {
    setDetailOpen(false);
    setRecordItemsTask(task);
  }, []);

  const goToPage = useCallback(
    (page: number) => fetchTasks(page),
    [fetchTasks],
  );

  return {
    // Data
    tasks,
    stats,
    filters,
    meta,
    isLoading,
    rooms,
    floors,
    staff,
    membersLoading,
    preselectedRoomId,

    // Role & department info
    isStaff,
    isAdmin,
    isHousekeepingStaff,
    isGeneralStaff,
    activeRole,
    activeDepartment,

    // Dialog state
    createOpen,
    setCreateOpen,
    detailTask,
    detailOpen,
    setDetailOpen,
    recordItemsTask,
    setRecordItemsTask,
    inspectDialogTask,
    setInspectDialogTask,
    cancelTarget,
    setCancelTarget,

    // Handlers
    handleCreate,
    handleBatchCreate,
    handleStart,
    handleComplete,
    handleInspect,
    handleRecordItems,
    handleCancel,
    handleClearFilters,
    openDetail,
    closeCreateDialog,
    openInspectFromDetail,
    openRecordItemsFromDetail,
    setFilters: safeSetFilters,
    goToPage,
  };
}
