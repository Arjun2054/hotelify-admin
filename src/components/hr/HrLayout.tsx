// src/components/hr/HrLayout.tsx

import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CalendarRange,
  Clock,
  FileText,
  Users,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

interface HrTab {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
}

const HR_TABS: HrTab[] = [
  {
    label: "Overview",
    href: "/hr/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Leave",
    href: "/hr/leave",
    icon: CalendarRange,
  },
  {
    label: "Attendance",
    href: "/hr/attendance",
    icon: Clock,
  },
  {
    label: "Payslips",
    href: "/hr/payslips",
    icon: FileText,
  },
];

interface HrLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function HrLayout({
  children,
  title,
  subtitle,
  actions,
}: HrLayoutProps) {
  const { pathname } = useLocation();
  const getActiveRole = useAuthStore((s) => s.getActiveRole);
  const role = getActiveRole();
  const isAdmin = role === "OWNER" || role === "ADMIN";

  const visibleTabs = HR_TABS.filter((tab) => !tab.adminOnly || isAdmin);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-0">
          {/* Title Row */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 shrink-0" />
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                  Human Resources
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 truncate">
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">
                  {subtitle}
                </p>
              )}
            </div>

            {/* Actions */}
            {actions && (
              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                {actions}
              </div>
            )}
          </div>

          {/* Tab Navigation */}
          <nav
            className="flex gap-0.5 sm:gap-1 -mb-px overflow-x-auto 
                        scrollbar-none scroll-smooth"
            aria-label="HR Navigation"
          >
            {visibleTabs.map((tab) => {
              const isActive = pathname === tab.href;
              return (
                <NavLink
                  key={tab.href}
                  to={tab.href}
                  className={cn(
                    `flex items-center gap-1.5 sm:gap-2 
                     px-3 sm:px-4 py-2.5 sm:py-3 
                     text-xs sm:text-sm font-medium 
                     border-b-2 transition-colors whitespace-nowrap
                     focus-visible:outline-none focus-visible:ring-2 
                     focus-visible:ring-emerald-500 focus-visible:ring-offset-1`,
                    isActive
                      ? "border-emerald-600 text-emerald-700"
                      : `border-transparent text-slate-500 
                         hover:text-slate-700 hover:border-slate-300`,
                  )}
                >
                  <tab.icon
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0"
                    aria-hidden="true"
                  />
                  {/* Hide label on very small screens, show icon only */}
                  <span className="hidden min-[360px]:inline">{tab.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Page Content */}
      <div className="p-4 sm:p-6">{children}</div>
    </div>
  );
}
