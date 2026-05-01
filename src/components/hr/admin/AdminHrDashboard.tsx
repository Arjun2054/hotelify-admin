// src/components/hr/admin/AdminHrDashboard.tsx

import { useLocation } from "react-router-dom";
import HrLayout from "@/components/hr/HrLayout";
import AdminLeavePanel from "./AdminLeavePanel";
import AdminAttendancePanel from "./AdminAttendancePanel";
import AdminPayslipPanel from "./AdminPayslipPanel";
import AdminOverviewPanel from "./AdminOverviewPanel";

export default function AdminHrDashboard() {
  const { pathname } = useLocation();

  const renderPanel = () => {
    if (pathname === "/hr/leave") return <AdminLeavePanel />;
    if (pathname === "/hr/attendance") return <AdminAttendancePanel />;
    if (pathname === "/hr/payslips") return <AdminPayslipPanel />;
    return <AdminOverviewPanel />;
  };

  const titles: Record<string, { title: string; subtitle: string }> = {
    "/hr/dashboard": {
      title: "HR Dashboard",
      subtitle: "Overview of your team's HR metrics",
    },
    "/hr/leave": {
      title: "Leave Management",
      subtitle: "Review and process staff leave requests",
    },
    "/hr/attendance": {
      title: "Attendance",
      subtitle: "Track and manage team attendance records",
    },
    "/hr/payslips": {
      title: "Payslips",
      subtitle: "Generate and manage staff payslips",
    },
  };

  const { title, subtitle } = titles[pathname] ?? titles["/hr/dashboard"];

  return (
    <HrLayout title={title} subtitle={subtitle}>
      {renderPanel()}
    </HrLayout>
  );
}
