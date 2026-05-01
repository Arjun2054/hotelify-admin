import adminApi from "@/lib/config";
import type {
  CreateProductDto,
  PaginatedResponse,
  Product,
  ProductFilters,
  UpdateProductDto,
} from "@/lib/types";
import { authService } from "./authService";

class ProductService {
  private baseUrl = "/product";

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

  async getProducts(
    filters: ProductFilters = {},
  ): Promise<PaginatedResponse<Product>> {
    const { page = 1, limit = 10, search, categoryId, supplierId } = filters;

    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (search) params.append("search", search);
    if (categoryId) params.append("categoryId", categoryId);
    if (supplierId) params.append("supplierId", supplierId);

    const response = await adminApi.get<{ products: Product[] }>(
      `${this.baseUrl}/getall?${params.toString()}`,
      {
        headers: this.getHeaders(),
      },
    );

    // Transform backend response to match our pagination format
    return {
      data: response.data.products,
      pagination: {
        page,
        limit,
        total: response.data.products.length, // Backend should return this
        totalPages: Math.ceil(response.data.products.length / limit),
      },
    };
  }

  async getProductById(id: string): Promise<Product> {
    const response = await adminApi.get<Product>(`${this.baseUrl}/${id}`, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async createProduct(data: CreateProductDto): Promise<Product> {
    const response = await adminApi.post<Product>(
      `${this.baseUrl}/create`,
      data,
      {
        headers: this.getHeaders(),
      },
    );
    return response.data;
  }

  async updateProduct(id: string, data: UpdateProductDto): Promise<Product> {
    const response = await adminApi.post<Product>(
      `${this.baseUrl}/update/${id}`,
      data,
      {
        headers: this.getHeaders(),
      },
    );
    return response.data;
  }

  async deleteProduct(id: string): Promise<void> {
    await adminApi.post(`${this.baseUrl}/delete/${id}`, {
      headers: this.getHeaders(),
    });
  }
}

export const productService = new ProductService();
