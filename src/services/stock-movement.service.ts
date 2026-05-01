import type {
  ApiResponse,
  CreateStockMovementDTO,
  DashboardSummary,
  PaginatedApiResponse,
  ProductReport,
  StockMovement,
} from "@/types/stock-movement.types";
import { authService } from "./authService";
import adminApi from "@/lib/config";

// Base API configuration

class StockMovementService {
  /**
   * Get organization ID from auth context.
   * Throws if no active organization is found.
   */
  private getOrganizationId(): string {
    const orgId = authService.getActiveOrganizationId();
    if (!orgId) {
      throw new Error(
        "Organization context not found. Please select an organization.",
      );
    }
    return orgId;
  }

  /**
   * Build headers with organization context.
   */
  private getHeaders(): Record<string, string> {
    return {
      "X-Organization-Id": this.getOrganizationId(),
    };
  }

  /**
   * Create Stock IN entry
   */
  async createStockIn(
    data: CreateStockMovementDTO,
  ): Promise<ApiResponse<StockMovement>> {
    const response = await adminApi.post<ApiResponse<StockMovement>>(
      "/stock-movements/in",
      data,
      {
        headers: this.getHeaders(),
      },
    );
    return response.data;
  }

  /**
   * Create Stock OUT entry
   */
  async createStockOut(
    data: CreateStockMovementDTO,
  ): Promise<ApiResponse<StockMovement>> {
    const response = await adminApi.post<ApiResponse<StockMovement>>(
      "/stock-movements/out",
      data,
      {
        headers: this.getHeaders(),
      },
    );
    return response.data;
  }

  /**
   * Get paginated stock movements with filters
   */
  async getStockMovements(params: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    search?: string;
    categoryId?: string;
    supplierId?: string;
    movementType?: string;
    transactionType?: string;
    startDate?: string;
    endDate?: string;
    productId?: string;
  }): Promise<PaginatedApiResponse<StockMovement>> {
    const response = await adminApi.get<PaginatedApiResponse<StockMovement>>(
      "/stock-movements/",
      { params, headers: this.getHeaders() },
    );
    return response.data;
  }

  /**
   * Get single stock movement by ID
   */
  async getStockMovementById(id: string): Promise<ApiResponse<StockMovement>> {
    const response = await adminApi.get<ApiResponse<StockMovement>>(
      `/stock-movements/${id}`,
      {
        headers: this.getHeaders(),
      },
    );
    return response.data;
  }

  /**
   * Delete stock movement
   */
  async deleteStockMovement(id: string): Promise<ApiResponse<null>> {
    const response = await adminApi.delete<ApiResponse<null>>(
      `/stock-movements/${id}`,
      {
        headers: this.getHeaders(),
      },
    );
    return response.data;
  }

  /**
   * Get dashboard summary
   */
  async getDashboardSummary(): Promise<ApiResponse<DashboardSummary>> {
    const response = await adminApi.get<ApiResponse<DashboardSummary>>(
      "/stock-movements/dashboard/summary",
      {
        headers: this.getHeaders(),
      },
    );
    return response.data;
  }

  /**
   * Generate full stock movement report
   */
  async generateFullReport(params: {
    categoryId?: string;
    supplierId?: string;
    movementType?: string;
    transactionType?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<ApiResponse<StockMovement[]>> {
    const response = await adminApi.get<ApiResponse<StockMovement[]>>(
      "/stock-movements/reports/full",
      { params, headers: this.getHeaders() },
    );
    return response.data;
  }

  /**
   * Generate individual product report
   */
  async generateProductReport(
    productId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<ApiResponse<ProductReport>> {
    const response = await adminApi.get<ApiResponse<ProductReport>>(
      `/stock-movements/reports/product/${productId}`,
      { params: { startDate, endDate }, headers: this.getHeaders() },
    );
    return response.data;
  }

  /**
   * Export stock movements
   */
  async exportStockMovements(params: {
    format: "csv" | "json";
    search?: string;
    categoryId?: string;
    supplierId?: string;
    movementType?: string;
    transactionType?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<void> {
    const response = await adminApi.get("/stock-movements/export", {
      params,
      responseType: params.format === "csv" ? "blob" : "json",
      headers: this.getHeaders(),
    });

    if (params.format === "csv") {
      // Download CSV file
      const blob = new Blob([response.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `stock-movements-${Date.now()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } else {
      // Download JSON file
      const blob = new Blob([JSON.stringify(response.data, null, 2)], {
        type: "application/json",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `stock-movements-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }
  }
}

// Export singleton instance
export const stockMovementService = new StockMovementService();
