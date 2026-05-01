import { hotelItemApi } from "@/services/hotel/hotelItemService";
import { hotelStockMovementApi } from "@/services/hotel/hotelStockMovementService";
import type {
  CreateHotelItemPayload,
  CreateStockMovementPayload,
  HotelItem,
  HotelItemFilters,
  HotelItemStats,
  ItemMovementSummary,
  StockMovement,
  StockMovementFilters,
  UpdateHotelItemPayload,
} from "@/types/hotelItem-types";
import { create } from "zustand";

interface HotelItemState {
  // Items
  items: HotelItem[];
  selectedItem: HotelItem | null;
  lowStockItems: HotelItem[];
  stats: HotelItemStats | null;
  filters: HotelItemFilters;
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  } | null;
  isLoading: boolean;
  error: string | null;

  // Stock Movements
  movements: StockMovement[];
  movementFilters: StockMovementFilters;
  movementMeta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  } | null;
  movementSummary: ItemMovementSummary | null;
  isMovementLoading: boolean;

  // ── Item Actions ───────────────────────────────────────
  fetchItems: (page?: number) => Promise<void>;
  fetchItemById: (id: string) => Promise<void>;
  fetchStats: () => Promise<void>;
  fetchLowStock: () => Promise<void>;
  createItem: (data: CreateHotelItemPayload) => Promise<HotelItem>;
  updateItem: (id: string, data: UpdateHotelItemPayload) => Promise<HotelItem>;
  deleteItem: (id: string) => Promise<void>;
  toogleActive: (id: string) => Promise<HotelItem>;
  setFilters: (filters: Partial<HotelItemFilters>) => void;
  setSelectedItem: (item: HotelItem | null) => void;

  // ── Stock Movement Actions ─────────────────────────────
  fetchMovements: (page?: number) => Promise<void>;
  createMovement: (data: CreateStockMovementPayload) => Promise<StockMovement>;
  fetchMovementSummary: (itemId: string) => Promise<void>;
  setMovementFilters: (filters: Partial<StockMovementFilters>) => void;

  clearError: () => void;
}

export const useHotelItemStore = create<HotelItemState>((set, get) => ({
  // State
  items: [],
  selectedItem: null,
  lowStockItems: [],
  stats: null,
  filters: {},
  meta: null,
  isLoading: false,
  error: null,
  movements: [],
  movementFilters: {},
  movementMeta: null,
  movementSummary: null,
  isMovementLoading: false,

  // ── Item Actions ───────────────────────────────────────

  fetchItems: async (page = 1) => {
    set({ isLoading: true, error: null });
    try {
      const { filters } = get();
      const result = await hotelItemApi.getAll(filters, page);
      set({
        items: result?.data ?? [],
        meta: result?.meta ?? null,
        isLoading: false,
      });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  fetchItemById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const item = await hotelItemApi.getById(id);
      set({ selectedItem: item, isLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  fetchStats: async () => {
    try {
      const stats = await hotelItemApi.getStats();
      set({ stats });
    } catch (err) {
      console.error("Failed to fetch hotel item stats:", err);
    }
  },

  fetchLowStock: async () => {
    try {
      const items = await hotelItemApi.getLowStock();
      set({ lowStockItems: items });
    } catch (err) {
      console.error("Failed to fetch low stock items:", err);
    }
  },

  createItem: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const newItem = await hotelItemApi.create(data);
      set((s) => ({
        items: [...s.items, newItem],
        isLoading: false,
      }));
      get().fetchStats();
      return newItem;
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
      throw err;
    }
  },

  updateItem: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await hotelItemApi.update(id, data);
      set((s) => ({
        items: s.items.map((i) => (i.id === id ? updated : i)),
        selectedItem: s.selectedItem?.id === id ? updated : s.selectedItem,
        isLoading: false,
      }));
      get().fetchStats();
      return updated;
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
      throw err;
    }
  },

  deleteItem: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await hotelItemApi.delete(id);
      set((s) => ({
        items: s.items.filter((i) => i.id !== id),
        selectedItem: s.selectedItem?.id === id ? null : s.selectedItem,
        isLoading: false,
      }));
      get().fetchStats();
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
      throw err;
    }
  },

  toogleActive: async (id) => {
    try {
      const updated = await hotelItemApi.toogleActive(id);
      set((s) => ({
        items: s.items.map((i) => (i.id === id ? updated : i)),
        selectedItem: s.selectedItem?.id === id ? updated : s.selectedItem,
      }));
      get().fetchStats();
      return updated;
    } catch (err) {
      set({ error: (err as Error).message });
      throw err;
    }
  },

  setFilters: (newFilters) => {
    set((s) => ({ filters: { ...s.filters, ...newFilters } }));
  },

  setSelectedItem: (item) => set({ selectedItem: item }),

  // ── Stock Movement Actions ─────────────────────────────

  fetchMovements: async (page = 1) => {
    set({ isMovementLoading: true });
    try {
      const { movementFilters } = get();
      const result = await hotelStockMovementApi.getAll(movementFilters, page);
      set({
        movements: result.data,
        movementMeta: result.meta,
        isMovementLoading: false,
      });
    } catch (err) {
      set({
        error: (err as Error).message,
        isMovementLoading: false,
      });
    }
  },

  createMovement: async (data) => {
    set({ isMovementLoading: true, error: null });
    try {
      const movement = await hotelStockMovementApi.create(data);

      // Refresh item data after stock change
      set((s) => ({
        movements: [movement, ...s.movements],
        isMovementLoading: false,
      }));

      // Refresh items + stats
      get().fetchItems();
      get().fetchStats();
      get().fetchLowStock();

      return movement;
    } catch (err) {
      set({
        error: (err as Error).message,
        isMovementLoading: false,
      });
      throw err;
    }
  },

  fetchMovementSummary: async (itemId) => {
    try {
      const summary = await hotelStockMovementApi.getItemSummary(itemId);
      set({ movementSummary: summary });
    } catch (err) {
      console.error("Failed to fetch movement summary:", err);
    }
  },

  setMovementFilters: (newFilters) => {
    set((s) => ({
      movementFilters: { ...s.movementFilters, ...newFilters },
    }));
  },

  clearError: () => set({ error: null }),
}));
