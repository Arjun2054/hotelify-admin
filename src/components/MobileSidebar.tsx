import { cn } from "@/lib/utils";
import {
  BarChart3,
  FolderTree,
  LayoutDashboard,
  Package,
  Truck,
  User,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const navigationItems = [
  {
    to: "/dashboard",
    icon: <LayoutDashboard size={20} />,
    label: "Dashboard",
    end: true,
  },
  {
    to: "/dashboard/account",
    icon: <User size={20} />,
    label: "Account",
  },
  {
    to: "/dashboard/products",
    icon: <Package size={20} />,
    label: "Products",
  },
  {
    to: "/dashboard/stock",
    icon: <BarChart3 size={20} />,
    label: "Stock",
  },
  {
    to: "/dashboard/categories",
    icon: <FolderTree size={20} />,
    label: "Categories",
  },
  {
    to: "/dashboard/suppliers",
    icon: <Truck size={20} />,
    label: "Suppliers",
  },
];

interface MobileSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileSidebar({ open, onOpenChange }: MobileSidebarProps) {
  const { pathname } = useLocation();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-70 sm:w-[320px] p-0">
        <SheetHeader className="p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm">
              <LayoutDashboard
                size={18}
                className="text-white"
                strokeWidth={2.5}
              />
            </div>
            <SheetTitle className="text-lg font-semibold text-slate-900">
              Inventory
            </SheetTitle>
          </div>
        </SheetHeader>

        <nav className="flex flex-col gap-1 p-4">
          {navigationItems.map((item) => {
            const isActive = pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => onOpenChange(false)}
                className={cn(
                  "relative flex items-center gap-3 px-3 py-3 rounded-lg font-medium text-base transition-all duration-200",
                  isActive
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                )}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-emerald-600 rounded-r-full" />
                )}

                {/* Icon */}
                <span className={cn("shrink-0", isActive && "scale-110")}>
                  {item.icon}
                </span>

                {/* Label */}
                <span className="flex-1">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
