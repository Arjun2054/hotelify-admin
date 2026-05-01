import type { StockMovementType, StockTransactionType } from "@/lib/types";

export interface StockMovement {
  stockMovementId: string;
  movementType: StockMovementType;
  transactionType: StockTransactionType;
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  reference?: string;
  createdAt: string;
  product: {
    name: string;
    sku: string;
  };
}

export interface StockMovementFilters {
  search?: string;
  movementType?: StockMovementType;
  transactionType?: StockTransactionType;
  startDate?: string;
  endDate?: string;
  page?: number;
}

export interface PaginationConfig {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export const TRANSACTION_LABELS: Record<StockTransactionType, string> = {
  PURCHASE: "Purchase",
  RETURN_FROM_CUSTOMER: "Customer Return",
  ADJUSTMENT_IN: "Adjustment +",
  SALE: "Sale",
  DAMAGE: "Damage",
  RETURN_TO_SUPPLIER: "Supplier Return",
  ADJUSTMENT_OUT: "Adjustment -",
} as const;

export const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

export const DEFAULT_PAGE_SIZE = 10;

export type SortField =
  | "createdAt"
  | "productName"
  | "movementType"
  | "transactionType"
  | "quantity"
  | "previousQuantity"
  | "newQuantity";

export type SortDirection = "asc" | "desc";

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

export const SORT_FIELD_LABELS: Record<SortField, string> = {
  createdAt: "Date",
  productName: "Product",
  movementType: "Movement",
  transactionType: "Transaction",
  quantity: "Quantity",
  previousQuantity: "Before",
  newQuantity: "After",
};
