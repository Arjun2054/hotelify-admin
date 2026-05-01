// ============================================================================
// CATEGORY SERVICE
// ============================================================================

import adminApi from "@/lib/config";
import type {
  Category,
  CategoryFilters,
  CreateCategoryDto,
  PaginatedResponse,
  UpdateCategoryDto,
} from "@/lib/types";
import { authService } from "./authService";

class CategoryService {
  private baseUrl = "/category";

  /**
   * Get organization ID from storage or context
   * This should be called before each API request
   */
  private getOrganizationId(): string {
    // FIXED: Get organization ID from localStorage or your auth context
    const orgId = authService.getActiveOrganizationId();
    if (!orgId) {
      throw new Error(
        "Organization context not found. Please select an organization.",
      );
    }
    return orgId;
  }

  /**
   * Get headers with organization context
   */
  private getHeaders() {
    return {
      "X-Organization-Id": this.getOrganizationId(),
    };
  }

  async getCategories(
    filters: CategoryFilters = {},
  ): Promise<PaginatedResponse<Category>> {
    const { page = 1, limit = 10, search } = filters;

    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (search) params.append("search", search);

    // FIXED: Add organization ID to headers
    const response = await adminApi.get<Category[]>(
      `${this.baseUrl}/getall?${params.toString()}`,
      {
        headers: this.getHeaders(),
      },
    );

    // Transform backend response to match pagination format
    return {
      data: response.data,
      pagination: {
        page,
        limit,
        total: response.data.length,
        totalPages: Math.ceil(response.data.length / limit),
      },
    };
  }

  async getCategoryById(id: string): Promise<Category> {
    // FIXED: Add organization ID to headers
    const response = await adminApi.get<Category>(`${this.baseUrl}/${id}`, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async createCategory(data: CreateCategoryDto): Promise<Category> {
    // FIXED: Add organization ID to headers
    const response = await adminApi.post<Category>(
      `${this.baseUrl}/create`,
      data,
      {
        headers: this.getHeaders(),
      },
    );
    return response.data;
  }

  async updateCategory(id: string, data: UpdateCategoryDto): Promise<Category> {
    // FIXED: Add organization ID to headers
    const response = await adminApi.post<Category>(
      `${this.baseUrl}/update/${id}`,
      data,
      {
        headers: this.getHeaders(),
      },
    );
    return response.data;
  }

  async deleteCategory(id: string): Promise<void> {
    // FIXED: Add organization ID to headers
    await adminApi.post(`${this.baseUrl}/delete/${id}`, {
      headers: this.getHeaders(),
    });
  }
}

export const categoryService = new CategoryService();
