// services/hotel/inventoryAnalyticsService.ts
import adminApi from "@/lib/config";
import { authService } from "../authService";
import type { ApiResponse } from "@/lib/types";
import type {
  FullInventoryAnalytics,
  InventoryAnalyticsFilter,
  InventoryDashboardStats,
  LowStockAlertsResponse,
  MostUsedItem,
  MovementTrend,
  SupplierSpending,
} from "@/types/inventory-analytics-types";

class InventoryAnalyticsService {
  private baseUrl = "/hotelInventoryAnalytics";

  private getHeaders() {
    const orgId = authService.getActiveOrganizationId();
    if (!orgId) throw new Error("Organization context not found.");
    return { "X-Organization-Id": orgId };
  }

  private buildParams(filters?: InventoryAnalyticsFilter): URLSearchParams {
    const p = new URLSearchParams();
    if (filters?.startDate) p.set("startDate", filters.startDate.toISOString());
    if (filters?.endDate) p.set("endDate", filters.endDate.toISOString());
    if (filters?.categoryId) p.set("categoryId", filters.categoryId);
    if (filters?.supplierId) p.set("supplierId", filters.supplierId);
    return p;
  }

  async getDashboard(): Promise<InventoryDashboardStats> {
    const res = await adminApi.get<ApiResponse<InventoryDashboardStats>>(
      `${this.baseUrl}/dashboard`,
      { headers: this.getHeaders() },
    );
    return res.data.data;
  }

  async getFullAnalytics(
    filters?: InventoryAnalyticsFilter,
  ): Promise<FullInventoryAnalytics> {
    const params = this.buildParams(filters);
    const res = await adminApi.get<ApiResponse<FullInventoryAnalytics>>(
      `${this.baseUrl}/full?${params}`,
      { headers: this.getHeaders() },
    );
    return res.data.data;
  }

  async getMostUsedItems(
    filters?: InventoryAnalyticsFilter,
    limit = 10,
  ): Promise<MostUsedItem[]> {
    const params = this.buildParams(filters);
    params.set("limit", String(limit));
    const res = await adminApi.get<ApiResponse<MostUsedItem[]>>(
      `${this.baseUrl}/most-used?${params}`,
      { headers: this.getHeaders() },
    );
    return res.data.data;
  }

  async getMovementTrends(
    year?: number,
    categoryId?: string,
  ): Promise<MovementTrend[]> {
    const p = new URLSearchParams();
    if (year) p.set("year", String(year));
    if (categoryId) p.set("categoryId", categoryId);
    const res = await adminApi.get<ApiResponse<MovementTrend[]>>(
      `${this.baseUrl}/movement-trends?${p}`,
      { headers: this.getHeaders() },
    );
    return res.data.data;
  }

  async getLowStockAlerts(): Promise<LowStockAlertsResponse> {
    const res = await adminApi.get<ApiResponse<LowStockAlertsResponse>>(
      `${this.baseUrl}/low-stock-alerts`,
      { headers: this.getHeaders() },
    );
    return res.data.data;
  }

  async getSupplierSpending(
    filters?: InventoryAnalyticsFilter,
  ): Promise<SupplierSpending[]> {
    const params = this.buildParams(filters);
    const res = await adminApi.get<ApiResponse<SupplierSpending[]>>(
      `${this.baseUrl}/supplier-spending?${params}`,
      { headers: this.getHeaders() },
    );
    return res.data.data;
  }
}

export const inventoryAnalyticsService = new InventoryAnalyticsService();
