import { create } from "zustand";
import { stockService } from "../services/stockService";
import type {
  CreateStockMovementDto,
  StockFilters,
  StockMovement,
  StockReport,
  StockSummary,
} from "@/lib/types";

interface StockStore {
  // State
  movements: StockMovement[];
  summary: StockSummary | null;
  selectedReport: StockReport | null;
  loading: boolean;
  error: string | null;

  // Pagination
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;

  // Filters
  filters: StockFilters;

  // Actions
  fetchMovements: (filters?: StockFilters) => Promise<void>;
  fetchSummary: () => Promise<void>;
  fetchProductReport: (productId: string) => Promise<void>;
  stockIn: (data: CreateStockMovementDto) => Promise<StockMovement>;
  stockOut: (data: CreateStockMovementDto) => Promise<StockMovement>;
  exportReport: (filters?: StockFilters) => Promise<void>;

  // Pagination Actions
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;

  // Filter Actions
  setFilters: (filters: StockFilters) => void;
  clearFilters: () => void;

  // Utility
  reset: () => void;
  clearError: () => void;
}

export const useStockStore = create<StockStore>((set, get) => ({
  // Initial State
  movements: [],
  summary: null,
  selectedReport: null,
  loading: false,
  error: null,
  currentPage: 1,
  pageSize: 10,
  totalItems: 0,
  totalPages: 0,
  filters: {},

  // Fetch Movements
  fetchMovements: async (filters?: StockFilters) => {
    set({ loading: true, error: null });
    try {
      const { currentPage, pageSize, filters: currentFilters } = get();

      const response = await stockService.getStockMovements({
        page: filters?.page ?? currentPage,
        limit: filters?.limit ?? pageSize,
        ...currentFilters,
        ...filters,
      });

      // Ensure we always set an array
      set({
        movements: Array.isArray(response.data) ? response.data : [],
        totalItems: response.pagination.total,
        totalPages: response.pagination.totalPages,
        currentPage: response.pagination.page,
        loading: false,
      });
    } catch (error: any) {
      set({
        error:
          error.response?.data?.message || "Failed to fetch stock movements",
        movements: [], // Set empty array on error
        loading: false,
      });
    }
  },

  // Fetch Summary
  fetchSummary: async () => {
    set({ loading: true, error: null });
    try {
      const summary = await stockService.getStockSummary();
      set({ summary, loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch stock summary",
        loading: false,
      });
    }
  },

  // Fetch Product Report
  fetchProductReport: async (productId: string) => {
    set({ loading: true, error: null });
    try {
      const report = await stockService.getStockReport(productId);
      set({ selectedReport: report, loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch stock report",
        loading: false,
      });
    }
  },

  // Stock In
  stockIn: async (data: CreateStockMovementDto) => {
    set({ loading: true, error: null });
    try {
      const movement = await stockService.stockIn(data);
      await get().fetchMovements();
      await get().fetchSummary();
      set({ loading: false });
      return movement;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to add stock",
        loading: false,
      });
      throw error;
    }
  },

  // Stock Out
  stockOut: async (data: CreateStockMovementDto) => {
    set({ loading: true, error: null });
    try {
      const movement = await stockService.stockOut(data);
      await get().fetchMovements();
      await get().fetchSummary();
      set({ loading: false });
      return movement;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to remove stock",
        loading: false,
      });
      throw error;
    }
  },

  // Export Report
  exportReport: async (filters?: StockFilters) => {
    set({ loading: true, error: null });
    try {
      const blob = await stockService.exportStockReport(filters);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `stock-report-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to export report",
        loading: false,
      });
      throw error;
    }
  },

  // Set Page
  setPage: (page: number) => {
    set({ currentPage: page });
    get().fetchMovements({ page });
  },

  // Set Page Size
  setPageSize: (size: number) => {
    set({ pageSize: size, currentPage: 1 });
    get().fetchMovements({ limit: size, page: 1 });
  },

  // Set Filters
  setFilters: (filters: StockFilters) => {
    set({ filters, currentPage: 1 });
    get().fetchMovements({ ...filters, page: 1 });
  },

  // Clear Filters
  clearFilters: () => {
    set({ filters: {}, currentPage: 1 });
    get().fetchMovements({ page: 1 });
  },

  // Clear Error
  clearError: () => set({ error: null }),

  // Reset
  reset: () => {
    set({
      movements: [],
      summary: null,
      selectedReport: null,
      loading: false,
      error: null,
      currentPage: 1,
      pageSize: 10,
      totalItems: 0,
      totalPages: 0,
      filters: {},
    });
  },
}));
