import type {
  CreateStockMovementPayload,
  ItemMovementSummary,
  StockMovement,
  StockMovementFilters,
} from "@/types/hotelItem-types";
import { authService } from "../authService";
import adminApi from "@/lib/config";
import type { ApiResponse, PaginatedResponseApi } from "@/lib/types"; // ApiResponse still used by other methods

class HotelStockMovementApi {
  private baseUrl = "/updateshotelMovement";

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

  async getAll(filters?: StockMovementFilters, page = 1, pageSize = 25) {
    const params = new URLSearchParams();
    if (filters?.hotelItemId) params.set("hotelItemId", filters.hotelItemId);
    if (filters?.type) params.set("type", filters.type);
    if (filters?.dateFrom) params.set("dateFrom", filters.dateFrom);
    if (filters?.dateTo) params.set("dateTo", filters.dateTo);
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));

    const response = await adminApi.get<PaginatedResponseApi<StockMovement>>(
      `${this.baseUrl}?${params}`,
      { headers: this.getHeaders() },
    );

    return response.data;
  }

  async getById(id: string) {
    const response = await adminApi.get<ApiResponse<StockMovement>>(
      `${this.baseUrl}/${id}`,
      { headers: this.getHeaders() },
    );
    return response.data.data;
  }

  async create(data: CreateStockMovementPayload) {
    const response = await adminApi.post<ApiResponse<StockMovement>>(
      `${this.baseUrl}`,
      data,
      { headers: this.getHeaders() },
    );
    return response.data.data;
  }

  async bulkStockIn(
    items: { hotelItemId: string; quantity: number; unitCost?: number }[],
    userId: string,
    referenceId?: string,
    notes?: string,
  ) {
    const response = await adminApi.post<ApiResponse<StockMovement[]>>(
      `${this.baseUrl}/bulk`,
      {
        items,
        userId,
        referenceId,
        notes,
      },
      { headers: this.getHeaders() },
    );
    return response.data.data;
  }

  async getItemSummary(itemId: string) {
    const response = await adminApi.get<ApiResponse<ItemMovementSummary>>(
      `${this.baseUrl}/item/${itemId}/summary`,
      { headers: this.getHeaders() },
    );
    return response.data.data;
  }
}

export const hotelStockMovementApi = new HotelStockMovementApi();
