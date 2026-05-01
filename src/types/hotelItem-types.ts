// ═══════════════════════════════════════════════════════════
// Add these types to the existing types/index.ts file
// ═══════════════════════════════════════════════════════════

// ─── Unit ────────────────────────────────────────────────
export interface Unit {
  id: string;
  organizationId: string;
  name: string;
  abbreviation: string;
  createdAt: string;
  updatedAt: string;
  _count?: { hotelItems: number };
}

export interface CreateUnitPayload {
  name: string;
  abbreviation: string;
}

// ─── Category (reference from existing schema) ──────────
export interface Category {
  categoryId: string;
  name: string;
  description?: string | null;
  isActive: boolean;
}

// ─── Supplier (reference from existing schema) ──────────
export interface Supplier {
  supplierId: string;
  name: string;
  email?: string | null;
  phone?: string | null;
}

// ─── Hotel Item ──────────────────────────────────────────
export interface HotelItem {
  id: string;
  organizationId: string;
  categoryId: string;
  unitId: string;
  name: string;
  description: string | null;
  sku: string | null;
  barcode: string | null;
  stockQuantity: number;
  minimumStock: number;
  reorderPoint: number;
  costPrice: number;
  isActive: boolean;
  imageUrl: string | null;
  supplierId: string | null;
  createdAt: string;
  updatedAt: string;

  // Computed
  stockValue: number;
  isLowStock: boolean;
  isOutOfStock: boolean;

  // Relations
  category: { categoryId: string; name: string };
  unit: { id: string; name: string; abbreviation: string };
  supplier?: { supplierId: string; name: string } | null;
  _count?: { hotelStockMovements: number; roomItems: number };

  // Detail view
  roomItems?: {
    id: string;
    standardQty: number;
    room: { id: string; roomNumber: string; floor: number };
  }[];
  hotelStockMovements?: StockMovement[];
}

export interface CreateHotelItemPayload {
  categoryId: string;
  unitId: string;
  name: string;
  description?: string;
  sku?: string;
  barcode?: string;
  stockQuantity?: number;
  minimumStock?: number;
  reorderPoint?: number;
  costPrice?: number;
  imageUrl?: string;
  supplierId?: string;
}

export interface UpdateHotelItemPayload {
  categoryId?: string;
  unitId?: string;
  name?: string;
  description?: string;
  sku?: string;
  barcode?: string;
  minimumStock?: number;
  reorderPoint?: number;
  costPrice?: number;
  isActive?: boolean;
  imageUrl?: string;
  supplierId?: string;
}

export interface HotelItemFilters {
  categoryId?: string;
  supplierId?: string;
  isActive?: boolean | "";
  lowStock?: boolean;
  search?: string;
}

// ─── Stock Movement ──────────────────────────────────────
export type StockMovementType =
  | "STOCK_IN"
  | "STOCK_OUT"
  | "DAMAGE"
  | "TRANSFER"
  | "ADJUSTMENT"
  | "WASTAGE";

export interface StockMovement {
  id: string;
  organizationId: string;
  hotelItemId: string;
  userId: string;
  type: StockMovementType;
  quantity: number;
  previousStock: number;
  newStock: number;
  unitCost: number | null;
  referenceId: string | null;
  referenceType: string | null;
  notes: string | null;
  createdAt: string;

  hotelItem?: {
    id: string;
    name: string;
    sku: string | null;
    unit?: { abbreviation: string };
  };
  user?: { userId: string; name: string };
}

export interface CreateStockMovementPayload {
  hotelItemId: string;
  userId: string;
  type: StockMovementType;
  quantity: number;
  unitCost?: number;
  referenceId?: string;
  referenceType?: string;
  notes?: string;
}

export interface StockMovementFilters {
  hotelItemId?: string;
  type?: StockMovementType | "";
  dateFrom?: string;
  dateTo?: string;
}

// ─── Hotel Item Stats ────────────────────────────────────
export interface HotelItemStats {
  totalItems: number;
  activeItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  totalStockValue: number;
  categoriesCount: number;
}

// ─── Item Movement Summary ───────────────────────────────
export interface ItemMovementSummary {
  itemId: string;
  itemName: string;
  currentStock: number;
  movements: Record<string, { count: number; totalQuantity: number }>;
}

export interface RoomItem {
  id: string;
  roomId: string;
  hotelItemId: string;
  standardQty: number;
  organizationId: string;
  hotelItem: {
    id: string;
    name: string;
    unit: { id: string; name: string; abbreviation: string };
    category: { id: string; name: string };
  };
}

export interface AddRoomItemPayload {
  hotelItemId: string;
  standardQty: number;
}
