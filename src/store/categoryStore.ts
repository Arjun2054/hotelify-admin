import type {
  Category,
  CategoryFilters,
  CreateCategoryDto,
  UpdateCategoryDto,
} from "@/lib/types";
import { categoryService } from "@/services/categoryService";
import { create } from "zustand";

interface CategoryStore {
  // state
  categories: Category[];
  selectedCategory: Category | null;
  loading: boolean;
  error: string | null;

  // Pagination
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;

  // Search Query
  searchQuery: string;

  //Actions
  fetchCategories: (filters?: CategoryFilters) => Promise<void>;
  fetchCategoryById: (id: string) => Promise<void>;
  createCategory: (data: CreateCategoryDto) => Promise<Category>;
  updateCategory: (id: string, data: UpdateCategoryDto) => Promise<Category>;
  deleteCategory: (id: string) => Promise<void>;

  //Pagination Actions
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;

  // Filter Actions
  setSearchQuery: (query: string) => void;

  // Utility Actions
  reset: () => void;
  clearError: () => void;
}

export const useCategoryStore = create<CategoryStore>((set, get) => ({
  // Initial State
  categories: [],
  selectedCategory: null,
  loading: false,
  error: null,
  currentPage: 1,
  pageSize: 10,
  totalItems: 0,
  totalPages: 0,
  searchQuery: "",

  // Fetch Categories
  fetchCategories: async (filters?: CategoryFilters) => {
    set({ loading: true, error: null });
    try {
      const { currentPage, pageSize, searchQuery } = get();

      const response = await categoryService.getCategories({
        page: filters?.page ?? currentPage,
        limit: filters?.limit ?? pageSize,
        search: filters?.search ?? searchQuery,
        ...filters,
      });

      set({
        categories: response.data,
        totalItems: response.pagination.total,
        totalPages: response.pagination.totalPages,
        currentPage: response.pagination.page,
        loading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch categories",
        loading: false,
      });
    }
  },

  // Fetch Category by ID
  fetchCategoryById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const category = await categoryService.getCategoryById(id);
      set({ selectedCategory: category, loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch category",
        loading: false,
      });
    }
  },

  // Create Category
  createCategory: async (data: CreateCategoryDto) => {
    set({ loading: true, error: null });
    try {
      const category = await categoryService.createCategory(data);
      await get().fetchCategories();
      set({ loading: false });
      return category;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to create category",
        loading: false,
      });
      throw error;
    }
  },

  // Update Category
  updateCategory: async (id: string, data: UpdateCategoryDto) => {
    set({ loading: true, error: null });
    try {
      const category = await categoryService.updateCategory(id, data);
      await get().fetchCategories();
      set({ loading: false });
      return category;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to update category",
        loading: false,
      });
      throw error;
    }
  },

  // Delete Category
  deleteCategory: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await categoryService.deleteCategory(id);
      await get().fetchCategories();
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to delete category",
        loading: false,
      });
      throw error;
    }
  },

  // Set Page
  setPage: (page: number) => {
    set({ currentPage: page });
    get().fetchCategories({ page });
  },

  // Set Page Size
  setPageSize: (size: number) => {
    set({ pageSize: size, currentPage: 1 });
    get().fetchCategories({ limit: size, page: 1 });
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
      categories: [],
      selectedCategory: null,
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
