import {
  Hotel,
  ShoppingBag,
  Package,
  LayoutDashboard,
  BoxesIcon,
  Tags,
  Truck,
  BedDouble,
  CalendarRange,
  BarChart3,
  Users,
  Shirt,
  Settings,
  ArrowUpDown,
  ClipboardList,
  Bell,
  Clock,
  FileText,
  Utensils,
} from "lucide-react";
import type { OrganizationType } from "./types";
import type { StaffDepartment } from "@/types/staff-types";
import type { ModuleType } from "@/types/organization_module";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
  departments?: StaffDepartment[];
  // Which module must be enabled for this nav item to appear
  requiredModule?: ModuleType;
  badge?: string;
  children?: NavItem[];
}

export interface OrgConfig {
  type: OrganizationType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  accentColor: string;
  navItems: NavItem[];
  features: string[];
  templateDescription: string;
}

export const ORG_CONFIGS: Record<OrganizationType, OrgConfig> = {
  HOTEL: {
    type: "HOTEL",
    label: "Hotel / Resort",
    description: "Room management, bookings, housekeeping & amenities",
    icon: Hotel,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    accentColor: "bg-amber-600",
    templateDescription:
      "Manage rooms, reservations, guest check-ins, and hotel supplies",
    features: ["rooms", "bookings", "amenities", "housekeeping", "inventory"],
    navItems: [
      {
        label: "Dashboard",
        href: "/overallanalytics",
        icon: LayoutDashboard,
        roles: ["OWNER", "ADMIN"],
      },
      {
        label: "Rooms",
        href: "/room",
        icon: BedDouble,
        roles: ["OWNER", "ADMIN", "STAFF"],
        departments: ["FRONT_DESK"],
        requiredModule: "HOTEL_ROOMS", // ← module gate
        children: [
          { label: "Overview", href: "/room/dashboard", icon: LayoutDashboard },
          { label: "Rooms", href: "/room", icon: BedDouble },
          { label: "Room Types", href: "/room/room-types", icon: BedDouble },
        ],
      },
      {
        label: "F&B Management",
        href: "/fnb",
        icon: Utensils,
        roles: ["OWNER", "ADMIN", "STAFF"],
        departments: ["KITCHEN", "FRONT_DESK"],
        requiredModule: "HOTEL_FNB",
        children: [
          {
            label: "Overview",
            href: "/fnb",
            icon: LayoutDashboard,
          },
          { label: "Menus", href: "/fnb/menus", icon: Package },
          {
            label: "Category and Dietary ",
            href: "/fnb/settings",
            icon: Settings,
          },
        ],
      },
      {
        label: "Inventory",
        href: "/hotel-items",
        icon: BoxesIcon,
        roles: ["OWNER", "ADMIN", "STAFF"],
        departments: ["KITCHEN", "GENERAL"],
        requiredModule: "HOTEL_INVENTORY", // ← module gate
        children: [
          {
            label: "Overview",
            href: "/hotel/inventory-analytics",
            icon: LayoutDashboard,
          },
          { label: "Items", href: "/hotel-items", icon: Package },
          { label: "Units", href: "/units", icon: Tags },
          { label: "Categories", href: "/dashboard/categories", icon: Tags },
          { label: "Suppliers", href: "/dashboard/suppliers", icon: Truck },
          {
            label: "Stock Movements",
            href: "/hotel-stock-movements",
            icon: ArrowUpDown,
          },
        ],
      },
      {
        label: "Housekeeping",
        href: "/housekeeping/tasks",
        icon: ClipboardList,
        roles: ["OWNER", "ADMIN", "STAFF"],
        departments: ["HOUSEKEEPING"],
        requiredModule: "HOTEL_HOUSEKEEPING", // ← module gate
        children: [
          { label: "Tasks", href: "/housekeeping/tasks", icon: ClipboardList },
        ],
      },
      {
        label: "HR",
        href: "/hr/dashboard",
        icon: Users,
        roles: ["OWNER", "ADMIN", "STAFF"],
        // HR is visible if ANY HR module is enabled
        // (we handle this with a special "anyModule" below)
        requiredModule: "HR_LEAVE",
        children: [
          { label: "Overview", href: "/hr/dashboard", icon: LayoutDashboard },
          {
            label: "Leave",
            href: "/hr/leave",
            icon: CalendarRange,
            requiredModule: "HR_LEAVE",
          } as NavItem,
          {
            label: "Attendance",
            href: "/hr/attendance",
            icon: Clock,
            requiredModule: "HR_ATTENDANCE",
          } as NavItem,
          {
            label: "Payslips",
            href: "/hr/payslips",
            icon: FileText,
            requiredModule: "HR_PAYROLL",
          } as NavItem,
        ],
      },
      {
        label: "Notifications",
        href: "/notifications",
        icon: Bell,
        roles: ["OWNER", "ADMIN", "STAFF"],
        requiredModule: "NOTIFICATIONS",
      },
      {
        label: "Team",
        href: "/staff",
        icon: Users,
        roles: ["OWNER", "ADMIN"],
      },
      {
        label: "Settings",
        href: "/settings/modules",
        icon: Settings,
        roles: ["OWNER"],
      },
    ],
  },

  STORE: {
    type: "STORE",
    label: "Store / Shop",
    description: "Product inventory, stock tracking & supplier management",
    icon: ShoppingBag,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    accentColor: "bg-emerald-600",
    templateDescription:
      "Track products, manage stock levels, and monitor sales",
    features: ["products", "suppliers", "stock-movements", "reports"],
    navItems: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      {
        label: "Products",
        href: "/dashboard/products",
        icon: Package,
        requiredModule: "INVENTORY",
      },
      {
        label: "Categories",
        href: "/dashboard/categories",
        icon: Tags,
        requiredModule: "INVENTORY",
      },
      {
        label: "Suppliers",
        href: "/dashboard/suppliers",
        icon: Truck,
        requiredModule: "INVENTORY",
      },
      {
        label: "Stock Movements",
        href: "/dashboard/movements",
        icon: ArrowUpDown,
        requiredModule: "INVENTORY",
      },
      {
        label: "Sales",
        href: "/dashboard/sales",
        icon: BarChart3,
        requiredModule: "SALES",
      },
      {
        label: "Purchases",
        href: "/dashboard/purchases",
        icon: Truck,
        requiredModule: "PURCHASES",
      },
      {
        label: "HR",
        href: "/hr/dashboard",
        icon: Users,
        requiredModule: "HR_LEAVE",
        children: [
          { label: "Overview", href: "/hr/dashboard", icon: LayoutDashboard },
          {
            label: "Leave",
            href: "/hr/leave",
            icon: CalendarRange,
            requiredModule: "HR_LEAVE",
          } as NavItem,
          {
            label: "Attendance",
            href: "/hr/attendance",
            icon: Clock,
            requiredModule: "HR_ATTENDANCE",
          } as NavItem,
          {
            label: "Payslips",
            href: "/hr/payslips",
            icon: FileText,
            requiredModule: "HR_PAYROLL",
          } as NavItem,
        ],
      },
      {
        label: "Team",
        href: "/staff",
        icon: Users,
        roles: ["OWNER", "ADMIN"],
      },
      {
        label: "Settings",
        href: "/settings/modules",
        icon: Settings,
        roles: ["OWNER"],
      },
    ],
  },

  CLOTHING: {
    type: "CLOTHING",
    label: "Clothing / Fashion",
    description: "Garment inventory, size variants, collections & trends",
    icon: Shirt,
    color: "text-pink-600",
    bgColor: "bg-pink-50",
    accentColor: "bg-pink-600",
    templateDescription:
      "Manage clothing collections, size/color variants, and seasonal inventory",
    features: ["garments", "variants", "collections", "sizes", "suppliers"],
    navItems: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      {
        label: "Products",
        href: "/dashboard/products",
        icon: Shirt,
        requiredModule: "INVENTORY",
      },
      {
        label: "Categories",
        href: "/dashboard/categories",
        icon: Tags,
        requiredModule: "INVENTORY",
      },
      {
        label: "Suppliers",
        href: "/dashboard/suppliers",
        icon: Truck,
        requiredModule: "INVENTORY",
      },
      {
        label: "Stock Movements",
        href: "/dashboard/movements",
        icon: ArrowUpDown,
        requiredModule: "INVENTORY",
      },
      {
        label: "Sales",
        href: "/dashboard/sales",
        icon: BarChart3,
        requiredModule: "SALES",
      },
      {
        label: "HR",
        href: "/hr/dashboard",
        icon: Users,
        requiredModule: "HR_LEAVE",
        children: [
          { label: "Overview", href: "/hr/dashboard", icon: LayoutDashboard },
          {
            label: "Leave",
            href: "/hr/leave",
            icon: CalendarRange,
            requiredModule: "HR_LEAVE",
          } as NavItem,
          {
            label: "Attendance",
            href: "/hr/attendance",
            icon: Clock,
            requiredModule: "HR_ATTENDANCE",
          } as NavItem,
          {
            label: "Payslips",
            href: "/hr/payslips",
            icon: FileText,
            requiredModule: "HR_PAYROLL",
          } as NavItem,
        ],
      },
      {
        label: "Team",
        href: "/staff",
        icon: Users,
        roles: ["OWNER", "ADMIN"],
      },
      {
        label: "Settings",
        href: "/settings/modules",
        icon: Settings,
        roles: ["OWNER"],
      },
    ],
  },
};

export function getOrgConfig(type: OrganizationType): OrgConfig {
  return ORG_CONFIGS[type];
}

// ── HR parent visibility: show if ANY HR sub-module is enabled ────────────────
const HR_MODULES: ModuleType[] = ["HR_LEAVE", "HR_ATTENDANCE", "HR_PAYROLL"];

function isItemVisible(
  item: NavItem,
  role: string,
  department: StaffDepartment | null | undefined,
  enabledModules: ModuleType[],
): boolean {
  // 1. Role check
  if (item.roles && !item.roles.includes(role)) return false;

  // 2. Department check (STAFF only)
  if (role === "STAFF" && item.departments) {
    if (department && !item.departments.includes(department)) return false;
  }

  // 3. Module check
  if (item.requiredModule) {
    // Special case: HR parent → visible if ANY HR module is enabled
    const isHrParent = HR_MODULES.includes(item.requiredModule as ModuleType);
    if (isHrParent) {
      const anyHrEnabled = HR_MODULES.some((m) => enabledModules.includes(m));
      if (!anyHrEnabled) return false;
    } else {
      if (!enabledModules.includes(item.requiredModule)) return false;
    }
  }

  return true;
}

export function getFilteredNav(
  type: OrganizationType,
  role: string,
  department?: StaffDepartment | null,
  enabledModules: ModuleType[] = [],
): NavItem[] {
  const config = ORG_CONFIGS[type];

  return config.navItems
    .filter((item) => isItemVisible(item, role, department, enabledModules))
    .map((item) => {
      // Filter children too
      if (!item.children?.length) return item;

      const filteredChildren = item.children.filter((child) =>
        isItemVisible(child, role, department, enabledModules),
      );

      return { ...item, children: filteredChildren };
    })
    .filter((item) => {
      // Remove parent items that have children defined but all children
      // were filtered out (except items with no children defined at all)
      if (item.children !== undefined && item.children.length === 0) {
        return false;
      }
      return true;
    });
}
