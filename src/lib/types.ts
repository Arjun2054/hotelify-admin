// ============================================================================
// SUPPLIER TYPES

// ============================================================================
export interface Supplier {
  supplierId: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    products: number;
  };
}

export interface CreateSupplierDto {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface UpdateSupplierDto extends Partial<CreateSupplierDto> {}

export interface SupplierFilters {
  search?: string;
  page?: number;
  limit?: number;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

// export interface ApiResponses<T = unknown> {
//   success: boolean;
//   data?: T;
//   message?: string;
//   meta?: {
//     total: number;
//     page: number;
//     pageSize: number;
//     totalPages: number;
//   };
// }

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginatedResponseApi<T> {
  success: boolean;
  data: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface ApiError {
  status: string;
  message: string;
  details?: any;
}

// ============================================================================
// CATEGORY TYPES
// ============================================================================

export interface Category {
  categoryId: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    products: number;
  };
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
}

export interface UpdateCategoryDto extends Partial<CreateCategoryDto> {}

export interface CategoryFilters {
  search?: string;
  page?: number;
  limit?: number;
}

// ============================================================================
// Products TYPES
// ============================================================================

export interface Product {
  productId: string;
  sku: string;
  image: string;
  productLink?: string;
  name: string;
  price: number;
  rating?: number;
  stockQuantity: number;
  categoryId: string;
  supplierId?: string;
  category: {
    categoryId: string;
    name: string;
    description?: string;
  };
  supplier?: {
    supplierId: string;
    name: string;
    email?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductDto {
  sku: string;
  image: string;
  productLink?: string;
  name: string;
  price: number;
  rating?: number;
  stockQuantity: number;
  categoryId: string;
  supplierId?: string;
}

export interface UpdateProductDto extends Partial<CreateProductDto> {}

export type StockStatus = "in-stock" | "low-stock" | "out-of-stock";

export interface ProductFilters {
  search?: string;
  page?: number;
  limit?: number;
  categoryId?: string;
  supplierId?: string;
}

// ============================================================================
// STOCK MANAGEMENT TYPES
// ============================================================================

export type StockMovementType = "IN" | "OUT";

export type StockTransactionType =
  | "PURCHASE" // Stock In via purchase
  | "RETURN_FROM_CUSTOMER" // Stock In from customer return
  | "ADJUSTMENT_IN" // Manual adjustment increase
  | "SALE" // Stock Out via sale
  | "DAMAGE" // Stock Out due to damage
  | "RETURN_TO_SUPPLIER" // Stock Out return to supplier
  | "ADJUSTMENT_OUT"; // Manual adjustment decrease

export interface StockMovement {
  stockMovementId: string;
  productId: string;
  product: {
    productId: string;
    name: string;
    sku: string;
    image: string;
    category: {
      name: string;
    };
  };
  movementType: StockMovementType;
  transactionType: StockTransactionType;
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  unitPrice?: number;
  totalValue?: number;
  reference?: string;
  notes?: string;
  performedBy?: string;
  createdAt: string;
}

export interface CreateStockMovementDto {
  productId: string;
  movementType: StockMovementType;
  transactionType: StockTransactionType;
  quantity: number;
  unitPrice?: number;
  reference?: string;
  notes?: string;
}

export interface StockReport {
  productId: string;
  productName: string;
  sku: string;
  currentStock: number;
  totalStockIn: number;
  totalStockOut: number;
  stockValue: number;
  lastMovementDate?: string;
  movements: StockMovement[];
}

export interface StockSummary {
  totalProducts: number;
  totalStockValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  totalMovementsToday: number;
  recentMovements: StockMovement[];
}

export interface StockFilters {
  search?: string;
  productId?: string;
  movementType?: StockMovementType;
  transactionType?: StockTransactionType;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}

export const BREAKPOINTS = {
  mobile: 640,
  tablet: 768,
  desktop: 1024,
  wide: 1280,
  ultrawide: 1536,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

// ============================================================================
// SALES TYPES
// ============================================================================

export type SaleStatus = "PENDING" | "COMPLETED" | "CANCELLED" | "REFUNDED";
export type PaymentMethod =
  | "CASH"
  | "CREDIT_CARD"
  | "DEBIT_CARD"
  | "BANK_TRANSFER"
  | "OTHER";
export type PaymentStatus = "PAID" | "PARTIAL" | "UNPAID";

export interface SaleItem {
  saleItemId: string;
  saleId: string;
  productId: string;
  product: {
    productId: string;
    name: string;
    sku: string;
    image: string;
    price: number;
  };
  quantity: number;
  unitPrice: number;
  discount: number;
  tax: number;
  totalPrice: number;
  createdAt: string;
}

export interface Sale {
  saleId: string;
  invoiceNumber: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  saleDate: string;
  status: SaleStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  subtotal: number;
  discount: number;
  tax: number;
  shippingCost: number;
  totalAmount: number;
  amountPaid: number;
  amountDue: number;
  notes?: string;
  items: SaleItem[];
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSaleDto {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  saleDate: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  discount?: number;
  tax?: number;
  status: SaleStatus;
  shippingCost?: number;
  amountDue: number;
  amountPaid?: number;
  notes?: string;
  items: {
    productId: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
    tax?: number;
  }[];
}

export interface SalesFilters {
  search?: string;
  status?: SaleStatus;
  paymentStatus?: PaymentStatus;
  startDate?: string;
  endDate?: string;
  customerId?: string;
  page?: number;
  limit?: number;
}

export interface SalesReport {
  totalSales: number;
  totalRevenue: number;
  totalProfit: number;
  averageOrderValue: number;
  topProducts: {
    productId: string;
    productName: string;
    quantitySold: number;
    revenue: number;
  }[];
  salesByDate: {
    date: string;
    sales: number;
    revenue: number;
  }[];
  salesByPaymentMethod: {
    method: PaymentMethod;
    count: number;
    amount: number;
  }[];
}

export type OrganizationType = "HOTEL" | "STORE" | "CLOTHING";

export type OrgType = "HOTEL" | "STORE" | "CLOTHING";
