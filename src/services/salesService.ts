import adminApi from "@/lib/config";
import type {
  CreateSaleDto,
  PaginatedResponse,
  Sale,
  SalesFilters,
  SalesReport,
} from "@/lib/types";
import { authService } from "./authService";

class SalesService {
  private baseUrl = "/sales";

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

  async getSales(filters: SalesFilters = {}): Promise<PaginatedResponse<Sale>> {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      paymentStatus,
      startDate,
      endDate,
    } = filters;

    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (search) params.append("search", search);
    if (status) params.append("status", status);
    if (paymentStatus) params.append("paymentStatus", paymentStatus);
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const response = await adminApi.get<PaginatedResponse<Sale>>(
      `${this.baseUrl}?${params.toString()}`,
      {
        headers: this.getHeaders(),
      },
    );
    return response.data;
  }

  async getSaleById(id: string): Promise<Sale> {
    const response = await adminApi.get<Sale>(`${this.baseUrl}/${id}`, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async createSale(data: CreateSaleDto): Promise<Sale> {
    const response = await adminApi.post<Sale>(`${this.baseUrl}`, data, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async updateSale(id: string, data: Partial<CreateSaleDto>): Promise<Sale> {
    const response = await adminApi.put<Sale>(`${this.baseUrl}/${id}`, data, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async cancelSale(id: string, reason?: string): Promise<Sale> {
    const response = await adminApi.post<Sale>(
      `${this.baseUrl}/${id}/cancel`,
      {
        reason,
      },
      {
        headers: this.getHeaders(),
      },
    );
    return response.data;
  }

  async refundSale(
    id: string,
    amount?: number,
    reason?: string,
  ): Promise<Sale> {
    const response = await adminApi.post<Sale>(
      `${this.baseUrl}/${id}/refund`,
      {
        amount,
        reason,
      },
      {
        headers: this.getHeaders(),
      },
    );
    return response.data;
  }

  async getSalesReport(filters: SalesFilters = {}): Promise<SalesReport> {
    const params = new URLSearchParams();
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);

    const response = await adminApi.get<SalesReport>(
      `${this.baseUrl}/reports?${params.toString()}`,
      {
        headers: this.getHeaders(),
      },
    );
    return response.data;
  }

  async exportSales(filters: SalesFilters = {}): Promise<Blob> {
    const params = new URLSearchParams();
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);
    if (filters.status) params.append("status", filters.status);

    const response = await adminApi.get(
      `${this.baseUrl}/export?${params.toString()}`,
      {
        responseType: "blob",
        headers: this.getHeaders(),
      },
    );
    return response.data;
  }
}

export const salesService = new SalesService();
