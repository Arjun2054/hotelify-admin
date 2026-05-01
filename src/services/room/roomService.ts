import adminApi from "@/lib/config";
import { authService } from "../authService";
import type {
  CreateRoomPayload,
  Room,
  RoomFilters,
  RoomStats,
  RoomStatus,
} from "@/types/room-types";
import type { ApiResponse, PaginatedResponseApi } from "@/lib/types";
import type { AddRoomItemPayload, RoomItem } from "@/types/hotelItem-types";

class RoomService {
  private baseUrl = "/room";

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

  async getAll(filters?: RoomFilters, page = 1, pageSize = 50) {
    const params = new URLSearchParams();
    if (filters?.status) params.set("status", filters.status);
    if (filters?.roomTypeId) params.set("roomTypeId", filters.roomTypeId);
    if (filters?.floor !== undefined && filters.floor !== "")
      params.set("floor", String(filters.floor));
    if (filters?.search) params.set("search", filters.search);
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    const response = await adminApi.get<PaginatedResponseApi<Room>>(
      `${this.baseUrl}?${params.toString()}`,
      { headers: this.getHeaders() },
    );

    return {
      data: response.data.data,
      meta: response.data.meta,
    };
  }

  async getById(id: string): Promise<Room> {
    // FIXED: Add organization ID to headers
    const response = await adminApi.get<ApiResponse<Room>>(
      `${this.baseUrl}/${id}`,
      {
        headers: this.getHeaders(),
      },
    );
    return response.data.data;
  }

  async create(data: CreateRoomPayload) {
    const response = await adminApi.post<ApiResponse<Room>>(
      `${this.baseUrl}`,
      data,
      {
        headers: this.getHeaders(),
      },
    );

    return response.data.data; // ✅ extract actual RoomType
  }

  async update(id: string, data: Partial<CreateRoomPayload>): Promise<Room> {
    const response = await adminApi.put<ApiResponse<Room>>(
      `${this.baseUrl}/${id}`,
      data,
      { headers: this.getHeaders() },
    );
    return response.data.data; // ✅ Extract actual RoomType
  }

  async updateStatus(id: string, status: RoomStatus): Promise<Room> {
    const response = await adminApi.patch<ApiResponse<Room>>(
      `${this.baseUrl}/${id}/status`,
      { status },
      { headers: this.getHeaders() },
    );
    return response.data.data; // ✅ Extract actual RoomType
  }
  async delete(id: string): Promise<void> {
    await adminApi.delete(`${this.baseUrl}/${id}`, {
      headers: this.getHeaders(),
    });
  }

  async getStats() {
    const response = await adminApi.get<ApiResponse<RoomStats>>(
      `${this.baseUrl}/stats`,
      {
        headers: this.getHeaders(),
      },
    );
    return response.data.data;
  }
  async getFloors() {
    const response = await adminApi.get<ApiResponse<number[]>>(
      `${this.baseUrl}/floors`,
      {
        headers: this.getHeaders(),
      },
    );
    return response.data.data;
  }

  async addRoomItem(
    roomId: string,
    data: AddRoomItemPayload,
  ): Promise<RoomItem> {
    const response = await adminApi.post<ApiResponse<RoomItem>>(
      `${this.baseUrl}/${roomId}/items`,
      data,
      { headers: this.getHeaders() },
    );
    return response.data.data;
  }

  async removeRoomItem(roomItemId: string): Promise<void> {
    await adminApi.delete(`${this.baseUrl}/room-items/${roomItemId}`, {
      headers: this.getHeaders(),
    });
  }
}

export const roomService = new RoomService();
