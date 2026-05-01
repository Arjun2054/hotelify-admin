import { create } from "zustand";
import { supplierService } from "../services/supplierService";
import type {
  CreateSupplierDto,
  Supplier,
  SupplierFilters,
  UpdateSupplierDto,
} from "@/lib/types";

interface SupplierStore {
  // State
  suppliers: Supplier[];
  selectedSupplier: Supplier | null;
  loading: boolean;
  error: string | null;

  // Pagination
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;

  // Filters
  searchQuery: string;

  // Actions
  fetchSuppliers: (filters?: SupplierFilters) => Promise<void>;
  fetchSupplierById: (id: string) => Promise<void>;
  createSupplier: (data: CreateSupplierDto) => Promise<Supplier>;
  updateSupplier: (id: string, data: UpdateSupplierDto) => Promise<Supplier>;
  deleteSupplier: (id: string) => Promise<void>;

  // Pagination Actions
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;

  // Filter Actions
  setSearchQuery: (query: string) => void;

  // Utility
  reset: () => void;
  clearError: () => void;
}

export const useSupplierStore = create<SupplierStore>((set, get) => ({
  // Initial State
  suppliers: [],
  selectedSupplier: null,
  loading: false,
  error: null,
  currentPage: 1,
  pageSize: 10,
  totalItems: 0,
  totalPages: 0,
  searchQuery: "",

  // Fetch Suppliers
  fetchSuppliers: async (filters?: SupplierFilters) => {
    set({ loading: true, error: null });
    try {
      const { currentPage, pageSize, searchQuery } = get();

      const response = await supplierService.getSuppliers({
        page: filters?.page ?? currentPage,
        limit: filters?.limit ?? pageSize,
        search: filters?.search ?? searchQuery,
        ...filters,
      });

      set({
        suppliers: response.data,
        totalItems: response.pagination.total,
        totalPages: response.pagination.totalPages,
        currentPage: response.pagination.page,
        loading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch suppliers",
        loading: false,
      });
    }
  },

  // Fetch Supplier by ID
  fetchSupplierById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const supplier = await supplierService.getSupplierById(id);
      set({ selectedSupplier: supplier, loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch supplier",
        loading: false,
      });
    }
  },

  // Create Supplier
  createSupplier: async (data: CreateSupplierDto) => {
    set({ loading: true, error: null });
    try {
      const supplier = await supplierService.createSupplier(data);
      await get().fetchSuppliers();
      set({ loading: false });
      return supplier;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to create supplier",
        loading: false,
      });
      throw error;
    }
  },

  // Update Supplier
  updateSupplier: async (id: string, data: UpdateSupplierDto) => {
    set({ loading: true, error: null });
    try {
      const supplier = await supplierService.updateSupplier(id, data);
      await get().fetchSuppliers();
      set({ loading: false });
      return supplier;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to update supplier",
        loading: false,
      });
      throw error;
    }
  },

  // Delete Supplier
  deleteSupplier: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await supplierService.deleteSupplier(id);
      await get().fetchSuppliers();
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to delete supplier",
        loading: false,
      });
      throw error;
    }
  },

  // Set Page
  setPage: (page: number) => {
    set({ currentPage: page });
    get().fetchSuppliers({ page });
  },

  // Set Page Size
  setPageSize: (size: number) => {
    set({ pageSize: size, currentPage: 1 });
    get().fetchSuppliers({ limit: size, page: 1 });
  },

  // Set Search Query
  setSearchQuery: (query: string) => {
    set({ searchQuery: query, currentPage: 1 });
  },

  // Clear Error
  clearError: () => set({ error: null }),

  // Reset
  reset: () => {
    set({
      suppliers: [],
      selectedSupplier: null,
      loading: false,
      error: null,
      currentPage: 1,
      pageSize: 10,
      totalItems: 0,
      totalPages: 0,
      searchQuery: "",
    });
  },
}));
