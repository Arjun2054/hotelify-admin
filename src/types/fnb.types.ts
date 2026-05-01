export const FNB_SERVICE_DEFINITIONS = [
  {
    type: "RESTAURANT",
    label: "Restaurant",
    icon: "🍽️",
    description: "Full-service dining with table service and à la carte menus.",
    color: {
      gradient: "from-orange-50 to-amber-50",
      border: "border-orange-200",
      ring: "ring-orange-300",
      badge: "bg-orange-100 text-orange-700",
      icon: "bg-orange-100",
    },
  },
  {
    type: "BUFFET",
    label: "Buffet",
    icon: "🥘",
    description: "Self-service dining with a wide spread of dishes.",
    color: {
      gradient: "from-green-50 to-emerald-50",
      border: "border-green-200",
      ring: "ring-green-300",
      badge: "bg-green-100 text-green-700",
      icon: "bg-green-100",
    },
  },
  {
    type: "BAR",
    label: "Bar",
    icon: "🍸",
    description: "Beverages, cocktails, and light bites for socialising.",
    color: {
      gradient: "from-purple-50 to-violet-50",
      border: "border-purple-200",
      ring: "ring-purple-300",
      badge: "bg-purple-100 text-purple-700",
      icon: "bg-purple-100",
    },
  },
  {
    type: "LOUNGE",
    label: "Lounge",
    icon: "🛋️",
    description: "Relaxed seating with snacks and beverages for guests.",
    color: {
      gradient: "from-blue-50 to-sky-50",
      border: "border-blue-200",
      ring: "ring-blue-300",
      badge: "bg-blue-100 text-blue-700",
      icon: "bg-blue-100",
    },
  },
  {
    type: "ROOM_SERVICE",
    label: "Room Service",
    icon: "🛎️",
    description: "In-room dining delivered directly to guests, 24/7.",
    color: {
      gradient: "from-yellow-50 to-amber-50",
      border: "border-yellow-200",
      ring: "ring-yellow-300",
      badge: "bg-yellow-100 text-yellow-700",
      icon: "bg-yellow-100",
    },
  },
  {
    type: "BANQUET",
    label: "Banquet",
    icon: "🎉",
    description: "Large-scale event catering for weddings and conferences.",
    color: {
      gradient: "from-pink-50 to-rose-50",
      border: "border-pink-200",
      ring: "ring-pink-300",
      badge: "bg-pink-100 text-pink-700",
      icon: "bg-pink-100",
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

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
