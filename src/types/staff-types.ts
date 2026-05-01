// ═══════════════════════════════════════════════════════════
// STAFF TYPES
// ═══════════════════════════════════════════════════════════

export type MemberRole = "OWNER" | "ADMIN" | "STAFF";

export type StaffDepartment =
  | "HOUSEKEEPING"
  | "FRONT_DESK"
  | "KITCHEN"
  | "MAINTENANCE"
  | "GENERAL";

export const DEPARTMENT_LABELS: Record<StaffDepartment, string> = {
  HOUSEKEEPING: "Housekeeping",
  FRONT_DESK: "Front Desk",
  KITCHEN: "Kitchen",
  MAINTENANCE: "Maintenance",
  GENERAL: "General",
};

export const ALL_DEPARTMENTS: StaffDepartment[] = [
  "HOUSEKEEPING",
  "FRONT_DESK",
  "KITCHEN",
  "MAINTENANCE",
  "GENERAL",
];
export interface StaffMember {
  membershipId: string;
  organizationId: string;
  userId: string;
  role: MemberRole;
  department?: StaffDepartment | null;
  jobTitle?: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    userId: string;
    name: string;
    email: string;
    createdAt: string;
  };
  _count: {
    housekeepingLogs: number;
    stockMovements: number;
  };
}

export interface CreateStaffPayload {
  name: string;
  email: string;
  password: string;
  role: MemberRole;
  department?: StaffDepartment;
  jobTitle?: string;
}

export interface UpdateStaffPayload {
  name?: string;
  email?: string;
  role?: MemberRole;
  department?: StaffDepartment | null;
  jobTitle?: string | null;
}

export interface StaffFilters {
  role?: MemberRole | "";
  department?: StaffDepartment;
  search?: string;
}

export interface StaffStats {
  total: number;
  owners: number;
  admins: number;
  staff: number;
  byDepartment: Record<string, number>;
}

export interface StaffActivity {
  type: "HOUSEKEEPING" | "STOCK_MOVEMENT";
  id: string;
  description: string;
  timestamp: string;
  meta?: Record<string, unknown>;
}
