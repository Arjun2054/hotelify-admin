export type RoomStatus =
  | "AVAILABLE"
  | "OCCUPIED"
  | "CLEANING"
  | "MAINTENANCE"
  | "OUT_OF_ORDER";
export type HousekeepingStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "INSPECTED";

// ─── Room Type ───────────────────────────────────────────
export interface RoomType {
  id: string;
  name: string;
  description?: string;
  basePrice: string | number;
  maxOccupancy: number;
  amenities: string[];
  createdAt: string;
  updatedAt: string;
  roomCount?: number;
  _count?: { rooms: number };
  rooms?: { status: RoomStatus }[];
}

export interface CreateRoomTypePayload {
  name: string;
  description?: string;
  basePrice: number;
  maxOccupancy: number;
  amenities?: string[];
}

// ─── Room ────────────────────────────────────────────────
export interface Room {
  id: string;
  organizationId: string;
  roomTypeId: string;
  roomNumber: string;
  floor: number;
  status: RoomStatus;
  isCorner: boolean;
  isAccessible: boolean;
  viewType: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  roomType: {
    id: string;
    name: string;
    basePrice: number;
    maxOccupancy: number;
  };
  currentGuest: RoomAssignment | null;
  roomItems?: RoomItem[];
}

export interface CreateRoomPayload {
  roomTypeId: string;
  roomNumber: string;
  floor: number;
  status?: RoomStatus;
  isCorner?: boolean;
  isAccessible?: boolean;
  viewType?: string;
  notes?: string;
}
// ─── Room Assignment ─────────────────────────────────────
export interface RoomAssignment {
  id: string;
  roomId: string;
  guestName: string;
  guestEmail: string | null;
  checkIn: string;
  checkOut: string | null;
  notes: string | null;
  createdAt: string;
}

export interface CheckInPayload {
  guestName: string;
  guestEmail?: string;
  checkIn: string;
  notes?: string;
}

// export interface HousekeepingLog {
//   id: string;
//   organizationId: string;
//   roomId: string;
//   userId: string;
//   status: HousekeepingStatus;
//   scheduledAt: string;
//   startedAt?: string;
//   completedAt?: string;
//   notes?: string;
//   damageNotes?: string;
//   createdAt: string;
//   updatedAt: string;
//   room?: Room;
//   user?: { name: string; email: string };
//   itemsUsed?: HousekeepingItem[];
// }

// export interface HousekeepingItem {
//   id: string;
//   housekeepingLogId: string;
//   itemId: string;
//   quantityUsed: number;
//   isDamaged: boolean;
//   damageNotes?: string;
// }

// ─── Room Stats ──────────────────────────────────────────
export interface RoomStats {
  total: number;
  available: number;
  occupied: number;
  cleaning: number;
  maintenance: number;
  outOfOrder: number;
  occupancyRate: number;
}

// ─── Room Filters ────────────────────────────────────────
export interface RoomFilters {
  status?: RoomStatus | "";
  roomTypeId?: string;
  floor?: number | "";
  search?: string;
}

export interface RoomItem {
  id: string;
  roomId: string;
  hotelItemId: string;
  standardQty: number;
  hotelItem?: {
    name: string;
    stockQuantity: number;
    unit?: { abbreviation: string };
  };
}

export interface RoomTypeStats {
  id: string;
  name: string;
  totalRooms: number;
  available: number;
  occupied: number;
  cleaning: number;
  maintenance: number;
  basePrice: string | number;
  occupancyRate: number;
}

export interface PaginatedResult<T> {
  rooms: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Form types
export interface CreateRoomTypeForm {
  name: string;
  description: string;
  basePrice: number;
  maxOccupancy: number;
  amenities: string[];
}

export interface CreateRoomForm {
  roomTypeId: string;
  roomNumber: string;
  floor: number;
  status: RoomStatus;
  isCorner: boolean;
  isAccessible: boolean;
  viewType: string;
  notes: string;
}

export interface RoomFilters {
  status?: RoomStatus | "";
  floor?: number | "";
  roomTypeId?: string;
  viewType?: string;
}

// ── Units ─────────────────────────────────────────────────
export interface Unit {
  id: string;
  organizationId: string;
  name: string;
  abbreviation: string;
  createdAt: string;
  updatedAt: string;
  _count?: { hotelItems: number };
}

export interface CreateUnitForm {
  name: string;
  abbreviation: string;
}

// ── Hotel Items ───────────────────────────────────────────
export type StockMovementType =
  | "STOCK_IN"
  | "STOCK_OUT"
  | "DAMAGE"
  | "TRANSFER"
  | "ADJUSTMENT"
  | "WASTAGE";

export interface HotelItem {
  id: string;
  organizationId: string;
  categoryId: string;
  supplierId: string;
  unitId: string;
  name: string;
  description?: string;
  sku?: string;
  barcode?: string;
  stockQuantity: string | number;
  minimumStock: string | number;
  reorderPoint: string | number;
  costPrice: string | number;
  isActive: boolean;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  category?: { name: string; categoryId: string };
  supplier?: { name: string; supplierId: string };
  unit?: { name: string; abbreviation: string; id: string };
  _count?: { hotelStockMovements: number; roomItems: number };
  hotelStockMovements?: HotelStockMovement[];
  roomItems?: RoomItem[];
}

export interface HotelStockMovement {
  id: string;
  organizationId: string;
  hotelItemId: string;
  userId: string;
  type: StockMovementType;
  quantity: string | number;
  previousStock: string | number;
  newStock: string | number;
  unitCost?: string | number;
  referenceId?: string;
  referenceType?: string;
  notes?: string;
  createdAt: string;
  hotelItem?: { name: string; sku?: string };
  user?: { name: string };
}

export interface InventorySummary {
  totalItems: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalInventoryValue: number;
  byCategory: Record<string, number>;
}

export interface HotelItemFilters {
  categoryId?: string;
  supplierId?: string;
  unitId?: string;
  search?: string;
  lowStock?: boolean;
  isActive?: boolean;
}

export interface CreateHotelItemForm {
  categoryId: string;
  supplierId: string;
  unitId: string;
  name: string;
  description: string;
  sku: string;
  barcode: string;
  minimumStock: number;
  reorderPoint: number;
  costPrice: number;
  imageUrl: string;
}

export interface StockAdjustmentForm {
  type: StockMovementType;
  quantity: number;
  // userId: string;
  unitCost?: number;
  notes?: string;
}

export interface PaginatedItemResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
