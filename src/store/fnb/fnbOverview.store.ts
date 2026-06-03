// frontend/src/features/fnb/store/fnbOverview.store.ts

import { fnbOverviewApi } from "@/services/fnb/fnbOverview.api";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface ServiceStat {
  serviceId: string;
  serviceName: string;
  serviceIcon: string;
  serviceType: string;
  menuCount: number;
  itemCount: number;
  availableItems: number;
  outOfStockItems: number;
  featuredItems: number;
  signatureItems: number;
}

export interface MenuStat {
  menuId: string;
  menuName: string;
  status: string;
  sectionCount: number;
  itemCount: number;
  availableFrom?: string;
  availableTo?: string;
  availableDays: string[];
  linkedServices: string[];
}

export interface FnbOverviewStats {
  totalServices: number;
  activeServices: number;
  totalMenus: number;
  activeMenus: number;
  totalItems: number;
  availableItems: number;
  outOfStockItems: number;
  discontinuedItems: number;
  totalCategories: number;
  totalDietaryTags: number;
  totalSections: number;
  featuredItems: number;
  signatureItems: number;
  serviceStats: ServiceStat[];
  menuStats: MenuStat[];
  recentItems: RecentItem[];
}

export interface RecentItem {
  id: string;
  name: string;
  price: string;
  status: string;
  menuName: string;
  categoryName?: string;
  createdAt: string;
  imageUrl?: string;
}

interface OverviewState {
  stats: FnbOverviewStats | null;
  isLoading: boolean;
  error: string | null;
  lastFetched: Date | null;
}

interface OverviewActions {
  fetchOverview: () => Promise<void>;
  refresh: () => Promise<void>;
  reset: () => void;
}

const initialState: OverviewState = {
  stats: null,
  isLoading: false,
  error: null,
  lastFetched: null,
};

export const useFnbOverviewStore = create<OverviewState & OverviewActions>()(
  devtools(
    (set, get) => ({
      ...initialState,

      fetchOverview: async () => {
        if (get().isLoading) return;
        set({ isLoading: true, error: null });
        try {
          const res = await fnbOverviewApi.getStats();
          set({ stats: res.data.data, lastFetched: new Date() });
        } catch (err: any) {
          set({ error: err?.response?.data?.message ?? err.message });
        } finally {
          set({ isLoading: false });
        }
      },

      refresh: async () => {
        set({ isLoading: true, error: null });
        try {
          const res = await fnbOverviewApi.getStats();
          set({ stats: res.data.data, lastFetched: new Date() });
        } catch (err: any) {
          set({ error: err?.response?.data?.message ?? err.message });
        } finally {
          set({ isLoading: false });
        }
      },

      reset: () => set(initialState),
    }),
    { name: "fnb-overview-store" },
  ),
);
