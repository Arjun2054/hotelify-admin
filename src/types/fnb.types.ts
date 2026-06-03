export const FNB_SERVICE_DEFINITIONS = [
  {
    type: "RESTAURANT",
    label: "Restaurant",
    icon: "🍽️",
    description: "Full-service dining with table service and à la carte menus.",
    color: {
      gradient: "from-slate-50 to-stone-50",
      border: "border-stone-200",
      ring: "ring-stone-300",
      badge: "bg-stone-100 text-stone-700",
      icon: "bg-stone-100",
    },
  },
  {
    type: "BUFFET",
    label: "Buffet",
    icon: "🥘",
    description: "Self-service dining with a wide spread of dishes.",
    color: {
      gradient: "from-slate-50 to-stone-50",
      border: "border-stone-200",
      ring: "ring-stone-300",
      badge: "bg-stone-100 text-stone-700",
      icon: "bg-stone-100",
    },
  },
  {
    type: "BAR",
    label: "Bar",
    icon: "🍸",
    description: "Beverages, cocktails, and light bites for socialising.",
    color: {
      gradient: "from-slate-50 to-stone-50",
      border: "border-stone-200",
      ring: "ring-stone-300",
      badge: "bg-stone-100 text-stone-700",
      icon: "bg-stone-100",
    },
  },
  {
    type: "LOUNGE",
    label: "Lounge",
    icon: "🛋️",
    description: "Relaxed seating with snacks and beverages for guests.",
    color: {
      gradient: "from-slate-50 to-stone-50",
      border: "border-stone-200",
      ring: "ring-stone-300",
      badge: "bg-stone-100 text-stone-700",
      icon: "bg-stone-100",
    },
  },
  {
    type: "ROOM_SERVICE",
    label: "Room Service",
    icon: "🛎️",
    description: "In-room dining delivered directly to guests, 24/7.",
    color: {
      gradient: "from-slate-50 to-stone-50",
      border: "border-stone-200",
      ring: "ring-stone-300",
      badge: "bg-stone-100 text-stone-700",
      icon: "bg-stone-100",
    },
  },
  {
    type: "BANQUET",
    label: "Banquet",
    icon: "🎉",
    description: "Large-scale event catering for weddings and conferences.",
    color: {
      gradient: "from-slate-50 to-stone-50",
      border: "border-stone-200",
      ring: "ring-stone-300",
      badge: "bg-stone-100 text-stone-700",
      icon: "bg-stone-100",
    },
  },
] as const;

export type FnbServiceType = (typeof FNB_SERVICE_DEFINITIONS)[number]["type"];

export function getServiceDef(type: string) {
  return (
    FNB_SERVICE_DEFINITIONS.find((d) => d.type === type) ??
    FNB_SERVICE_DEFINITIONS[0]
  );
}

export interface OrganizationFnbServiceRow {
  id: string;
  organizationId: string;
  type: string; // "RESTAURANT" | "BUFFET" | etc.
  name: string; // ✅ lives directly on this row now
  description: string | null;
  icon: string | null; // ✅ lives directly on this row now
  status: "ACTIVE" | "INACTIVE" | "TEMPORARILY_CLOSED";
  isEnabled: boolean;
  config: Record<string, unknown> | null;
  enabledAt: string;
  disabledAt: string | null;
  menuCount: number;
  menus: { id: string; name: string; status: string }[];
}

// What the backend returns per service type (created + uncreated)
export interface OrgFnbServiceEntry {
  type: string;
  defaultLabel: string;
  defaultIcon: string;
  defaultDescription: string;
  orgService: OrganizationFnbServiceRow | null; // null = not yet created
  isCreated: boolean;
  isEnabled: boolean;
}

// ── MenuFnbService join row ────────────────────────────────────────────────────

export interface MenuFnbServiceRow {
  id: string;
  menuId: string;
  organizationFnbServiceId: string;
  displayOrder: number;
  // ✅ organizationFnbService is the flat row — NO nested fnbService
  organizationFnbService: OrganizationFnbServiceRow;
}

export interface Menu {
  id: string;
  name: string;
  description?: string;
  status: "ACTIVE" | "INACTIVE" | "ARCHIVED";
  isActive: boolean;
  coverImage?: string;
  displayOrder: number;
  availableFrom?: string;
  availableTo?: string;
  availableDays: string[];
  fnbServices: MenuFnbServiceRow[]; // ✅ flat, no fnbService nesting
  sections?: MenuSection[];
  items?: MenuItem[];
  _count?: { items: number; sections: number };
  createdAt: string;
  updatedAt: string;
}

export interface MenuSection {
  id: string;
  menuId: string;
  name: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
  items?: MenuItem[];
  _count?: { items: number };
}

export interface MenuCategory {
  id: string;
  name: string;
  type: string;
  icon?: string;
  color?: string;
  displayOrder: number;
  isActive: boolean;
  isSystem: boolean;
  _count?: { menuItems: number };
}

/// ----- DietaryTag -----------------------------------------

export interface DietaryTag {
  id: string;
  name: string;
  shortName?: string;
  type: string;
  icon?: string;
  color?: string;
  displayOrder: number;
  isActive: boolean;
  isSystem: boolean;
  _count?: { menuItems: number };
}

/// ----- MenuItem -----------------------------------------

export interface MenuItem {
  id: string;
  menuId: string;
  sectionId?: string;
  menuCategoryId?: string;
  name: string;
  description?: string;
  price: string;
  discountPrice?: string;
  status: "AVAILABLE" | "OUT_OF_STOCK" | "DISCONTINUED";
  imageUrl?: string;
  preparationTime?: number;
  calories?: number;
  allergens: string[];
  isSignature: boolean;
  isFeatured: boolean;
  displayOrder: number;
  sku?: string;
  menuCategory?: MenuCategory;
  section?: MenuSection;
  dietaryTags?: { dietaryTag: DietaryTag }[];
  createdAt: string;
  updatedAt: string;
}

/// ----- Order ---------------------------------------------

export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  type: string;
  totalAmount: number;
  customerName?: string;
  table?: { tableNumber: string };
  items: OrderItem[];
  orderedAt: string;
  estimatedReadyAt?: string;
}

interface OrderItem {
  id: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: string;
  specialInstructions?: string;
}

// ------------ Kitchen Orders ----------------------------

export interface KitchenTicket {
  id: string;
  ticketNumber: string;
  status: string;
  priority: string;
  receivedAt: string;
  order: {
    orderNumber: string;
    table?: { tableNumber: string };
    type: string;
  };
  items: {
    id: string;
    quantity: number;
    status: string;
    orderItem: {
      itemName: string;
      specialInstructions?: string;
      menuItem: { name: string; preparationTime?: number };
    };
  }[];
  kitchenStation?: { name: string; displayColor?: string };
}

export interface Analytics {
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
  ordersByType: { type: string; _count: number }[];
  ordersByStatus: { status: string; _count: number }[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
