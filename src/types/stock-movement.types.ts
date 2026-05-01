// ============================================================================
// FRONTEND TYPES FOR STOCK MOVEMENT
// ============================================================================

export enum MovementType {
  IN = "IN",
  OUT = "OUT",
}

export enum TransactionType {
  // Stock IN types
  PURCHASE = "PURCHASE",
  RETURN = "RETURN",
  ADJUSTMENT_IN = "ADJUSTMENT_IN",
  TRANSFER_IN = "TRANSFER_IN",
  PRODUCTION = "PRODUCTION",

  // Stock OUT types
  SALE = "SALE",
  DAMAGE = "DAMAGE",
  LOSS = "LOSS",
  ADJUSTMENT_OUT = "ADJUSTMENT_OUT",
  TRANSFER_OUT = "TRANSFER_OUT",
  EXPIRED = "EXPIRED",
}

export interface Product {
  productId: string;
  name: string;
  sku: string;
  image: string;
  stockQuantity: number;
  category: {
    categoryId: string;
    name: string;
  };
  supplier: {
    supplierId: string;
    name: string;
  } | null;
}

export interface StockMovement {
  stockMovementId: string;
  organizationId: string;
  productId: string;
  product: Product;
  movementType: string;
  transactionType: string;
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  unitPrice: number | null;
  totalValue: number | null;
  reference: string | null;
  notes: string | null;
  performedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStockMovementDTO {
  productId: string;
  transactionType: TransactionType;
  quantity: number;
  unitPrice?: number;
  reference?: string;
  notes?: string;
}

export interface StockMovementFilters {
  categoryId?: string;
  supplierId?: string;
  movementType?: MovementType;
  transactionType?: TransactionType;
  startDate?: string;
  endDate?: string;
  productId?: string;
}

export interface PaginationState {
  page: number;
  limit: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface DashboardSummary {
  totalStockIn: number;
  totalStockOut: number;
  totalStockValue: number;
  totalMovements: number;
  recentMovements: StockMovement[];
  topProducts: {
    productId: string;
    productName: string;
    totalMovements: number;
    totalQuantity: number;
  }[];
  movementsByType: {
    type: string;
    count: number;
    totalQuantity: number;
  }[];
}

export interface ProductReport {
  product: Product;
  movements: StockMovement[];
  summary: {
    totalIn: number;
    totalOut: number;
    netChange: number;
    currentStock: number;
  };
}

export interface ApiResponse<T> {
  status: string;
  message?: string;
  data: T;
}

export interface PaginatedApiResponse<T> {
  status: string;
  data: T[];
  pagination: PaginationState;
}

// Form types
export interface StockInFormData {
  productId: string;
  transactionType: TransactionType;
  quantity: number;
  unitPrice?: number;
  reference?: string;
  notes?: string;
}

export interface StockOutFormData {
  productId: string;
  transactionType: TransactionType;
  quantity: number;
  unitPrice?: number;
  reference?: string;
  notes?: string;
}

// Filter options
export interface FilterOption {
  label: string;
  value: string;
}

export interface Category {
  categoryId: string;
  name: string;
}

export interface Supplier {
  supplierId: string;
  name: string;
}
