// src/components/Sidebar.tsx
import { cn } from "@/lib/utils";
import { ChevronDown, LayoutDashboard } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { getFilteredNav, getOrgConfig, type NavItem } from "@/lib/Orgconfig";
import { useState, useEffect } from "react";
import { DEPARTMENT_LABELS } from "@/types/staff-types";

type SidebarProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

function isPathInSection(
  pathname: string,
  parentHref: string,
  children?: NavItem[],
): boolean {
  if (pathname === parentHref) return true;
  if (pathname.startsWith(parentHref + "/")) return true;
  if (!children?.length) return false;
  if (children.some((c) => pathname === c.href)) return true;
  if (children.some((c) => pathname.startsWith(c.href + "/"))) return true;
  const childBases = [
    ...new Set(children.map((c) => "/" + c.href.split("/").filter(Boolean)[0])),
  ];
  return childBases.some(
    (base) => pathname === base || pathname.startsWith(base + "/"),
  );
}

const Sidebar = ({ open, setOpen }: SidebarProps) => {
  const { pathname } = useLocation();
  const getActiveOrganization = useAuthStore((s) => s.getActiveOrganization);
  const getActiveRole = useAuthStore((s) => s.getActiveRole);
  const getActiveDepartment = useAuthStore((s) => s.getActiveDepartment);
  const getEnabledModules = useAuthStore((s) => s.getEnabledModules);

  const activeOrg = getActiveOrganization();
  const activeRole = getActiveRole();
  const activeDepartment = getActiveDepartment();
  const enabledModules = getEnabledModules(); // ← NEW

  const navItems: NavItem[] =
    activeOrg && activeRole
      ? getFilteredNav(
          activeOrg.type,
          activeRole,
          activeDepartment,
          enabledModules, // ← Pass modules
        )
      : [];

  const orgConfig = activeOrg ? getOrgConfig(activeOrg.type) : null;
  const isStaff = activeRole === "STAFF";

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-20 flex flex-col bg-white border-r",
        "border-slate-200 transition-all duration-300 ease-in-out hidden lg:flex",
        open ? "w-64" : "w-20",
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "flex items-center h-16 px-6 border-b border-slate-200 shrink-0",
          !open && "justify-center px-0",
        )}
      >
        <div
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center shadow-sm shrink-0",
            orgConfig ? orgConfig.accentColor : "bg-emerald-600",
          )}
        >
          {orgConfig ? (
            <orgConfig.icon className="text-white w-4 h-4" />
          ) : (
            <LayoutDashboard size={18} className="text-white" />
          )}
        </div>
        {open && (
          <div className="ml-3 min-w-0">
            <span className="block font-semibold text-slate-900 truncate">
              {activeOrg?.name ?? "Inventory"}
            </span>
            {orgConfig && (
              <span
                className={cn("block text-xs font-medium", orgConfig.color)}
              >
                {orgConfig.label}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Department indicator */}
      {open && isStaff && activeDepartment && (
        <div className="mx-3 mt-3 flex items-center gap-2 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500" />
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Department
            </p>
            <p className="text-xs font-medium text-slate-700 truncate">
              {DEPARTMENT_LABELS[activeDepartment] ?? activeDepartment}
            </p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            {open ? (
              <>
                <p className="text-sm font-medium text-slate-500">
                  No pages available
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Contact your admin for access.
                </p>
              </>
            ) : (
              <div className="h-5 w-5 rounded-full bg-slate-100" />
            )}
          </div>
        ) : (
          navItems.map((item) => (
            <NavItems
              key={item.href}
              to={item.href}
              icon={<item.icon className="w-5 h-5" />}
              label={item.label}
              pathname={pathname}
              open={open}
              children={item.children}
            />
          ))
        )}
      </nav>

      {/* Footer */}
      <div
        className={cn(
          "p-4 border-t border-slate-200 shrink-0",
          !open && "px-0 flex justify-center",
        )}
      >
        <button
          onClick={() => setOpen(!open)}
          aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
          className={cn(
            "flex items-center justify-center gap-2 px-4 py-2 text-sm",
            "text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg",
            "transition-colors",
            open ? "w-full" : "w-auto",
          )}
        >
          <svg
            className={cn(
              "w-5 h-5 transition-transform duration-300",
              open && "rotate-180",
            )}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 5l7 7-7 7M5 5l7 7-7 7"
            />
          </svg>
          {open && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
};

// ── NavItems (unchanged from your original) ───────────────────────────────────
type NavItemProps = {
  to: string;
  icon: React.ReactNode;
  label: string;
  end?: boolean;
  pathname: string;
  open: boolean;
  children?: NavItem[];
};

function NavItems({
  to,
  icon,
  label,
  end,
  pathname,
  open,
  children,
}: NavItemProps) {
  const isActive = children?.length
    ? isPathInSection(pathname, to, children)
    : pathname === to;

  const isChildActive =
    children?.some((child) => pathname === child.href) ?? false;

  const [expanded, setExpanded] = useState(isActive);

  useEffect(() => {
    if (isActive || isChildActive) setExpanded(true);
  }, [pathname, isActive, isChildActive]);

  if (children && children.length > 0) {
    return (
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className={cn(
            "group relative w-full flex items-center gap-3 px-3 py-2.5",
            "rounded-lg font-medium text-sm transition-all duration-200",
            isActive
              ? "bg-emerald-50 text-emerald-700"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
            !open && "justify-center",
          )}
        >
          {isActive && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-emerald-600 rounded-r-full" />
          )}
          <span className={cn("shrink-0", isActive && "scale-110")}>
            {icon}
          </span>
          {open && (
            <>
              <span className="flex-1 truncate text-left">{label}</span>
              <ChevronDown
                className={cn(
                  "w-4 h-4 transition-transform duration-200",
                  expanded && "rotate-180",
                )}
              />
            </>
          )}
          {!open && (
            <div className="absolute left-full ml-2 px-3 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap pointer-events-none z-50 shadow-lg">
              {label}
              <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-4 border-transparent border-r-slate-900" />
            </div>
          )}
        </button>

        {expanded && open && (
          <div className="ml-4 mt-1 space-y-1 border-l-2 border-slate-100 pl-3">
            {children.map((child) => (
              <NavItems
                key={child.href}
                to={child.href}
                icon={<child.icon className="w-4 h-4" />}
                label={child.label}
                pathname={pathname}
                open={open}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <NavLink
      to={to}
      end={end}
      className={cn(
        "group relative flex items-center gap-3 px-3 py-2.5 rounded-lg",
        "font-medium text-sm transition-all duration-200",
        isActive
          ? "bg-emerald-50 text-emerald-700"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
        !open && "justify-center",
      )}
    >
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-emerald-600 rounded-r-full" />
      )}
      <span className={cn("shrink-0", isActive && "scale-110")}>{icon}</span>
      {open && <span className="flex-1 truncate">{label}</span>}
      {!open && (
        <div className="absolute left-full ml-2 px-3 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap pointer-events-none z-50 shadow-lg">
          {label}
          <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-4 border-transparent border-r-slate-900" />
        </div>
      )}
    </NavLink>
  );
}

export default Sidebar;
