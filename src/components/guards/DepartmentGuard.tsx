// src/components/guards/DepartmentGuard.tsx

import { useAuthStore } from "@/store/useAuthStore";
import type { StaffDepartment } from "@/types/staff-types";
import { ShieldX } from "lucide-react";

interface Props {
  allowedDepartments: StaffDepartment[];
  children: React.ReactNode;
}

/**
 * Wraps a page/section so that STAFF members
 * outside the listed departments see an access-denied message.
 * OWNER / ADMIN always pass through.
 * STAFF with no department set also pass through (backward compat).
 */
export function DepartmentGuard({ allowedDepartments, children }: Props) {
  const role = useAuthStore((s) => s.getActiveRole());
  const department = useAuthStore((s) => s.getActiveDepartment());

  // Non-staff bypass
  if (role !== "STAFF") return <>{children}</>;

  // Staff with no department → allow (backward compat)
  if (!department) return <>{children}</>;

  // Staff with matching department → allow
  if (allowedDepartments.includes(department)) {
    return <>{children}</>;
  }

  // Blocked
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <ShieldX className="mb-4 h-12 w-12 text-muted-foreground" />
      <h2 className="text-xl font-semibold">Access Restricted</h2>
      <p className="mt-2 max-w-md text-muted-foreground">
        This section is available to{" "}
        {allowedDepartments
          .map((d) => d.replace("_", " ").toLowerCase())
          .join(", ")}{" "}
        staff only. Contact your admin if you need access.
      </p>
    </div>
  );
}
