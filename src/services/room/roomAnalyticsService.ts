// services/room/roomAnalyticsService.ts
import adminApi from "@/lib/config";
import { authService } from "../authService";
import type { ApiResponse } from "@/lib/types";
import type {
  AnalyticsFilter,
  DashboardStats,
  MonthlyTrend,
  RoomAnalyticsResponse,
  RoomPerformanceMetric,
  YearlyRevenue,
} from "@/types/room-analytics";
class RoomAnalyticsService {
  private baseUrl = "/roomAnalytics";

  private getHeaders() {
    const orgId = authService.getActiveOrganizationId();
    if (!orgId) throw new Error("Organization context not found.");
    return { "X-Organization-Id": orgId };
  }

  private buildFilterParams(filters?: AnalyticsFilter): URLSearchParams {
    const params = new URLSearchParams();
    if (filters?.startDate)
      params.set("startDate", filters.startDate.toISOString());
    if (filters?.endDate) params.set("endDate", filters.endDate.toISOString());
    if (filters?.roomTypeId) params.set("roomTypeId", filters.roomTypeId);
    if (filters?.floor !== undefined)
      params.set("floor", String(filters.floor));
    return params;
  }

  async getDashboard(): Promise<DashboardStats> {
    const res = await adminApi.get<ApiResponse<DashboardStats>>(
      `${this.baseUrl}/dashboard`,
      { headers: this.getHeaders() },
    );
    return res.data.data;
  }

  async getFullAnalytics(
    filters?: AnalyticsFilter,
  ): Promise<RoomAnalyticsResponse> {
    const params = this.buildFilterParams(filters);
    const res = await adminApi.get<ApiResponse<RoomAnalyticsResponse>>(
      `${this.baseUrl}/full?${params.toString()}`,
      { headers: this.getHeaders() },
    );
    return res.data.data;
  }

  async getMonthlyTrends(year?: number): Promise<MonthlyTrend[]> {
    const params = new URLSearchParams();
    if (year) params.set("year", String(year));
    const res = await adminApi.get<ApiResponse<MonthlyTrend[]>>(
      `${this.baseUrl}/monthly-trends?${params.toString()}`,
      { headers: this.getHeaders() },
    );
    return res.data.data;
  }

  async getYearlyRevenue(): Promise<YearlyRevenue[]> {
    const res = await adminApi.get<ApiResponse<YearlyRevenue[]>>(
      `${this.baseUrl}/yearly-revenue`,
      { headers: this.getHeaders() },
    );
    return res.data.data;
  }

  async getRoomPerformance(
    filters?: AnalyticsFilter,
  ): Promise<RoomPerformanceMetric[]> {
    const params = this.buildFilterParams(filters);
    const res = await adminApi.get<ApiResponse<RoomPerformanceMetric[]>>(
      `${this.baseUrl}/room-performance?${params.toString()}`,
      { headers: this.getHeaders() },
    );
    return res.data.data;
  }
}

export const roomAnalyticsService = new RoomAnalyticsService();
