// src/lib/types.ts

export type OrganizationType = "HOTEL" | "STORE" | "CLOTHING";
export type OrgType = "HOTEL" | "STORE" | "CLOTHING";

// ── Module types (must match backend enum exactly) ────────────────────────────
export type ModuleType =
  | "INVENTORY"
  | "SALES"
  | "PURCHASES"
  | "HOTEL_ROOMS"
  | "HOTEL_HOUSEKEEPING"
  | "HOTEL_INVENTORY"
  | "HR"
  | "HR_LEAVE"
  | "HR_ATTENDANCE"
  | "HR_PAYROLL"
  | "HOTEL_FNB"
  | "NOTIFICATIONS";

export interface OrganizationModule {
  id: string;
  module: ModuleType;
  isEnabled: boolean;
  enabledAt: string;
  disabledAt: string | null;
  config?: Record<string, unknown>;
}

export const BREAKPOINTS = {
  mobile: 640,
  tablet: 768,
  desktop: 1024,
} as const;
