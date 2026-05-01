import { hotelItemService } from "@/services/room/hotelItemService";
import type {
  CreateHotelItemForm,
  HotelItem,
  HotelItemFilters,
  HotelStockMovement,
  InventorySummary,
  StockAdjustmentForm,
} from "@/types/room-types";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface HotelItemState {
  items: HotelItem[];
  selectedItem: HotelItem | null;
  summary: InventorySummary | null;
  movements: HotelStockMovement[];
  filters: HotelItemFilters;
  isLoading: boolean;
  isSubmitting: boolean;
  isLoadingMovements: boolean;
  error: string | null;
  total: number;
  page: number;
  totalPages: number;

  fetchItems: (filters?: HotelItemFilters, page?: number) => Promise<void>;
  fetchItem: (id: string) => Promise<void>;
  fetchSummary: () => Promise<void>;
  fetchMovements: (itemId: string) => Promise<void>;
  fetchAllMovements: (filters?: { type?: string }) => Promise<void>;
  createItem: (data: CreateHotelItemForm) => Promise<HotelItem>;
  updateItem: (
    id: string,
    data: Partial<CreateHotelItemForm & { isActive: boolean }>,
  ) => Promise<void>;
  adjustStock: (id: string, data: StockAdjustmentForm) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  setFilters: (f: HotelItemFilters) => void;
  setSelectedItem: (item: HotelItem | null) => void;
  clearError: () => void;
}

export const useHotelItemStore = create<HotelItemState>()(
  devtools((set, get) => ({
    items: [],
    selectedItem: null,
    summary: null,
    movements: [],
    filters: {},
    isLoading: false,
    isSubmitting: false,
    isLoadingMovements: false,
    error: null,
    total: 0,
    page: 1,
    totalPages: 1,
    fetchItems: async (filters, page = 1) => {
      set({ isLoading: true, error: null });
      try {
        const f = filters ?? get().filters;
        const result = await hotelItemService.getAll(f, page);
        set({
          items: Array.isArray(result.items) ? result.items : [],
          total: result.total ?? 0,
          page: result.page ?? 1,
          totalPages: result.totalPages ?? 1,
          isLoading: false,
        });
      } catch (e: any) {
        set({ error: e.message, isLoading: false, items: [] });
      }
    },

    fetchItem: async (id) => {
      set({ isLoading: true, error: null });
      try {
        const item = await hotelItemService.getById(id);
        set({ selectedItem: item, isLoading: false });
      } catch (e: any) {
        set({ error: e.message, isLoading: false });
      }
    },

    fetchSummary: async () => {
      set({ isLoading: true, error: null });
      try {
        const summary = await hotelItemService.getSummary();
        set({ summary, isLoading: false });
      } catch (e: any) {
        set({ error: e.message, isLoading: false });
      }
    },

    fetchMovements: async (itemId) => {
      set({ isLoadingMovements: true, movements: [], error: null }); // 👈 clear stale data first
      try {
        const movements = await hotelItemService.getMovements(itemId);
        set({
          movements: Array.isArray(movements) ? movements : [],
          isLoadingMovements: false,
        });
      } catch (e: any) {
        set({ error: e.message, isLoadingMovements: false, movements: [] });
      }
    },

    fetchAllMovements: async (filters) => {
      set({ isLoadingMovements: true, error: null });
      try {
        const movements = await hotelItemService.getAllMovements(filters);
        set({
          movements: Array.isArray(movements) ? movements : [],
          isLoadingMovements: false,
        });
      } catch (e: any) {
        set({ error: e.message, isLoadingMovements: false });
      }
    },

    createItem: async (data) => {
      set({ isSubmitting: true, error: null });
      try {
        const item = await hotelItemService.create(data);
        await Promise.all([get().fetchItems(), get().fetchSummary()]);
        set({ isSubmitting: false });
        return item;
      } catch (e: any) {
        set({ error: e.message, isSubmitting: false });
        throw e;
      }
    },

    updateItem: async (id, data) => {
      set({ isSubmitting: true, error: null });
      try {
        await hotelItemService.update(id, data);
        // ✅ Refetch instead of patching with potentially incomplete object
        await get().fetchItems();
        set({ isSubmitting: false });
      } catch (e: any) {
        set({ error: e.message, isSubmitting: false });
        throw e;
      }
    },

    adjustStock: async (id, data) => {
      set({ isSubmitting: true, error: null });
      try {
        const result = await hotelItemService.adjustStock(id, data);
        set((s) => ({
          items: s.items.map((i) => (i.id === id ? result.item : i)),
          selectedItem:
            s.selectedItem?.id === id ? result.item : s.selectedItem,
          // 👇 only prepend if movement is actually valid
          movements: result.movement
            ? [result.movement, ...s.movements]
            : s.movements,
          isSubmitting: false,
        }));
        get().fetchSummary();
      } catch (e: any) {
        set({ error: e.message, isSubmitting: false });
        throw e;
      }
    },

    deleteItem: async (id) => {
      set({ isSubmitting: true, error: null });
      try {
        await hotelItemService.delete(id);
        set((s) => ({
          items: s.items.filter((i) => i.id !== id),
          isSubmitting: false,
        }));
      } catch (e: any) {
        set({ error: e.message, isSubmitting: false });
        throw e;
      }
    },

    setFilters: (f) => set({ filters: f, page: 1 }),
    setSelectedItem: (item) => set({ selectedItem: item }),
    clearError: () => set({ error: null }),
  })),
);
