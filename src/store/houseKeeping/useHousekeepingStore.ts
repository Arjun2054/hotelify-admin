import { housekeepingService } from "@/services/houseKeeping/housekeepingService";
import type {
  BatchCreateTasksPayload,
  CompleteTaskPayload,
  CreateHousekeepingTaskPayload,
  HousekeepingBoardColumn,
  HousekeepingFilters,
  HousekeepingStats,
  HousekeepingTask,
  InspectTaskPayload,
  ItemUsageReport,
  RecordItemUsedPayload,
  RoomItemStandard,
} from "@/types/houseKeeping-types";
import { create } from "zustand";
import { useAuthStore } from "../useAuthStore";

interface HousekeepingState {
  // Data
  tasks: HousekeepingTask[];
  selectedTask: HousekeepingTask | null;
  board: HousekeepingBoardColumn[];
  stats: HousekeepingStats | null;
  standardItems: RoomItemStandard[];
  itemUsage: ItemUsageReport[];
  filters: HousekeepingFilters;
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  } | null;
  boardDate: string; // ISO date for board view
  isLoading: boolean;
  error: string | null;

  // ── Data Fetching ─────────────────────────────────────
  fetchTasks: (page?: number, pageSize?: number) => Promise<void>;
  fetchTaskById: (id: string) => Promise<void>;
  fetchBoard: (date?: string) => Promise<void>;
  fetchStats: () => Promise<void>;
  fetchStandardItems: (taskId: string) => Promise<void>;
  fetchItemUsage: (dateFrom?: string, dateTo?: string) => Promise<void>;

  // ── CRUD ──────────────────────────────────────────────
  createTask: (
    data: CreateHousekeepingTaskPayload,
  ) => Promise<HousekeepingTask>;
  batchCreateTasks: (data: BatchCreateTasksPayload) => Promise<{
    created: HousekeepingTask[];
    errors: { roomId: string; error: string }[];
  }>;
  updateTask: (
    id: string,
    data: Partial<CreateHousekeepingTaskPayload>,
  ) => Promise<HousekeepingTask>;
  cancelTask: (id: string) => Promise<void>;

  // ── Workflow ──────────────────────────────────────────
  startTask: (id: string) => Promise<HousekeepingTask>;
  completeTask: (
    id: string,
    data: CompleteTaskPayload,
  ) => Promise<HousekeepingTask>;
  inspectTask: (
    id: string,
    data: InspectTaskPayload,
  ) => Promise<{
    task: HousekeepingTask;
    approved: boolean;
    roomStatus: string;
  }>;
  recordItems: (
    taskId: string,
    items: RecordItemUsedPayload[],
  ) => Promise<void>;

  // ── Filters ───────────────────────────────────────────
  setFilters: (filters: Partial<HousekeepingFilters>) => void;
  setBoardDate: (date: string) => void;
  setSelectedTask: (task: HousekeepingTask | null) => void;
  clearError: () => void;

  _getFiltersWithRoleGuard: () => HousekeepingFilters;
}

export const useHousekeepingStore = create<HousekeepingState>((set, get) => ({
  tasks: [],
  selectedTask: null,
  board: [],
  stats: null,
  standardItems: [],
  itemUsage: [],
  filters: {},
  meta: null,
  boardDate: new Date().toISOString().split("T")[0],
  isLoading: false,
  error: null,

  _getFiltersWithRoleGuard: (): HousekeepingFilters => {
    const { filters } = get();
    const authState = useAuthStore.getState();
    const role = authState.getActiveRole();
    const user = authState.user;

    // STAFF → force filter to their own userId only
    if (role === "STAFF" && user) {
      return { ...filters, userId: user.userId };
    }

    // OWNER / ADMIN → return filters as-is
    return filters;
  },

  // ── Data Fetching ───────────────────────────────────

  fetchTasks: async (page = 1, pageSize = 25) => {
    set({ isLoading: true, error: null });
    try {
      const filters = get()._getFiltersWithRoleGuard();
      const result = await housekeepingService.getAll(
        filters,
        page,
        pageSize, // ← pass through
      );
      set({
        tasks: result.data,
        meta: result.meta,
        isLoading: false,
      });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  fetchTaskById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const task = await housekeepingService.getById(id);
      set({ selectedTask: task, isLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  fetchBoard: async (date) => {
    set({ isLoading: true, error: null });
    try {
      const d = date ?? get().boardDate;
      const board = await housekeepingService.getBoard(d);
      set({ board, isLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  fetchStats: async () => {
    try {
      const stats = await housekeepingService.getStats();
      set({ stats });
    } catch (err) {
      console.error("Failed to fetch housekeeping stats:", err);
    }
  },

  fetchStandardItems: async (taskId) => {
    try {
      const items = await housekeepingService.getStandardItems(taskId);
      set({ standardItems: items });
    } catch (err) {
      console.error("Failed to fetch standard items:", err);
    }
  },

  fetchItemUsage: async (dateFrom, dateTo) => {
    try {
      const usage = await housekeepingService.getItemUsage(dateFrom, dateTo);
      set({ itemUsage: usage });
    } catch (err) {
      console.error("Failed to fetch item usage:", err);
    }
  },

  // ── CRUD ────────────────────────────────────────────

  createTask: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const task = await housekeepingService.create(data);
      set((s) => ({
        tasks: [task, ...s.tasks],
        isLoading: false,
      }));
      get().fetchStats();
      return task;
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
      throw err;
    }
  },

  batchCreateTasks: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const result = await housekeepingService.batchCreate(data);
      set((s) => ({
        tasks: [...(result?.created ?? []), ...s.tasks],
        isLoading: false,
      }));
      get().fetchStats();
      return result!;
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
      throw err;
    }
  },

  updateTask: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await housekeepingService.update(id, data);
      set((s) => ({
        tasks: s.tasks.map((t) => (t.id === id ? updated : t)),
        selectedTask: s.selectedTask?.id === id ? updated : s.selectedTask,
        isLoading: false,
      }));
      return updated;
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
      throw err;
    }
  },

  cancelTask: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await housekeepingService.cancel(id);
      set((s) => ({
        tasks: s.tasks.filter((t) => t.id !== id),
        selectedTask: s.selectedTask?.id === id ? null : s.selectedTask,
        // Also remove from board columns
        board: s.board.map((col) => ({
          ...col,
          tasks: col.tasks.filter((t) => t.id !== id),
        })),
        isLoading: false,
      }));
      get().fetchStats();
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
      throw err;
    }
  },

  // ── Workflow ────────────────────────────────────────

  startTask: async (id) => {
    set({ error: null });
    try {
      const task = await housekeepingService.start(id);
      set((s) => ({
        tasks: s.tasks.map((t) => (t.id === id ? task : t)),
        selectedTask: s.selectedTask?.id === id ? task : s.selectedTask,
        board: s.board.map((col) => ({
          ...col,
          tasks: col.tasks.map((t) => (t.id === id ? task : t)),
        })),
      }));
      get().fetchStats();
      return task;
    } catch (err) {
      set({ error: (err as Error).message });
      throw err;
    }
  },

  completeTask: async (id, data) => {
    set({ error: null });
    try {
      const task = await housekeepingService.complete(id, data);
      set((s) => ({
        tasks: s.tasks.map((t) => (t.id === id ? task : t)),
        selectedTask: s.selectedTask?.id === id ? task : s.selectedTask,
      }));
      set((s) => ({
        tasks: s.tasks.map((t) => (t.id === id ? task : t)),
        selectedTask: s.selectedTask?.id === id ? task : s.selectedTask,
        board: s.board.map((col) => ({
          ...col,
          tasks: col.tasks.map((t) => (t.id === id ? task : t)),
        })),
      }));
      get().fetchStats();
      return task;
    } catch (err) {
      set({ error: (err as Error).message });
      throw err;
    }
  },

  inspectTask: async (id, data) => {
    set({ error: null });
    try {
      const result = await housekeepingService.inspect(id, data);
      set((s) => ({
        tasks: s.tasks.map((t) => (t.id === id ? result!.task : t)),
        selectedTask: s.selectedTask?.id === id ? result!.task : s.selectedTask,
        board: s.board.map((col) => ({
          ...col,
          tasks: col.tasks.map((t) => (t.id === id ? result!.task : t)),
        })),
      }));
      get().fetchStats();
      return result!;
    } catch (err) {
      set({ error: (err as Error).message });
      throw err;
    }
  },

  recordItems: async (taskId, items) => {
    set({ error: null });
    try {
      await housekeepingService.recordItems(taskId, items);
      // Refresh task to see updated items
      get().fetchTaskById(taskId);
    } catch (err) {
      set({ error: (err as Error).message });
      throw err;
    }
  },

  // ── Filters ─────────────────────────────────────────

  setFilters: (newFilters) =>
    set((s) => ({
      filters: { ...s.filters, ...newFilters },
    })),

  setBoardDate: (date) => set({ boardDate: date }),
  setSelectedTask: (task) => set({ selectedTask: task }),
  clearError: () => set({ error: null }),
}));
