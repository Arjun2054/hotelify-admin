import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { stockMovementService } from "../services/stock-movement.service";
import type {
  CreateStockMovementDTO,
  DashboardSummary,
  PaginationState,
  ProductReport,
  StockMovement,
  StockMovementFilters,
} from "@/types/stock-movement.types";

interface StockMovementState {
  // Data
  movements: StockMovement[];
  currentMovement: StockMovement | null;
  dashboardSummary: DashboardSummary | null;
  productReport: ProductReport | null;

  // Loading states
  isLoading: boolean;
  isCreating: boolean;
  isDeleting: boolean;
  isExporting: boolean;

  // Filters & Search
  filters: StockMovementFilters;
  searchQuery: string;

  // Pagination
  pagination: PaginationState;

  // Sorting
  sortBy: string;
  sortOrder: "asc" | "desc";

  // Actions
  fetchMovements: () => Promise<void>;
  fetchMovementById: (id: string) => Promise<void>;
  createStockIn: (data: CreateStockMovementDTO) => Promise<void>;
  createStockOut: (data: CreateStockMovementDTO) => Promise<void>;
  deleteMovement: (id: string) => Promise<void>;
  fetchDashboardSummary: () => Promise<void>;
  fetchProductReport: (
    productId: string,
    startDate?: string,
    endDate?: string,
  ) => Promise<void>;
  exportMovements: (format: "csv" | "json") => Promise<void>;

  // Filter actions
  setFilters: (filters: Partial<StockMovementFilters>) => void;
  setSearchQuery: (query: string) => void;
  clearFilters: () => void;

  // Pagination actions
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;

  // Sort actions
  setSorting: (sortBy: string, sortOrder: "asc" | "desc") => void;

  // Reset
  reset: () => void;
}

const initialState = {
  movements: [],
  currentMovement: null,
  dashboardSummary: null,
  productReport: null,
  isLoading: false,
  isCreating: false,
  isDeleting: false,
  isExporting: false,
  filters: {},
  searchQuery: "",
  pagination: {
    page: 1,
    limit: 10,
    totalPages: 1,
    totalItems: 0,
    hasNextPage: false,
    hasPrevPage: false,
  },
  sortBy: "createdAt",
  sortOrder: "desc" as const,
};

export const useStockMovementStore = create<StockMovementState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Fetch all movements with current filters, pagination, and sorting
      fetchMovements: async () => {
        set({ isLoading: true });
        try {
          const { filters, searchQuery, pagination, sortBy, sortOrder } = get();

          const response = await stockMovementService.getStockMovements({
            ...filters,
            search: searchQuery,
            page: pagination.page,
            limit: pagination.limit,
            sortBy,
            sortOrder,
          });

          set({
            movements: response.data,
            pagination: response.pagination,
            isLoading: false,
          });
        } catch (error) {
          console.error("Failed to fetch movements:", error);
          set({ isLoading: false });
          throw error;
        }
      },

      // Fetch single movement by ID
      fetchMovementById: async (id: string) => {
        set({ isLoading: true });
        try {
          const response = await stockMovementService.getStockMovementById(id);
          set({
            currentMovement: response.data,
            isLoading: false,
          });
        } catch (error) {
          console.error("Failed to fetch movement:", error);
          set({ isLoading: false });
          throw error;
        }
      },

      // Create Stock IN entry
      createStockIn: async (data: CreateStockMovementDTO) => {
        set({ isCreating: true });
        try {
          await stockMovementService.createStockIn(data);
          set({ isCreating: false });
          // Refresh the list
          await get().fetchMovements();
        } catch (error) {
          console.error("Failed to create stock IN:", error);
          set({ isCreating: false });
          throw error;
        }
      },

      // Create Stock OUT entry
      createStockOut: async (data: CreateStockMovementDTO) => {
        set({ isCreating: true });
        try {
          await stockMovementService.createStockOut(data);
          set({ isCreating: false });
          // Refresh the list
          await get().fetchMovements();
        } catch (error) {
          console.error("Failed to create stock OUT:", error);
          set({ isCreating: false });
          throw error;
        }
      },

      // Delete movement
      deleteMovement: async (id: string) => {
        set({ isDeleting: true });
        try {
          await stockMovementService.deleteStockMovement(id);
          set({ isDeleting: false });
          // Refresh the list
          await get().fetchMovements();
        } catch (error) {
          console.error("Failed to delete movement:", error);
          set({ isDeleting: false });
          throw error;
        }
      },

      // Fetch dashboard summary
      fetchDashboardSummary: async () => {
        set({ isLoading: true });
        try {
          const response = await stockMovementService.getDashboardSummary();
          set({
            dashboardSummary: response.data,
            isLoading: false,
          });
        } catch (error) {
          console.error("Failed to fetch dashboard summary:", error);
          set({ isLoading: false });
          throw error;
        }
      },

      // Fetch product report
      fetchProductReport: async (
        productId: string,
        startDate?: string,
        endDate?: string,
      ) => {
        set({ isLoading: true });
        try {
          const response = await stockMovementService.generateProductReport(
            productId,
            startDate,
            endDate,
          );
          set({
            productReport: response.data,
            isLoading: false,
          });
        } catch (error) {
          console.error("Failed to fetch product report:", error);
          set({ isLoading: false });
          throw error;
        }
      },

      // Export movements
      exportMovements: async (format: "csv" | "json") => {
        set({ isExporting: true });
        try {
          const { filters, searchQuery } = get();
          await stockMovementService.exportStockMovements({
            ...filters,
            search: searchQuery,
            format,
          });
          set({ isExporting: false });
        } catch (error) {
          console.error("Failed to export movements:", error);
          set({ isExporting: false });
          throw error;
        }
      },

      // Set filters
      setFilters: (newFilters: Partial<StockMovementFilters>) => {
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
          pagination: { ...state.pagination, page: 1 }, // Reset to first page
        }));
        // Auto-fetch with new filters
        get().fetchMovements();
      },

      // Set search query
      setSearchQuery: (query: string) => {
        set({
          searchQuery: query,
          pagination: { ...get().pagination, page: 1 }, // Reset to first page
        });
        // Auto-fetch with new search
        get().fetchMovements();
      },

      // Clear all filters
      clearFilters: () => {
        set({
          filters: {},
          searchQuery: "",
          pagination: { ...get().pagination, page: 1 },
        });
        // Auto-fetch
        get().fetchMovements();
      },

      // Set page
      setPage: (page: number) => {
        set((state) => ({
          pagination: { ...state.pagination, page },
        }));
        // Auto-fetch
        get().fetchMovements();
      },

      // Set limit
      setLimit: (limit: number) => {
        set((state) => ({
          pagination: { ...state.pagination, limit, page: 1 },
        }));
        // Auto-fetch
        get().fetchMovements();
      },

      // Set sorting
      setSorting: (sortBy: string, sortOrder: "asc" | "desc") => {
        set({ sortBy, sortOrder });
        // Auto-fetch with new sorting
        get().fetchMovements();
      },

      // Reset all state
      reset: () => {
        set(initialState);
      },
    }),
    { name: "StockMovementStore" },
  ),
);
