import adminApi from "@/lib/config";
import { authService } from "../authService";
import type {
  BatchCreateTasksPayload,
  CompleteTaskPayload,
  CreateHousekeepingTaskPayload,
  HousekeepingBoardColumn,
  HousekeepingFilters,
  HousekeepingStats,
  HousekeepingTask,
  InspectTaskPayload,
  ItemUsageReport,
  RecordItemUsedPayload,
  RoomItemStandard,
} from "@/types/houseKeeping-types";
import type { ApiResponse, PaginatedResponseApi } from "@/lib/types";

class HousekeepingService {
  private baseUrl = "/housekeeping";

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

  async getAll(filters?: HousekeepingFilters, page = 1, pageSize = 25) {
    const params = new URLSearchParams();
    if (filters?.status) params.set("status", filters.status);
    if (filters?.roomId) params.set("roomId", filters.roomId);
    if (filters?.userId) params.set("userId", filters.userId);
    if (filters?.dateFrom) params.set("dateFrom", filters.dateFrom);
    if (filters?.dateTo) params.set("dateTo", filters.dateTo);
    if (filters?.floor !== undefined && filters.floor !== "")
      params.set("floor", String(filters.floor));
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    const response = await adminApi.get<PaginatedResponseApi<HousekeepingTask>>(
      `${this.baseUrl}?${params.toString()}`,
      { headers: this.getHeaders() },
    );

    return {
      data: response.data.data,
      meta: response.data.meta,
    };
  }

  async getById(id: string) {
    const response = await adminApi.get<ApiResponse<HousekeepingTask>>(
      `${this.baseUrl}/${id}`,
      {
        headers: this.getHeaders(),
      },
    );
    return response.data.data;
  }

  async create(data: CreateHousekeepingTaskPayload) {
    const response = await adminApi.post<ApiResponse<HousekeepingTask>>(
      `${this.baseUrl}`,
      data,
      {
        headers: this.getHeaders(),
      },
    );

    return response.data.data;
  }

  async batchCreate(data: BatchCreateTasksPayload) {
    const response = await adminApi.post<
      ApiResponse<{
        created: HousekeepingTask[];
        errors: { roomId: string; error: string }[];
      }>
    >(`${this.baseUrl}/batch`, data, {
      headers: this.getHeaders(),
    });

    return response.data.data;
  }

  async update(id: string, data: Partial<CreateHousekeepingTaskPayload>) {
    const response = await adminApi.put<ApiResponse<HousekeepingTask>>(
      `${this.baseUrl}/${id}`,
      data,
      {
        headers: this.getHeaders(),
      },
    );

    return response.data.data;
  }

  async cancel(id: string) {
    const response = await adminApi.delete(`${this.baseUrl}/${id}`, {
      headers: this.getHeaders(),
    });

    return response.data;
  }

  // ── Workflow ──────────────────────────────────────────
  async start(id: string) {
    const response = await adminApi.patch<ApiResponse<HousekeepingTask>>(
      `${this.baseUrl}/${id}/start`,
      {},
      {
        headers: this.getHeaders(),
      },
    );

    return response.data.data;
  }

  async complete(id: string, data: CompleteTaskPayload) {
    const response = await adminApi.patch<ApiResponse<HousekeepingTask>>(
      `${this.baseUrl}/${id}/complete`,
      data,
      {
        headers: this.getHeaders(),
      },
    );

    return response.data.data;
  }

  async inspect(id: string, data: InspectTaskPayload) {
    const response = await adminApi.patch<
      ApiResponse<{
        task: HousekeepingTask;
        approved: boolean;
        roomStatus: string;
      }>
    >(`${this.baseUrl}/${id}/inspect`, data, {
      headers: this.getHeaders(),
    });

    return response.data.data;
  }

  // ── Items ─────────────────────────────────────────────
  async recordItems(taskId: string, items: RecordItemUsedPayload[]) {
    const response = await adminApi.post(
      `${this.baseUrl}/${taskId}/items`,
      { items },
      {
        headers: this.getHeaders(),
      },
    );

    return response.data.data;
  }

  async getStandardItems(taskId: string) {
    const response = await adminApi.get<ApiResponse<RoomItemStandard[]>>(
      `${this.baseUrl}/${taskId}/standard-items`,
      {
        headers: this.getHeaders(),
      },
    );

    return response.data.data;
  }

  // ── Board & Stats ─────────────────────────────────────
  async getBoard(date?: string) {
    const params = date ? `?date=${date}` : "";
    const response = await adminApi.get<ApiResponse<HousekeepingBoardColumn[]>>(
      `${this.baseUrl}/board${params}`,
      {
        headers: this.getHeaders(),
      },
    );

    return response.data.data;
  }

  async getStats(date?: string) {
    const params = date ? `?date=${date}` : "";
    const response = await adminApi.get<ApiResponse<HousekeepingStats>>(
      `${this.baseUrl}/stats${params}`,
      {
        headers: this.getHeaders(),
      },
    );

    return response.data.data;
  }

  async getRoomTasks(roomId: string, page = 1) {
    const response = await adminApi.get<PaginatedResponseApi<HousekeepingTask>>(
      `${this.baseUrl}/room/${roomId}?page=${page}`,
      {
        headers: this.getHeaders(),
      },
    );

    return response.data.data;
  }

  async getItemUsage(dateFrom?: string, dateTo?: string) {
    const params = new URLSearchParams();
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    const response = await adminApi.get<ApiResponse<ItemUsageReport[]>>(
      `${this.baseUrl}/item-usage?${params.toString()}`,
      {
        headers: this.getHeaders(),
      },
    );
    return response.data.data;
  }
}

export const housekeepingService = new HousekeepingService();
