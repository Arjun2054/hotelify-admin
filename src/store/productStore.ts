import type { Product, ProductFilters } from "@/lib/types";
import { productService } from "@/services/productService";
import { create } from "zustand";

interface ProductState {
  // State
  products: Product[];
  selectedProduct: Product | null;
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
  fetchProducts: (filters?: ProductFilters) => Promise<void>;
  fetchProductById: (id: string) => Promise<void>;
  createProduct: (data: any) => Promise<Product>;
  updateProduct: (id: string, data: any) => Promise<Product>;
  deleteProduct: (id: string) => Promise<void>;

  // Pagination Actions
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;

  // Filter Actions
  setSearchQuery: (query: string) => void;

  // Utility
  reset: () => void;
}

export const useProductStore = create<ProductState>((set, get) => ({
  // Initial State
  products: [],
  selectedProduct: null,
  loading: false,
  error: null,
  currentPage: 1,
  pageSize: 10,
  totalItems: 0,
  totalPages: 0,
  searchQuery: "",

  // Fetch Products
  fetchProducts: async (filters?: ProductFilters) => {
    set({ loading: true, error: null });
    try {
      const { currentPage, pageSize, searchQuery } = get();

      const response = await productService.getProducts({
        page: filters?.page ?? currentPage,
        limit: filters?.limit ?? pageSize,
        search: filters?.search ?? searchQuery,
        ...filters,
      });

      set({
        products: response.data,
        totalItems: response.pagination.total,
        totalPages: response.pagination.totalPages,
        currentPage: response.pagination.page,
        loading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch products",
        loading: false,
      });
    }
  },

  // Fetch Product by ID
  fetchProductById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const product = await productService.getProductById(id);
      set({ selectedProduct: product, loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch product",
        loading: false,
      });
    }
  },

  // Create Product
  createProduct: async (data: any) => {
    set({ loading: true, error: null });
    try {
      const product = await productService.createProduct(data);
      await get().fetchProducts(); // Refresh list
      set({ loading: false });
      return product;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to create product",
        loading: false,
      });
      throw error;
    }
  },

  // Update Product
  updateProduct: async (id: string, data: any) => {
    set({ loading: true, error: null });
    try {
      const product = await productService.updateProduct(id, data);
      await get().fetchProducts(); // Refresh list
      set({ loading: false });
      return product;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to update product",
        loading: false,
      });
      throw error;
    }
  },

  // Delete Product
  deleteProduct: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await productService.deleteProduct(id);
      await get().fetchProducts(); // Refresh list
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to delete product",
        loading: false,
      });
      throw error;
    }
  },

  // Set Page
  setPage: (page: number) => {
    set({ currentPage: page });
    get().fetchProducts({ page });
  },

  // Set Page Size
  setPageSize: (size: number) => {
    set({ pageSize: size, currentPage: 1 });
    get().fetchProducts({ limit: size, page: 1 });
  },

  // Set Search Query
  setSearchQuery: (query: string) => {
    set({ searchQuery: query, currentPage: 1 });
    // Note: Debouncing should be handled in the component
  },

  // Reset
  reset: () => {
    set({
      products: [],
      selectedProduct: null,
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
