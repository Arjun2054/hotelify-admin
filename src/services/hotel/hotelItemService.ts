import type {
  CreateHotelItemPayload,
  HotelItem,
  HotelItemFilters,
  HotelItemStats,
  UpdateHotelItemPayload,
} from "@/types/hotelItem-types";
import { authService } from "../authService";
import adminApi from "@/lib/config";
import type { ApiResponse, PaginatedResponseApi } from "@/lib/types"; // ApiResponse still used by other methods

class HotelItemApi {
  private baseUrl = "/updateshotelItem";

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

  async getAll(filters?: HotelItemFilters, page = 1, pageSize = 25) {
    const params = new URLSearchParams();
    if (filters?.categoryId) params.set("categoryId", filters.categoryId);
    if (filters?.supplierId) params.set("supplierId", filters.supplierId);
    if (filters?.isActive !== undefined && filters.isActive !== "")
      params.set("isActive", String(filters.isActive));
    if (filters?.lowStock) params.set("lowStock", "true");
    if (filters?.search) params.set("search", filters.search);
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));

    const response = await adminApi.get<PaginatedResponseApi<HotelItem>>(
      `${this.baseUrl}?${params}`,
      { headers: this.getHeaders() },
    );

    return response.data;
  }

  async getById(id: string) {
    const response = await adminApi.get<ApiResponse<HotelItem>>(
      `${this.baseUrl}/${id}`,
      { headers: this.getHeaders() },
    );
    return response.data.data;
  }

  async create(data: CreateHotelItemPayload) {
    const response = await adminApi.post<ApiResponse<HotelItem>>(
      this.baseUrl,
      data,
      { headers: this.getHeaders() },
    );
    return response.data.data;
  }

  async update(id: string, data: UpdateHotelItemPayload) {
    const response = await adminApi.put<ApiResponse<HotelItem>>(
      `${this.baseUrl}/${id}`,
      data,
      { headers: this.getHeaders() },
    );
    return response.data.data;
  }

  async delete(id: string) {
    const response = await adminApi.delete<ApiResponse<HotelItem>>(
      `${this.baseUrl}/${id}`,
      { headers: this.getHeaders() },
    );
    return response.data.data;
  }

  async toogleActive(id: string) {
    const response = await adminApi.patch<ApiResponse<HotelItem>>(
      `${this.baseUrl}/${id}/toggle-active`,
      { headers: this.getHeaders() },
    );
    return response.data.data;
  }

  async getStats() {
    const response = await adminApi.get<ApiResponse<HotelItemStats>>(
      `${this.baseUrl}/stats`,
      { headers: this.getHeaders() },
    );
    return response.data.data;
  }

  async getLowStock() {
    const response = await adminApi.get<ApiResponse<HotelItem[]>>(
      `${this.baseUrl}/low-stock`,
      { headers: this.getHeaders() },
    );
    return response.data.data;
  }
}

export const hotelItemApi = new HotelItemApi();
