// src/components/hr/staff/StaffHrDashboard.tsx

import { useLocation } from "react-router-dom";
import HrLayout from "@/components/hr/HrLayout";
import StaffLeavePanel from "./StaffLeavePanel";
import StaffAttendancePanel from "./StaffAttendancePanel";
import StaffPayslipPanel from "./StaffPayslipPanel";
import StaffOverviewPanel from "./StaffOverviewPanel";

export default function StaffHrDashboard() {
  const { pathname } = useLocation();

  const renderPanel = () => {
    if (pathname === "/hr/leave") return <StaffLeavePanel />;
    if (pathname === "/hr/attendance") return <StaffAttendancePanel />;
    if (pathname === "/hr/payslips") return <StaffPayslipPanel />;
    return <StaffOverviewPanel />;
  };

  const titles: Record<string, { title: string; subtitle: string }> = {
    "/hr/dashboard": {
      title: "My HR Portal",
      subtitle: "Your leave, attendance and payslip information",
    },
    "/hr/leave": {
      title: "My Leave",
      subtitle: "Manage your leave requests and balances",
    },
    "/hr/attendance": {
      title: "My Attendance",
      subtitle: "View your clock-in history and attendance summary",
    },
    "/hr/payslips": {
      title: "My Payslips",
      subtitle: "View and download your salary slips",
    },
  };

  const { title, subtitle } = titles[pathname] ?? titles["/hr/dashboard"];

  return (
    <HrLayout title={title} subtitle={subtitle}>
      {renderPanel()}
    </HrLayout>
  );
}
