import { create } from "zustand";
import { salesService } from "../services/salesService";
import type {
  CreateSaleDto,
  Sale,
  SalesFilters,
  SalesReport,
} from "@/lib/types";

interface SalesStore {
  sales: Sale[];
  selectedSale: Sale | null;
  report: SalesReport | null;
  loading: boolean;
  error: string | null;

  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;

  filters: SalesFilters;

  fetchSales: (filters?: SalesFilters) => Promise<void>;
  fetchSaleById: (id: string) => Promise<void>;
  createSale: (data: CreateSaleDto) => Promise<Sale>;
  updateSale: (id: string, data: Partial<CreateSaleDto>) => Promise<Sale>;
  cancelSale: (id: string, reason?: string) => Promise<void>;
  refundSale: (id: string, amount?: number, reason?: string) => Promise<void>;
  fetchReport: (filters?: SalesFilters) => Promise<void>;
  exportSales: (filters?: SalesFilters) => Promise<void>;

  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setFilters: (filters: SalesFilters) => void;
  clearFilters: () => void;
  clearError: () => void;
  reset: () => void;
}

export const useSalesStore = create<SalesStore>((set, get) => ({
  sales: [],
  selectedSale: null,
  report: null,
  loading: false,
  error: null,
  currentPage: 1,
  pageSize: 10,
  totalItems: 0,
  totalPages: 0,
  filters: {},

  fetchSales: async (filters?: SalesFilters) => {
    set({ loading: true, error: null });
    try {
      const { currentPage, pageSize, filters: currentFilters } = get();

      const response = await salesService.getSales({
        page: filters?.page ?? currentPage,
        limit: filters?.limit ?? pageSize,
        ...currentFilters,
        ...filters,
      });

      set({
        sales: response.data,
        totalItems: response.pagination.total,
        totalPages: response.pagination.totalPages,
        currentPage: response.pagination.page,
        loading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch sales",
        loading: false,
      });
    }
  },

  fetchSaleById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const sale = await salesService.getSaleById(id);
      set({ selectedSale: sale, loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch sale",
        loading: false,
      });
    }
  },

  createSale: async (data: CreateSaleDto) => {
    set({ loading: true, error: null });
    try {
      const sale = await salesService.createSale(data);
      await get().fetchSales();
      set({ loading: false });
      return sale;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to create sale",
        loading: false,
      });
      throw error;
    }
  },

  updateSale: async (id: string, data: Partial<CreateSaleDto>) => {
    set({ loading: true, error: null });
    try {
      const sale = await salesService.updateSale(id, data);
      await get().fetchSales();
      set({ loading: false });
      return sale;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to update sale",
        loading: false,
      });
      throw error;
    }
  },

  cancelSale: async (id: string, reason?: string) => {
    set({ loading: true, error: null });
    try {
      await salesService.cancelSale(id, reason);
      await get().fetchSales();
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to cancel sale",
        loading: false,
      });
      throw error;
    }
  },

  refundSale: async (id: string, amount?: number, reason?: string) => {
    set({ loading: true, error: null });
    try {
      await salesService.refundSale(id, amount, reason);
      await get().fetchSales();
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to refund sale",
        loading: false,
      });
      throw error;
    }
  },

  fetchReport: async (filters?: SalesFilters) => {
    set({ loading: true, error: null });
    try {
      const report = await salesService.getSalesReport(filters);
      set({ report, loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch report",
        loading: false,
      });
    }
  },

  exportSales: async (filters?: SalesFilters) => {
    set({ loading: true, error: null });
    try {
      const blob = await salesService.exportSales(filters);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `sales-report-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to export sales",
        loading: false,
      });
      throw error;
    }
  },

  setPage: (page: number) => {
    set({ currentPage: page });
    get().fetchSales({ page });
  },

  setPageSize: (size: number) => {
    set({ pageSize: size, currentPage: 1 });
    get().fetchSales({ limit: size, page: 1 });
  },

  setFilters: (filters: SalesFilters) => {
    set({ filters, currentPage: 1 });
    get().fetchSales({ ...filters, page: 1 });
  },

  clearFilters: () => {
    set({ filters: {}, currentPage: 1 });
    get().fetchSales({ page: 1 });
  },

  clearError: () => set({ error: null }),

  reset: () => {
    set({
      sales: [],
      selectedSale: null,
      report: null,
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
