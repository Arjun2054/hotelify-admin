// types/inventory-analytics-types.ts
export interface InventoryDashboardStats {
  totalItems: number;
  activeItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  totalInventoryValue: number;
  currentMonthSpend: number;
  lastMonthSpend: number;
  spendGrowth: number;
  currentConsumption: number;
  lastConsumption: number;
  consumptionGrowth: number;
  totalMovementsAllTime: number;
  categoryDistribution: CategoryValueItem[];
}

export interface CategoryValueItem {
  categoryId: string;
  name: string;
  itemCount: number;
  totalValue: number;
}

export interface MostUsedItem {
  itemId: string;
  name: string;
  sku?: string;
  categoryName: string;
  unit: string;
  stockQuantity: number;
  totalUsed: number;
  usageCount: number;
  estimatedCost: number;
  isActive: boolean;
}

export interface MovementTrend {
  month: string;
  monthShort: string;
  monthKey: string;
  monthIndex: number;
  stockIn: number;
  stockOut: number;
  damage: number;
  wastage: number;
  totalMovements: number;
  totalSpend: number;
  netChange: number;
}

export interface SpendingByItem {
  itemId: string;
  name: string;
  sku?: string;
  categoryName: string;
  unit: string;
  totalSpend: number;
  totalQuantityPurchased: number;
  purchaseCount: number;
  avgUnitCost: number;
}

export interface CategoryDistribution {
  categoryId: string;
  name: string;
  totalItems: number;
  totalValue: number;
  percentage: number;
  lowStockCount: number;
  outOfStock: number;
}

export interface MovementTypeBreakdown {
  type: string;
  label: string;
  count: number;
  totalQuantity: number;
  percentage: number;
  color: string;
}

export interface LowStockAlert {
  itemId: string;
  name: string;
  sku?: string;
  categoryName: string;
  unit: string;
  stockQuantity: number;
  minimumStock: number;
  reorderPoint: number;
  quantityNeeded: number;
  estimatedRestockCost: number;
  severity: "critical" | "high" | "medium";
  supplierName?: string;
  supplierPhone?: string;
  supplierEmail?: string;
}

export interface LowStockAlertsResponse {
  alerts: LowStockAlert[];
  summary: { critical: number; high: number; medium: number; total: number };
}

export interface StockValueTrend {
  month: string;
  monthShort: string;
  monthIndex: number;
  spendIn: number;
  valueOut: number;
  netChange: number;
}

export interface SupplierSpending {
  supplierId: string;
  supplierName: string;
  totalSpend: number;
  totalQuantity: number;
  orderCount: number;
  percentage: number;
}

export interface FullInventoryAnalytics {
  dashboardStats: InventoryDashboardStats;
  mostUsedItems: MostUsedItem[];
  movementTrends: MovementTrend[];
  spendingByItem: SpendingByItem[];
  categoryDistribution: CategoryDistribution[];
  movementTypeBreakdown: MovementTypeBreakdown[];
  lowStockAlerts: LowStockAlertsResponse;
  stockValueTrend: StockValueTrend[];
  supplierSpending: SupplierSpending[];
}

export interface InventoryAnalyticsFilter {
  startDate?: Date;
  endDate?: Date;
  categoryId?: string;
  supplierId?: string;
}

export interface FilterCategory {
  categoryId: string;
  name: string;
}

export interface FilterSupplier {
  supplierId: string;
  name: string;
}
