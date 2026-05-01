import adminApi from "@/lib/config";
import { authService } from "../authService";
import type {
  CreateRoomTypePayload,
  RoomType,
  RoomTypeStats,
} from "@/types/room-types";
import type { ApiResponse } from "@/lib/types";

class RoomTypeService {
  private baseUrl = "/roomType";

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

  async getAll(): Promise<RoomType[]> {
    const response = await adminApi.get<ApiResponse<RoomType[]>>(
      `${this.baseUrl}/room-types`,
      { headers: this.getHeaders() },
    );

    return response.data.data; // ✅ FIXED
  }

  async getById(id: string): Promise<RoomType> {
    // FIXED: Add organization ID to headers
    const response = await adminApi.get<ApiResponse<RoomType>>(
      `${this.baseUrl}/room-types/${id}`,
      {
        headers: this.getHeaders(),
      },
    );
    return response.data.data;
  }

  async create(data: CreateRoomTypePayload) {
    const response = await adminApi.post<ApiResponse<RoomType>>(
      `${this.baseUrl}/room-types`,
      data,
      {
        headers: this.getHeaders(),
      },
    );

    return response.data.data; // ✅ extract actual RoomType
  }

  // roomTypeService.ts
  async update(
    id: string,
    data: Partial<CreateRoomTypePayload>,
  ): Promise<RoomType> {
    const response = await adminApi.put<ApiResponse<RoomType>>( // ✅ Correct type
      `${this.baseUrl}/room-types/${id}`,
      data,
      { headers: this.getHeaders() },
    );
    return response.data.data; // ✅ Extract actual RoomType
  }
  async delete(id: string): Promise<void> {
    await adminApi.delete(`${this.baseUrl}/room-types/${id}`, {
      headers: this.getHeaders(),
    });
  }

  async getStats(): Promise<RoomTypeStats[]> {
    const response = await adminApi.get<ApiResponse<RoomTypeStats[]>>(
      `${this.baseUrl}/room-types/stats`,
      {
        headers: this.getHeaders(),
      },
    );
    return response.data.data;
  }
}

export const roomTypeService = new RoomTypeService();
