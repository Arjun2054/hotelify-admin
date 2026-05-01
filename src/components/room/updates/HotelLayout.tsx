// src/components/layout/HotelLayout.tsx
import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  BedDouble,
  Users,
  Package,
  Hotel,
  Bell,
  Menu,
  ChevronRight,
  Settings,
  LogOut,
  Sun,
  Moon,
  User,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRoomStore } from "@/store/room/useRoomStore";

const NAV_ITEMS = [
  {
    to: "/hotel",
    label: "Dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    to: "/room",
    label: "Rooms",
    icon: BedDouble,
  },
  {
    to: "/hotel/guests",
    label: "Active Guests",
    icon: Users,
  },
  {
    to: "/hotel/inventory",
    label: "Inventory",
    icon: Package,
  },
] as const;

function NavItem({
  item,
  badge,
  onClick,
}: {
  item: (typeof NAV_ITEMS)[number];
  badge?: number;
  onClick?: () => void;
}) {
  return (
    <NavLink
      to={item.to}
      end={"exact" in item ? item.exact : false}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
          isActive
            ? "bg-primary/10 text-primary dark:bg-primary/20"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        )
      }
    >
      {({ isActive }) => (
        <>
          <item.icon
            className={cn(
              "h-4 w-4 flex-shrink-0",
              isActive ? "text-primary" : "text-muted-foreground",
            )}
          />
          <span className="flex-1">{item.label}</span>
          {badge !== undefined && badge > 0 && (
            <Badge className="h-5 min-w-5 rounded-full px-1 text-[10px]">
              {badge}
            </Badge>
          )}
          {isActive && <ChevronRight className="h-3.5 w-3.5 text-primary/60" />}
        </>
      )}
    </NavLink>
  );
}

function SidebarContent({ onNavClick }: { onNavClick?: () => void }) {
  const { stats } = useRoomStore();

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-4 border-b">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary">
          <Hotel className="h-4.5 w-4.5 text-primary-foreground" />
        </div>
        <div>
          <p className="font-bold text-sm leading-tight">HotelManager</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Operations
          </p>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavItem
              key={item.to}
              item={item}
              badge={
                item.label === "Active Guests" ? stats?.occupied : undefined
              }
              onClick={onNavClick}
            />
          ))}
        </div>

        <Separator className="my-2" />

        {/* Quick Stats */}
        {stats && (
          <div className="px-3 pb-3 space-y-1">
            <p className="px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground py-1">
              Quick Stats
            </p>
            {[
              {
                label: "Available",
                value: stats.available,
                color: "bg-emerald-500",
              },
              {
                label: "Occupied",
                value: stats.occupied,
                color: "bg-blue-500",
              },
              {
                label: "Cleaning",
                value: stats.cleaning,
                color: "bg-amber-500",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs"
              >
                <div
                  className={cn(
                    "h-2 w-2 rounded-full flex-shrink-0",
                    stat.color,
                  )}
                />
                <span className="text-muted-foreground flex-1">
                  {stat.label}
                </span>
                <span className="font-semibold tabular-nums">{stat.value}</span>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Bottom actions */}
    </div>
  );
}

export function HotelLayout() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const location = useLocation();

  const crumbs = [
    "Hotel",
    ...location.pathname
      .split("/")
      .filter(Boolean)
      .slice(1)
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1)),
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-60 flex-col border-r bg-card">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar via Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="left" className="p-0 w-60">
          <SidebarContent onNavClick={() => setSheetOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex h-16 flex-shrink-0 items-center justify-between border-b bg-card px-4">
          <div className="flex items-center gap-3">
            {/* Mobile menu trigger */}
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
            </Sheet>

            {/* Breadcrumb */}
            <div className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground">
              {crumbs.map((crumb, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  {i > 0 && <ChevronRight className="h-3.5 w-3.5" />}
                  <span
                    className={cn(
                      i === crumbs.length - 1 &&
                        "font-semibold text-foreground",
                    )}
                  >
                    {crumb}
                  </span>
                </span>
              ))}
            </div>

            {/* Mobile: just show current page */}
            <p className="font-semibold text-sm sm:hidden">
              {crumbs[crumbs.length - 1]}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive" />
            </Button>

            {/* User dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full h-8 w-8 bg-primary/10 hover:bg-primary/20"
                >
                  <span className="text-xs font-bold text-primary">A</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2">
                  <User className="h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive">
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
