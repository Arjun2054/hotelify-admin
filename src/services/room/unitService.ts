// ============================================================================
// CATEGORY SERVICE
// ============================================================================

import adminApi from "@/lib/config";
import { authService } from "../authService";
import type { ApiResponse } from "@/lib/types";
import type { CreateUnitPayload, Unit } from "@/types/hotelItem-types";

class UnitService {
  private baseUrl = "/unit";

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

  async getAll(): Promise<Unit[]> {
    const response = await adminApi.get<ApiResponse<Unit[]>>(
      `${this.baseUrl}/units`,
      { headers: this.getHeaders() },
    );

    return response.data.data; // ✅ FIXED
  }

  async getById(id: string): Promise<Unit> {
    // FIXED: Add organization ID to headers
    const response = await adminApi.get<Unit>(`${this.baseUrl}/units/${id}`, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async create(data: CreateUnitPayload) {
    const response = await adminApi.post(`${this.baseUrl}/units`, data, {
      headers: this.getHeaders(),
    });

    return response.data.data; // ✅ extract actual RoomType
  }

  async update(id: string, data: Partial<CreateUnitPayload>): Promise<Unit> {
    // FIXED: Add organization ID to headers
    const response = await adminApi.put<Unit>(
      `${this.baseUrl}/units/${id}`,
      data,
      {
        headers: this.getHeaders(),
      },
    );
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await adminApi.delete(`${this.baseUrl}/units/${id}`, {
      headers: this.getHeaders(),
    });
  }
}

export const unitService = new UnitService();
