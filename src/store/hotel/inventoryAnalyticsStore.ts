// store/hotel/inventoryAnalyticsStore.ts
import { inventoryAnalyticsService } from "@/services/hotel/inventoryAnalyticsService";
import type {
  FullInventoryAnalytics,
  InventoryAnalyticsFilter,
  InventoryDashboardStats,
} from "@/types/inventory-analytics-types";
import { create } from "zustand";

interface InventoryAnalyticsState {
  dashboard: InventoryDashboardStats | null;
  analytics: FullInventoryAnalytics | null;
  filters: InventoryAnalyticsFilter;
  selectedYear: number;
  isLoading: boolean;
  isDashboardLoading: boolean;
  error: string | null;

  fetchDashboard: () => Promise<void>;
  fetchAnalytics: (
    overrides?: Partial<InventoryAnalyticsFilter>,
  ) => Promise<void>;
  setFilters: (f: Partial<InventoryAnalyticsFilter>) => void;
  setYear: (y: number) => void;
  clearError: () => void;
  refresh: () => void;
}

export const useInventoryAnalyticsStore = create<InventoryAnalyticsState>(
  (set, get) => ({
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
        const dashboard = await inventoryAnalyticsService.getDashboard();
        set({ dashboard, isDashboardLoading: false });
      } catch (err) {
        set({ error: (err as Error).message, isDashboardLoading: false });
      }
    },

    fetchAnalytics: async (overrides?: Partial<InventoryAnalyticsFilter>) => {
      set({ isLoading: true, error: null });
      try {
        const { filters, selectedYear } = get();

        const merged: InventoryAnalyticsFilter = { ...filters, ...overrides };

        const start = merged.startDate ?? new Date(selectedYear, 0, 1);
        const end = merged.endDate ?? new Date(selectedYear, 11, 31);

        // Guard: ensure startDate is never after endDate.
        const effectiveFilters: InventoryAnalyticsFilter = {
          ...merged,
          startDate: start <= end ? start : end,
          endDate: start <= end ? end : start,
        };

        const analytics =
          await inventoryAnalyticsService.getFullAnalytics(effectiveFilters);
        set({ analytics, isLoading: false });
      } catch (err) {
        set({ error: (err as Error).message, isLoading: false });
      }
    },

    setFilters: (newFilters) =>
      set((s) => ({ filters: { ...s.filters, ...newFilters } })),

    setYear: (year) => set({ selectedYear: year }),
    clearError: () => set({ error: null }),

    refresh: () => {
      const { fetchDashboard, fetchAnalytics } = get();
      fetchDashboard();
      fetchAnalytics();
    },
  }),
);
