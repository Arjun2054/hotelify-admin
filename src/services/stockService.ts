import adminApi from "@/lib/config";
import type {
  CreateStockMovementDto,
  PaginatedResponse,
  StockFilters,
  StockMovement,
  StockReport,
  StockSummary,
} from "@/lib/types";
import { authService } from "./authService";

class StockService {
  private readonly baseUrl = "/stock";

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
   * Build URLSearchParams from a partial filter object,
   * omitting undefined/null/empty values.
   */
  private buildParams(
    entries: Record<string, string | number | undefined | null>,
  ): URLSearchParams {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(entries)) {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, String(value));
      }
    }
    return params;
  }

  /**
   * Normalize any backend response shape into a PaginatedResponse.
   *
   * Handles:
   *  - { data: [...], pagination: { total, page, limit } }
   *  - { data: [...], total, page, limit }
   *  - { items: [...], total, page, limit }
   *  - Raw array [...]
   */
  private normalizePaginatedResponse<T>(
    responseData: unknown,
    fallbackPage: number,
    fallbackLimit: number,
  ): PaginatedResponse<T> {
    let data: T[] = [];
    let total = 0;
    let page = fallbackPage;
    let limit = fallbackLimit;

    const res = responseData as Record<string, any> | null;

    if (Array.isArray(res)) {
      // Backend returned a raw array
      data = res;
      total = res.length;
    } else if (res && typeof res === "object") {
      // Extract the array from known keys
      if (Array.isArray(res.data)) {
        data = res.data;
      } else if (Array.isArray(res.items)) {
        data = res.items;
      }

      // Extract pagination metadata (nested or flat)
      const pagination = res.pagination ?? res.meta ?? res;
      total =
        pagination.total ??
        pagination.totalCount ??
        pagination.count ??
        data.length;
      page = pagination.page ?? pagination.currentPage ?? fallbackPage;
      limit = pagination.limit ?? pagination.pageSize ?? fallbackLimit;
    } else {
      console.error("Unexpected API response format:", responseData);
    }

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: limit > 0 ? Math.ceil(total / limit) : 0,
      },
    };
  }

  /**
   * Get all stock movements with filtering & pagination.
   */
  async getStockMovements(
    filters: StockFilters = {},
  ): Promise<PaginatedResponse<StockMovement>> {
    const {
      page = 1,
      limit = 10,
      search,
      productId,
      movementType,
      transactionType,
      startDate,
      endDate,
    } = filters;

    const params = this.buildParams({
      page,
      limit,
      search,
      productId,
      movementType,
      transactionType,
      startDate,
      endDate,
    });

    try {
      const response = await adminApi.get(
        `${this.baseUrl}/movements?${params.toString()}`,
        { headers: this.getHeaders() },
      );

      return this.normalizePaginatedResponse<StockMovement>(
        response.data,
        page,
        limit,
      );
    } catch (error) {
      console.error("Failed to fetch stock movements:", error);
      throw error;
    }
  }

  /**
   * Record a stock-in movement.
   */
  async stockIn(dto: CreateStockMovementDto): Promise<StockMovement> {
    if (!dto.productId) {
      throw new Error("productId is required for stock-in.");
    }
    if (dto.quantity == null || dto.quantity <= 0) {
      throw new Error("quantity must be a positive number.");
    }

    try {
      const response = await adminApi.post<StockMovement>(
        `${this.baseUrl}/in`,
        { ...dto, movementType: "IN" },
        { headers: this.getHeaders() },
      );
      return response.data;
    } catch (error) {
      console.error("Stock-in failed:", error);
      throw error;
    }
  }

  /**
   * Record a stock-out movement.
   */
  async stockOut(dto: CreateStockMovementDto): Promise<StockMovement> {
    if (!dto.productId) {
      throw new Error("productId is required for stock-out.");
    }
    if (dto.quantity == null || dto.quantity <= 0) {
      throw new Error("quantity must be a positive number.");
    }

    try {
      const response = await adminApi.post<StockMovement>(
        `${this.baseUrl}/out`,
        { ...dto, movementType: "OUT" },
        { headers: this.getHeaders() },
      );
      return response.data;
    } catch (error) {
      console.error("Stock-out failed:", error);
      throw error;
    }
  }

  /**
   * Get stock report for a specific product.
   */
  async getStockReport(productId: string): Promise<StockReport> {
    if (!productId) {
      throw new Error("productId is required to fetch a stock report.");
    }

    try {
      const response = await adminApi.get<StockReport>(
        `${this.baseUrl}/report/${encodeURIComponent(productId)}`,
        { headers: this.getHeaders() },
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch stock report for ${productId}:`, error);
      throw error;
    }
  }

  /**
   * Get aggregated stock summary across all products.
   */
  async getStockSummary(): Promise<StockSummary> {
    try {
      const response = await adminApi.get<StockSummary>(
        `${this.baseUrl}/summary`,
        { headers: this.getHeaders() },
      );
      return response.data;
    } catch (error) {
      console.error("Failed to fetch stock summary:", error);
      throw error;
    }
  }

  /**
   * Get stock movement history for a specific product.
   */
  async getProductStockHistory(
    productId: string,
    filters: StockFilters = {},
  ): Promise<StockMovement[]> {
    if (!productId) {
      throw new Error("productId is required to fetch stock history.");
    }

    const { startDate, endDate, limit = 50 } = filters;

    const params = this.buildParams({
      limit,
      startDate,
      endDate,
    });

    try {
      const response = await adminApi.get<StockMovement[]>(
        `${this.baseUrl}/history/${encodeURIComponent(productId)}?${params.toString()}`,
        { headers: this.getHeaders() },
      );

      // Normalize: backend may return { data: [...] } or [...]
      if (Array.isArray(response.data)) {
        return response.data;
      }

      const res = response.data as Record<string, any>;
      if (res && Array.isArray(res.data)) {
        return res.data;
      }

      console.error("Unexpected stock history response format:", response.data);
      return [];
    } catch (error) {
      console.error(`Failed to fetch stock history for ${productId}:`, error);
      throw error;
    }
  }

  /**
   * Export stock report as a downloadable file (Blob).
   */
  async exportStockReport(filters: StockFilters = {}): Promise<Blob> {
    const params = this.buildParams({
      startDate: filters.startDate,
      endDate: filters.endDate,
      productId: filters.productId,
    });

    try {
      const response = await adminApi.get<Blob>(
        `${this.baseUrl}/export?${params.toString()}`,
        {
          responseType: "blob",
          headers: {
            ...this.getHeaders(),
            Accept: "application/octet-stream",
          },
        },
      );

      // Validate that we actually received a Blob
      if (!(response.data instanceof Blob)) {
        throw new Error("Export endpoint did not return a downloadable file.");
      }

      return response.data;
    } catch (error) {
      console.error("Failed to export stock report:", error);
      throw error;
    }
  }

  /**
   * Helper: trigger a browser download from a Blob.
   */
  downloadBlob(blob: Blob, filename = "stock-report.xlsx"): void {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();

    // Cleanup
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }
}

export const stockService = new StockService();
