import { create } from "zustand";
import { devtools } from "zustand/middleware";

// Types for dashboard data
export interface OverviewStats {
  products: {
    total: number;
    lowStock: number;
    totalStockUnits: number;
  };
  sales: {
    total: number;
    recent: number;
    revenue: number;
  };
  suppliers: {
    active: number;
  };
  categories: {
    active: number;
  };
  purchases: {
    total: number;
    pending: number;
  };
}

export interface SalesTrendData {
  date: string;
  revenue: number;
  salesCount: number;
}

export interface CategoryRevenueData {
  category: string;
  revenue: number;
}

export interface TopProduct {
  productId: string;
  name: string;
  sku: string;
  image: string;
  quantitySold: number;
  revenue: number;
  currentStock: number;
  price: number;
}

export interface RecentSale {
  saleId: string;
  invoiceNumber: string;
  customerName: string;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  saleDate: string;
  itemsCount: number;
  items: Array<{
    productName: string;
    quantity: number;
    unitPrice: number;
  }>;
}

export interface LowStockProduct {
  productId: string;
  name: string;
  sku: string;
  currentStock: number;
  price: number;
  category: string;
  supplier: {
    name: string;
    phone: string | null;
    email: string | null;
  } | null;
  image: string;
}

export interface StockMovementSummary {
  movementType: string;
  transactionType: string;
  totalQuantity: number;
  transactionCount: number;
}

export interface PaymentStatusOverview {
  status: string;
  count: number;
  totalAmount: number;
  amountPaid: number;
  amountDue: number;
}

interface DashboardState {
  // Data
  overviewStats: OverviewStats | null;
  salesTrend: {
    period: string;
    groupBy: string;
    trend: SalesTrendData[];
  } | null;
  categoryRevenue: CategoryRevenueData[];
  topProducts: TopProduct[];
  recentSales: RecentSale[];
  lowStockAlerts: {
    threshold: number;
    count: number;
    products: LowStockProduct[];
  } | null;
  stockMovementSummary: {
    period: string;
    summary: StockMovementSummary[];
  } | null;
  paymentStatus: PaymentStatusOverview[];

  // Loading states
  isLoadingOverview: boolean;
  isLoadingSalesTrend: boolean;
  isLoadingCategoryRevenue: boolean;
  isLoadingTopProducts: boolean;
  isLoadingRecentSales: boolean;
  isLoadingLowStock: boolean;
  isLoadingStockMovement: boolean;
  isLoadingPaymentStatus: boolean;

  // Error states
  error: string | null;

  // Filter states
  selectedPeriod: "7days" | "30days" | "90days" | "365days";
  lowStockThreshold: number;
  topProductsLimit: number;
  recentSalesLimit: number;

  // Actions
  setOverviewStats: (stats: OverviewStats) => void;
  setSalesTrend: (data: any) => void;
  setCategoryRevenue: (data: CategoryRevenueData[]) => void;
  setTopProducts: (data: TopProduct[]) => void;
  setRecentSales: (data: RecentSale[]) => void;
  setLowStockAlerts: (data: any) => void;
  setStockMovementSummary: (data: any) => void;
  setPaymentStatus: (data: PaymentStatusOverview[]) => void;

  // Loading state setters
  setLoadingOverview: (loading: boolean) => void;
  setLoadingSalesTrend: (loading: boolean) => void;
  setLoadingCategoryRevenue: (loading: boolean) => void;
  setLoadingTopProducts: (loading: boolean) => void;
  setLoadingRecentSales: (loading: boolean) => void;
  setLoadingLowStock: (loading: boolean) => void;
  setLoadingStockMovement: (loading: boolean) => void;
  setLoadingPaymentStatus: (loading: boolean) => void;

  setError: (error: string | null) => void;

  // Filter setters
  setSelectedPeriod: (
    period: "7days" | "30days" | "90days" | "365days",
  ) => void;
  setLowStockThreshold: (threshold: number) => void;
  setTopProductsLimit: (limit: number) => void;
  setRecentSalesLimit: (limit: number) => void;

  // Reset
  resetDashboard: () => void;
}

const initialState = {
  overviewStats: null,
  salesTrend: null,
  categoryRevenue: [],
  topProducts: [],
  recentSales: [],
  lowStockAlerts: null,
  stockMovementSummary: null,
  paymentStatus: [],

  isLoadingOverview: false,
  isLoadingSalesTrend: false,
  isLoadingCategoryRevenue: false,
  isLoadingTopProducts: false,
  isLoadingRecentSales: false,
  isLoadingLowStock: false,
  isLoadingStockMovement: false,
  isLoadingPaymentStatus: false,

  error: null,

  selectedPeriod: "7days" as const,
  lowStockThreshold: 10,
  topProductsLimit: 10,
  recentSalesLimit: 10,
};

export const useDashboardStore = create<DashboardState>()(
  devtools(
    (set) => ({
      ...initialState,

      // Data setters
      setOverviewStats: (stats) => set({ overviewStats: stats }),
      setSalesTrend: (data) => set({ salesTrend: data }),
      setCategoryRevenue: (data) => set({ categoryRevenue: data }),
      setTopProducts: (data) => set({ topProducts: data }),
      setRecentSales: (data) => set({ recentSales: data }),
      setLowStockAlerts: (data) => set({ lowStockAlerts: data }),
      setStockMovementSummary: (data) => set({ stockMovementSummary: data }),
      setPaymentStatus: (data) => set({ paymentStatus: data }),

      // Loading state setters
      setLoadingOverview: (loading) => set({ isLoadingOverview: loading }),
      setLoadingSalesTrend: (loading) => set({ isLoadingSalesTrend: loading }),
      setLoadingCategoryRevenue: (loading) =>
        set({ isLoadingCategoryRevenue: loading }),
      setLoadingTopProducts: (loading) =>
        set({ isLoadingTopProducts: loading }),
      setLoadingRecentSales: (loading) =>
        set({ isLoadingRecentSales: loading }),
      setLoadingLowStock: (loading) => set({ isLoadingLowStock: loading }),
      setLoadingStockMovement: (loading) =>
        set({ isLoadingStockMovement: loading }),
      setLoadingPaymentStatus: (loading) =>
        set({ isLoadingPaymentStatus: loading }),

      setError: (error) => set({ error }),

      // Filter setters
      setSelectedPeriod: (period) => set({ selectedPeriod: period }),
      setLowStockThreshold: (threshold) =>
        set({ lowStockThreshold: threshold }),
      setTopProductsLimit: (limit) => set({ topProductsLimit: limit }),
      setRecentSalesLimit: (limit) => set({ recentSalesLimit: limit }),

      // Reset
      resetDashboard: () => set(initialState),
    }),
    { name: "DashboardStore" },
  ),
);
