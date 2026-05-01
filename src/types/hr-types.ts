// src/types/hr-types.ts

// ── Leave ───────────────────────────────────────────
export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export interface LeaveType {
  id: string;
  name: string;
  description?: string;
  daysPerYear: number;
  isPaid: boolean;
  isActive: boolean;
  color?: string;
}

export interface LeaveBalance {
  id: string;
  userId: string;
  leaveTypeId: string;
  year: number;
  totalDays: number;
  usedDays: number;
  leaveType: { id: string; name: string; color?: string; isPaid: boolean };
}

export interface LeaveRequest {
  id: string;
  userId: string;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: LeaveStatus;
  approvedAt?: string;
  rejectedReason?: string;
  createdAt: string;
  user: { userId: string; name: string; email?: string };
  leaveType: { id: string; name: string; color?: string };
  approvedBy?: { name: string };
}

export interface CreateLeaveRequestPayload {
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  reason: string;
}

export interface ProcessLeavePayload {
  status: "APPROVED" | "REJECTED";
  rejectedReason?: string;
}

export interface LeaveStats {
  totalRequests: number;
  pending: number;
  approved: number;
  rejected: number;
  byType: { typeId: string; typeName: string; count: number }[];
}

// ── Attendance ──────────────────────────────────────
export type AttendanceStatus =
  | "PRESENT"
  | "ABSENT"
  | "HALF_DAY"
  | "LATE"
  | "ON_LEAVE";

export interface AttendanceRecord {
  id: string;
  userId: string;
  date: string;
  clockIn?: string;
  clockOut?: string;
  breakMinutes: number;
  totalHours?: number;
  overtime: number;
  status: AttendanceStatus;
  lateMinutes: number;
  notes?: string;
  user?: { userId: string; name: string; email?: string };
}

export interface AttendanceToday {
  hasClockedIn: boolean;
  hasClockedOut: boolean;
  record: AttendanceRecord | null;
}

export interface AttendanceStats {
  totalDays: number;
  present: number;
  absent: number;
  late: number;
  halfDay: number;
  onLeave: number;
  totalHours: number;
  totalOvertime: number;
  averageHoursPerDay: number;
}

export interface AttendanceFilters {
  userId?: string;
  status?: AttendanceStatus;
  dateFrom?: string;
  dateTo?: string;
}

// ── Payslip ─────────────────────────────────────────
export type PayslipStatus = "DRAFT" | "GENERATED" | "PAID";

export interface PayslipItem {
  id?: string;
  label: string;
  type: "ALLOWANCE" | "DEDUCTION";
  amount: number;
}

export interface Payslip {
  id: string;
  userId: string;
  month: number;
  year: number;
  basicSalary: number;
  totalAllowances: number;
  totalDeductions: number;
  grossPay: number;
  netPay: number;
  workingDays: number;
  presentDays: number;
  absentDays: number;
  leaveDays: number;
  overtimeHours: number;
  status: PayslipStatus;
  paidAt?: string;
  notes?: string;
  createdAt: string;
  user: { userId: string; name: string; email?: string };
  generatedBy?: { name: string };
  items: PayslipItem[];
}

export interface GeneratePayslipPayload {
  userId: string;
  month: number;
  year: number;
  basicSalary: number;
  items?: PayslipItem[];
  notes?: string;
}

export interface PayslipFilters {
  userId?: string;
  month?: number;
  year?: number;
  status?: PayslipStatus;
}

// ── Status configs ──────────────────────────────────
export const LEAVE_STATUS_CONFIG: Record<
  LeaveStatus,
  { label: string; color: string; bgColor: string }
> = {
  PENDING: {
    label: "Pending",
    color: "text-amber-700",
    bgColor: "bg-amber-100",
  },
  APPROVED: {
    label: "Approved",
    color: "text-emerald-700",
    bgColor: "bg-emerald-100",
  },
  REJECTED: { label: "Rejected", color: "text-red-700", bgColor: "bg-red-100" },
  CANCELLED: {
    label: "Cancelled",
    color: "text-gray-700",
    bgColor: "bg-gray-100",
  },
};

export const ATTENDANCE_STATUS_CONFIG: Record<
  AttendanceStatus,
  { label: string; color: string; bgColor: string }
> = {
  PRESENT: {
    label: "Present",
    color: "text-emerald-700",
    bgColor: "bg-emerald-100",
  },
  ABSENT: { label: "Absent", color: "text-red-700", bgColor: "bg-red-100" },
  HALF_DAY: {
    label: "Half Day",
    color: "text-amber-700",
    bgColor: "bg-amber-100",
  },
  LATE: { label: "Late", color: "text-orange-700", bgColor: "bg-orange-100" },
  ON_LEAVE: {
    label: "On Leave",
    color: "text-blue-700",
    bgColor: "bg-blue-100",
  },
};

export const PAYSLIP_STATUS_CONFIG: Record<
  PayslipStatus,
  { label: string; color: string; bgColor: string }
> = {
  DRAFT: { label: "Draft", color: "text-gray-700", bgColor: "bg-gray-100" },
  GENERATED: {
    label: "Generated",
    color: "text-blue-700",
    bgColor: "bg-blue-100",
  },
  PAID: { label: "Paid", color: "text-emerald-700", bgColor: "bg-emerald-100" },
};

export interface BalanceRecord {
  id: string;
  userId: string;
  leaveTypeId: string;
  year: number;
  totalDays: number;
  usedDays: number;
  user: {
    userId: string;
    name: string;
    email?: string;
  };
  leaveType: {
    id: string;
    name: string;
    color?: string;
  };
}

export interface UserBalanceGroup {
  user: BalanceRecord["user"];
  balances: BalanceRecord[];
}
