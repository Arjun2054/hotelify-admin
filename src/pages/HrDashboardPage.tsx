// src/pages/HrDashboardPage.tsx

import { lazy, Suspense } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

const AdminHrDashboard = lazy(
  () => import("@/components/hr/admin/AdminHrDashboard"),
);
const StaffHrDashboard = lazy(
  () => import("@/components/hr/staff/StaffHrDashboard"),
);

export default function HrDashboardPage() {
  const getActiveRole = useAuthStore((s) => s.getActiveRole);
  const role = getActiveRole();
  const isAdmin = role === "OWNER" || role === "ADMIN";

  return (
    <Suspense fallback={<LoadingSpinner />}>
      {isAdmin ? <AdminHrDashboard /> : <StaffHrDashboard />}
    </Suspense>
  );
}
