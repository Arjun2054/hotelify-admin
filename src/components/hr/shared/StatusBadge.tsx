// src/components/hr/shared/StatusBadge.tsx

import { cn } from "@/lib/utils";
import {
  LEAVE_STATUS_CONFIG,
  ATTENDANCE_STATUS_CONFIG,
  PAYSLIP_STATUS_CONFIG,
  type LeaveStatus,
  type AttendanceStatus,
  type PayslipStatus,
} from "@/types/hr-types";

interface LeaveStatusBadgeProps {
  status: LeaveStatus;
}
export function LeaveStatusBadge({ status }: LeaveStatusBadgeProps) {
  const config = LEAVE_STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        config.bgColor,
        config.color,
      )}
    >
      {config.label}
    </span>
  );
}

interface AttendanceStatusBadgeProps {
  status: AttendanceStatus;
}
export function AttendanceStatusBadge({ status }: AttendanceStatusBadgeProps) {
  const config = ATTENDANCE_STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        config.bgColor,
        config.color,
      )}
    >
      {config.label}
    </span>
  );
}

interface PayslipStatusBadgeProps {
  status: PayslipStatus;
}
export function PayslipStatusBadge({ status }: PayslipStatusBadgeProps) {
  const config = PAYSLIP_STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        config.bgColor,
        config.color,
      )}
    >
      {config.label}
    </span>
  );
}
