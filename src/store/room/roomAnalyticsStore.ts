// store/roomAnalyticsStore.ts
import { roomAnalyticsService } from "@/services/room/roomAnalyticsService";
import type {
  AnalyticsFilter,
  DashboardStats,
  RoomAnalyticsResponse,
} from "@/types/room-analytics";
import { create } from "zustand";

interface RoomAnalyticsState {
  dashboard: DashboardStats | null;
  analytics: RoomAnalyticsResponse | null;
  filters: AnalyticsFilter;
  selectedYear: number;
  isLoading: boolean;
  isDashboardLoading: boolean;
  error: string | null;

  fetchDashboard: () => Promise<void>;
  fetchAnalytics: () => Promise<void>;
  setFilters: (filters: Partial<AnalyticsFilter>) => void;
  setYear: (year: number) => void;
  clearError: () => void;
}

export const useRoomAnalyticsStore = create<RoomAnalyticsState>((set, get) => ({
  dashboard: null,
  analytics: null,
  filters: {},
  selectedYear: new Date().getFullYear(),
  isLoading: false,
  isDashboardLoading: false,
  error: null,

  fetchDashboard: async () => {
    set({ isDashboardLoading: true, error: null });
    try {
      const dashboard = await roomAnalyticsService.getDashboard();
      set({ dashboard, isDashboardLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, isDashboardLoading: false });
    }
  },

  fetchAnalytics: async () => {
    set({ isLoading: true, error: null });
    try {
      const { filters, selectedYear } = get();
      const effectiveFilters: AnalyticsFilter = {
        ...filters,
        startDate: filters.startDate ?? new Date(selectedYear, 0, 1),
        endDate: filters.endDate ?? new Date(selectedYear, 11, 31),
      };
      const analytics =
        await roomAnalyticsService.getFullAnalytics(effectiveFilters);
      set({ analytics, isLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
  },

  setYear: (year) => set({ selectedYear: year }),
  clearError: () => set({ error: null }),
}));
