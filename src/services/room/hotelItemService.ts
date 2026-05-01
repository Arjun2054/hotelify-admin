import type {
  CreateHotelItemForm,
  HotelItem,
  HotelItemFilters,
  HotelStockMovement,
  InventorySummary,
  PaginatedItemResult,
  StockAdjustmentForm,
} from "@/types/room-types";
import { authService } from "../authService";
import adminApi from "@/lib/config";
import type { ApiResponse } from "@/lib/types";

function buildQuery(filters: HotelItemFilters = {}, page = 1, limit = 50) {
  const p = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (filters.categoryId) p.set("categoryId", filters.categoryId);
  if (filters.unitId) p.set("unitId", filters.unitId);
  if (filters.search) p.set("search", filters.search);
  if (filters.lowStock) p.set("lowStock", "true");
  if (filters.isActive !== undefined)
    p.set("isActive", String(filters.isActive));
  return p.toString();
}

class HotelItemService {
  private baseUrl = "/hotelItem";

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

  async getAll(filters?: HotelItemFilters, page = 1, limit = 50) {
    const response = await adminApi.get<
      ApiResponse<PaginatedItemResult<HotelItem>>
    >(`${this.baseUrl}/hotel-items?${buildQuery(filters, page, limit)}`, {
      headers: this.getHeaders(),
    });

    return response.data.data; // ✅ FIXED
  }

  async getById(id: string): Promise<HotelItem> {
    // FIXED: Add organization ID to headers
    const response = await adminApi.get<HotelItem>(
      `${this.baseUrl}/hotel-items/${id}`,
      {
        headers: this.getHeaders(),
      },
    );
    return response.data;
  }

  async create(data: CreateHotelItemForm) {
    const response = await adminApi.post<HotelItem>(
      `${this.baseUrl}/hotel-items`,
      data,
      {
        headers: this.getHeaders(),
      },
    );

    return response.data; // ✅ extract actual RoomType
  }

  async update(
    id: string,
    data: Partial<CreateHotelItemForm & { isActive: boolean }>,
  ): Promise<HotelItem> {
    // FIXED: Add organization ID to headers
    const response = await adminApi.put<HotelItem>(
      `${this.baseUrl}/hotel-items/${id}`,
      data,
      {
        headers: this.getHeaders(),
      },
    );
    return response.data;
  }
  async delete(id: string): Promise<void> {
    await adminApi.delete(`${this.baseUrl}/hotel-items/${id}`, {
      headers: this.getHeaders(),
    });
  }

  async getSummary(): Promise<InventorySummary> {
    const response = await adminApi.get<ApiResponse<InventorySummary>>(
      `${this.baseUrl}/hotel-items/summary`,
      {
        headers: this.getHeaders(),
      },
    );
    return response.data.data;
  }

  async adjustStock(id: string, data: StockAdjustmentForm) {
    const response = await adminApi.post<{
      item: HotelItem;
      movement: HotelStockMovement;
    }>(`${this.baseUrl}/hotel-items/${id}/stock-adjustment`, data, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async getMovements(itemId: string): Promise<HotelStockMovement[]> {
    const response = await adminApi.get<ApiResponse<HotelStockMovement[]>>(
      `/hotelMovement/stock-movements/item/${itemId}`,
      {
        headers: this.getHeaders(),
      },
    );
    return response.data.data;
  }

  async getAllMovements(filters?: { type?: string; hotelItemId?: string }) {
    const p = new URLSearchParams();
    if (filters?.type) p.set("type", filters.type);
    if (filters?.hotelItemId) p.set("hotelItemId", filters.hotelItemId);
    const response = await adminApi.get<ApiResponse<HotelStockMovement[]>>(
      `/hotelMovement/stock-movements?${p.toString()}`,
      { headers: this.getHeaders() },
    );
    return response.data.data;
  }

  async getMovementStats() {
    return adminApi.get<{
      byType: Record<string, { count: number; totalQty: number }>;
      totalPurchaseCost: number;
      periodDays: number;
    }>("/hotelMovement/stock-movements/stats", {
      headers: this.getHeaders(),
    });
  }
}

export const hotelItemService = new HotelItemService();
