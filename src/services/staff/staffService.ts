import adminApi from "@/lib/config";
import { authService } from "../authService";
import type {
  StaffMember,
  CreateStaffPayload,
  UpdateStaffPayload,
  StaffStats,
  StaffActivity,
  StaffFilters,
  StaffDepartment,
} from "@/types/staff-types";
import type { ApiResponse, PaginatedResponseApi } from "@/lib/types";

class StaffService {
  private baseUrl = "/staff";

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

  async getAll(filters?: StaffFilters, page = 1, pageSize = 25) {
    const params = new URLSearchParams();
    if (filters?.role) params.set("role", filters.role);
    if (filters?.department) params.set("department", filters.department);
    if (filters?.search) params.set("search", filters.search);
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));

    const response = await adminApi.get<PaginatedResponseApi<StaffMember>>(
      `${this.baseUrl}?${params.toString()}`,
      { headers: this.getHeaders() },
    );

    return {
      data: response.data.data,
      meta: response.data.meta,
    };
  }

  async getById(id: string): Promise<StaffMember> {
    const response = await adminApi.get<ApiResponse<StaffMember>>(
      `${this.baseUrl}/${id}`,
      {
        headers: this.getHeaders(),
      },
    );
    return response.data.data;
  }

  async create(data: CreateStaffPayload): Promise<StaffMember> {
    const response = await adminApi.post<ApiResponse<StaffMember>>(
      `${this.baseUrl}`,
      data,
      { headers: this.getHeaders() },
    );
    return response.data.data;
  }

  async update(id: string, data: UpdateStaffPayload): Promise<StaffMember> {
    const response = await adminApi.put<ApiResponse<StaffMember>>(
      `${this.baseUrl}/${id}`,
      data,
      { headers: this.getHeaders() },
    );
    return response.data.data;
  }
  async changePassword(id: string, newPassword: string): Promise<StaffMember> {
    const response = await adminApi.patch<ApiResponse<StaffMember>>(
      `${this.baseUrl}/${id}/password`,
      { newPassword },
      { headers: this.getHeaders() },
    );
    return response.data.data;
  }
  async remove(id: string): Promise<void> {
    const response = await adminApi.delete(`${this.baseUrl}/${id}`, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async getStats() {
    const response = await adminApi.get<ApiResponse<StaffStats>>(
      `${this.baseUrl}/stats`,
      { headers: this.getHeaders() },
    );
    return response.data.data;
  }

  async getActivity(id: string, page = 1) {
    const response = await adminApi.get<{
      success: boolean;
      data: StaffActivity[];
      meta: { total: number };
    }>(`${this.baseUrl}/${id}/activity?page=${page}`, {
      headers: this.getHeaders(),
    });
    return {
      data: response.data.data,
      total: response.data.meta.total,
    };
  }
  async getByDepartment(department: StaffDepartment) {
    const response = await adminApi.get<
      ApiResponse<
        {
          membershipId: string;
          userId: string;
          name: string;
          email: string;
          department: StaffDepartment | null;
          jobTitle: string | null;
        }[]
      >
    >(`${this.baseUrl}/department/${department}`, {
      headers: this.getHeaders(),
    });
    return response.data.data;
  }
}

export const staffService = new StaffService();
