import adminApi from "@/lib/config";
import { authService } from "../authService";
import type { ApiResponse, PaginatedResponseApi } from "@/lib/types";
import type { CheckInPayload, RoomAssignment } from "@/types/room-types";

class RoomAssignmentService {
  private baseUrl = "/roomAssignment";

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

  async checkIn(roomId: string, data: CheckInPayload): Promise<RoomAssignment> {
    const response = await adminApi.post<ApiResponse<RoomAssignment>>(
      `${this.baseUrl}/${roomId}/check-in`,
      data,
      {
        headers: this.getHeaders(),
      },
    );

    return response.data.data;
  }

  async checkOut(
    assignmentId: string,
    notes?: string,
  ): Promise<RoomAssignment> {
    // FIXED: Add organization ID to headers
    const response = await adminApi.patch<ApiResponse<RoomAssignment>>(
      `${this.baseUrl}/${assignmentId}/check-out`,
      { notes },
      {
        headers: this.getHeaders(),
      },
    );
    return response.data.data;
  }
  async getHistory(roomId: string, page = 1) {
    const response = await adminApi.get<PaginatedResponseApi<RoomAssignment>>(
      `${this.baseUrl}/${roomId}/history?page=${page}`,
      {
        headers: this.getHeaders(),
      },
    );
    return {
      data: response.data.data,
      meta: response.data.meta,
    };
  }

  async getActive() {
    const response = await adminApi.get<
      ApiResponse<(RoomAssignment & { rooms: any })[]>
    >(`${this.baseUrl}/active`, {
      headers: this.getHeaders(),
    });
    return response.data.data;
  }
}

export const roomAssignmentService = new RoomAssignmentService();
