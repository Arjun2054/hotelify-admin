import adminApi from "@/lib/config";
import type {
  CreateSupplierDto,
  PaginatedResponse,
  Supplier,
  SupplierFilters,
  UpdateSupplierDto,
} from "@/lib/types";
import { authService } from "./authService";

class SupplierService {
  private baseUrl = "/supplier";

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

  async getSuppliers(
    filters: SupplierFilters = {},
  ): Promise<PaginatedResponse<Supplier>> {
    const { page = 1, limit = 10, search } = filters;

    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (search) params.append("search", search);

    const response = await adminApi.get<Supplier[]>(
      `${this.baseUrl}/getall?${params.toString()}`,
      {
        headers: this.getHeaders(),
      },
    );

    return {
      data: response.data,
      pagination: {
        page,
        limit,
        total: response.data.length,
        totalPages: Math.ceil(response.data.length / limit),
      },
    };
  }

  async getSupplierById(id: string): Promise<Supplier> {
    const response = await adminApi.get<Supplier>(`${this.baseUrl}/${id}`, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async createSupplier(data: CreateSupplierDto): Promise<Supplier> {
    const response = await adminApi.post<Supplier>(
      `${this.baseUrl}/create`,
      data,
      {
        headers: this.getHeaders(),
      },
    );
    return response.data;
  }

  async updateSupplier(id: string, data: UpdateSupplierDto): Promise<Supplier> {
    const response = await adminApi.post<Supplier>(
      `${this.baseUrl}/update/${id}`,
      data,
      {
        headers: this.getHeaders(),
      },
    );
    return response.data;
  }

  async deleteSupplier(id: string): Promise<void> {
    await adminApi.post(`${this.baseUrl}/delete/${id}`, {
      headers: this.getHeaders(),
    });
  }
}

export const supplierService = new SupplierService();
