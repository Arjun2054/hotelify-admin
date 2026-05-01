import adminApi from "@/lib/config";
import { useDashboardStore } from "@/store/dashboardStore";
import { authService } from "./authService";

class DashboardService {
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

  /**
   * Fetch overview statistics
   */
  async getOverviewStats() {
    const store = useDashboardStore.getState();
    store.setLoadingOverview(true);
    store.setError(null);

    try {
      const response = await adminApi.get("/dashboard/overview", {
        headers: this.getHeaders(),
      });
      console.log(response.data.data);
      store.setOverviewStats(response.data.data);
      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch overview stats:", error);
      throw error;
    } finally {
      store.setLoadingOverview(false);
    }
  }

  /**
   * Fetch sales trend data
   * @param period - Time period (7days, 30days, 90days, 365days)
   */
  async getSalesTrend(period = "7days") {
    const store = useDashboardStore.getState();
    store.setLoadingSalesTrend(true);
    store.setError(null);

    try {
      const response = await adminApi.get("/dashboard/sales-trend", {
        params: { period },
        headers: this.getHeaders(),
      });
      store.setSalesTrend(response.data.data);
      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch sales trend:", error);
      throw error;
    } finally {
      store.setLoadingSalesTrend(false);
    }
  }

  /**
   * Fetch revenue by category
   */
  async getRevenueByCategory() {
    const store = useDashboardStore.getState();
    store.setLoadingCategoryRevenue(true);
    store.setError(null);

    try {
      const response = await adminApi.get("/dashboard/revenue-by-category", {
        headers: this.getHeaders(),
      });
      store.setCategoryRevenue(response.data.data);
      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch revenue by category:", error);
      throw error;
    } finally {
      store.setLoadingCategoryRevenue(false);
    }
  }

  /**
   * Fetch top selling products
   * @param limit - Number of products to return
   */
  async getTopProducts(limit = 10) {
    const store = useDashboardStore.getState();
    store.setLoadingTopProducts(true);
    store.setError(null);

    try {
      const response = await adminApi.get("/dashboard/top-products", {
        params: { limit },
        headers: this.getHeaders(),
      });
      store.setTopProducts(response.data.data);
      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch top products:", error);
      throw error;
    } finally {
      store.setLoadingTopProducts(false);
    }
  }

  /**
   * Fetch recent sales
   * @param limit - Number of sales to return
   */
  async getRecentSales(limit = 10) {
    const store = useDashboardStore.getState();
    store.setLoadingRecentSales(true);
    store.setError(null);

    try {
      const response = await adminApi.get("/dashboard/recent-sales", {
        params: { limit },
        headers: this.getHeaders(),
      });
      store.setRecentSales(response.data.data);
      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch recent sales:", error);
      throw error;
    } finally {
      store.setLoadingRecentSales(false);
    }
  }

  /**
   * Fetch low stock alerts
   * @param threshold - Stock quantity threshold
   */
  async getLowStockAlerts(threshold = 10) {
    const store = useDashboardStore.getState();
    store.setLoadingLowStock(true);
    store.setError(null);

    try {
      const response = await adminApi.get("/dashboard/low-stock-alerts", {
        params: { threshold },
        headers: this.getHeaders(),
      });
      store.setLowStockAlerts(response.data.data);
      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch low stock alerts:", error);
      throw error;
    } finally {
      store.setLoadingLowStock(false);
    }
  }

  /**
   * Fetch stock movement summary
   * @param days - Number of days to look back
   */
  async getStockMovementSummary(days = 7) {
    const store = useDashboardStore.getState();
    store.setLoadingStockMovement(true);
    store.setError(null);

    try {
      const response = await adminApi.get("/dashboard/stock-movement-summary", {
        params: { days },
        headers: this.getHeaders(),
      });
      store.setStockMovementSummary(response.data.data);
      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch stock movement summary:", error);
      throw error;
    } finally {
      store.setLoadingStockMovement(false);
    }
  }

  /**
   * Fetch payment status overview
   */
  async getPaymentStatusOverview() {
    const store = useDashboardStore.getState();
    store.setLoadingPaymentStatus(true);
    store.setError(null);

    try {
      const response = await adminApi.get("/dashboard/payment-status", {
        headers: this.getHeaders(),
      });
      store.setPaymentStatus(response.data.data);
      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch payment status:", error);
      throw error;
    } finally {
      store.setLoadingPaymentStatus(false);
    }
  }

  /**
   * Fetch all dashboard data at once
   */
  async fetchAllDashboardData(options?: {
    period?: string;
    lowStockThreshold?: number;
    topProductsLimit?: number;
    recentSalesLimit?: number;
  }) {
    const {
      period = "7days",
      lowStockThreshold = 10,
      topProductsLimit = 10,
      recentSalesLimit = 10,
    } = options || {};

    try {
      await Promise.allSettled([
        this.getOverviewStats(),
        this.getSalesTrend(period),
        this.getRevenueByCategory(),
        this.getTopProducts(topProductsLimit),
        this.getRecentSales(recentSalesLimit),
        this.getLowStockAlerts(lowStockThreshold),
        this.getStockMovementSummary(),
        this.getPaymentStatusOverview(),
      ]);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      throw error;
    }
  }

  /**
   * Refresh specific dashboard section
   */
  async refreshSection(
    section: "overview" | "sales" | "products" | "stock" | "payments",
    options?: any,
  ) {
    switch (section) {
      case "overview":
        return this.getOverviewStats();
      case "sales":
        return Promise.all([
          this.getSalesTrend(options?.period),
          this.getRecentSales(options?.limit),
        ]);
      case "products":
        return Promise.all([
          this.getTopProducts(options?.limit),
          this.getRevenueByCategory(),
        ]);
      case "stock":
        return Promise.all([
          this.getLowStockAlerts(options?.threshold),
          this.getStockMovementSummary(options?.days),
        ]);
      case "payments":
        return this.getPaymentStatusOverview();
      default:
        return this.fetchAllDashboardData(options);
    }
  }
}

export const dashboardService = new DashboardService();
