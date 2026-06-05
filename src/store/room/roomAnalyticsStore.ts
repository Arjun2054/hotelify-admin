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
  /**
   * Accepts an optional filter override so callers can pass the latest
   * filters/year directly without relying on React state having flushed
   * before the call is made (eliminates the setTimeout anti-pattern).
   */
  fetchAnalytics: (overrides?: Partial<AnalyticsFilter>) => Promise<void>;
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

  fetchAnalytics: async (overrides?: Partial<AnalyticsFilter>) => {
    set({ isLoading: true, error: null });
    try {
      const { filters, selectedYear } = get();

      // Merge any in-flight overrides (e.g. a just-applied filter or year
      // change) so we never read stale Zustand state that hasn't flushed yet.
      const merged: AnalyticsFilter = { ...filters, ...overrides };

      // Validate: if only one end of the range is provided, derive the other
      // from selectedYear so the API always receives a coherent range.
      const start = merged.startDate ?? new Date(selectedYear, 0, 1);
      const end = merged.endDate ?? new Date(selectedYear, 11, 31);

      // Guard: startDate must not be after endDate.
      const effectiveFilters: AnalyticsFilter = {
        ...merged,
        startDate: start <= end ? start : end,
        endDate: start <= end ? end : start,
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
