// src/store/hr/useHrStore.ts
import { create } from "zustand";
import { hrService } from "@/services/hr/hrService";
import type {
  LeaveType,
  LeaveBalance,
  LeaveRequest,
  LeaveStats,
  CreateLeaveRequestPayload,
  ProcessLeavePayload,
  AttendanceRecord,
  AttendanceToday,
  AttendanceStats,
  Payslip,
  GeneratePayslipPayload,
} from "@/types/hr-types";

interface HrState {
  // Leave
  leaveTypes: LeaveType[];
  leaveRequests: LeaveRequest[];
  myBalances: LeaveBalance[];
  leaveStats: LeaveStats | null;
  leaveMeta: any;

  // Attendance
  todayStatus: AttendanceToday | null;
  myAttendance: AttendanceRecord[];
  allAttendance: AttendanceRecord[];
  attendanceStats: AttendanceStats | null;
  attendanceMeta: any;

  // Payslips
  myPayslips: Payslip[];
  allPayslips: Payslip[];
  selectedPayslip: Payslip | null;
  payslipMeta: any;

  isLoading: boolean;
  error: string | null;

  // ── Leave Actions
  fetchLeaveTypes: () => Promise<void>;
  createLeaveType: (data: Partial<LeaveType>) => Promise<void>;
  updateLeaveType: (id: string, data: Partial<LeaveType>) => Promise<void>;
  deleteLeaveType: (id: string) => Promise<void>;
  fetchLeaveRequests: (filters?: any, page?: number) => Promise<void>;
  createLeaveRequest: (data: CreateLeaveRequestPayload) => Promise<void>;
  processLeaveRequest: (id: string, data: ProcessLeavePayload) => Promise<void>;
  cancelLeaveRequest: (id: string) => Promise<void>;
  fetchMyBalances: (year?: number) => Promise<void>;
  fetchAllBalances: (year?: number) => Promise<void>;
  fetchLeaveStats: (year?: number) => Promise<void>;

  // ── Attendance Actions
  clockIn: (notes?: string) => Promise<void>;
  clockOut: (notes?: string) => Promise<void>;
  fetchTodayStatus: () => Promise<void>;
  fetchMyAttendance: (month?: number, year?: number) => Promise<void>;
  fetchAllAttendance: (filters?: any, page?: number) => Promise<void>;
  createAttendance: (data: any) => Promise<void>;
  updateAttendance: (id: string, data: any) => Promise<void>;
  fetchAttendanceStats: (
    userId?: string,
    month?: number,
    year?: number,
  ) => Promise<void>;

  // ── Payslip Actions
  fetchMyPayslips: (year?: number) => Promise<void>;
  fetchAllPayslips: (filters?: any, page?: number) => Promise<void>;
  fetchPayslipById: (id: string) => Promise<void>;
  generatePayslip: (data: GeneratePayslipPayload) => Promise<Payslip>;
  updatePayslip: (id: string, data: any) => Promise<void>;
  markPayslipAsPaid: (id: string) => Promise<void>;
  deletePayslip: (id: string) => Promise<void>;

  clearError: () => void;
}

export const useHrStore = create<HrState>((set, get) => ({
  leaveTypes: [],
  leaveRequests: [],
  myBalances: [],
  leaveStats: null,
  leaveMeta: null,
  todayStatus: null,
  myAttendance: [],
  allAttendance: [],
  attendanceStats: null,
  attendanceMeta: null,
  myPayslips: [],
  allPayslips: [],
  selectedPayslip: null,
  payslipMeta: null,
  isLoading: false,
  error: null,

  // ════════════════════════════════════
  // LEAVE TYPES
  // ════════════════════════════════════
  fetchLeaveTypes: async () => {
    try {
      const types = await hrService.getLeaveTypes();
      // ✅ Guarantee it's always an array — never undefined/null
      set({ leaveTypes: Array.isArray(types) ? types : [] });
    } catch (err) {
      console.error("fetchLeaveTypes failed:", err);
      set({ leaveTypes: [] }); // ✅ Don't leave stale/undefined state
      throw err; // Re-throw so caller can handle
    }
  },

  createLeaveType: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await hrService.createLeaveType(data);
      await get().fetchLeaveTypes();
    } catch (err) {
      set({ error: (err as Error).message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  updateLeaveType: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      await hrService.updateLeaveType(id, data);
      await get().fetchLeaveTypes();
    } catch (err) {
      set({ error: (err as Error).message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteLeaveType: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await hrService.deleteLeaveType(id);
      // ✅ Optimistic update — remove from local state immediately
      set((s) => ({ leaveTypes: s.leaveTypes.filter((t) => t.id !== id) }));
    } catch (err) {
      set({ error: (err as Error).message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // ════════════════════════════════════
  // LEAVE REQUESTS
  // ════════════════════════════════════
  fetchLeaveRequests: async (filters, page = 1) => {
    set({ isLoading: true, error: null });
    try {
      const result = await hrService.getLeaveRequests(filters, page);
      set({
        leaveRequests: Array.isArray(result.data) ? result.data : [],
        leaveMeta: result.meta,
      });
    } catch (err) {
      set({ error: (err as Error).message, leaveRequests: [] });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  createLeaveRequest: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await hrService.createLeaveRequest(data);
      // Refresh both lists after creation
      await Promise.all([get().fetchLeaveRequests(), get().fetchMyBalances()]);
    } catch (err) {
      set({ error: (err as Error).message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  processLeaveRequest: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      await hrService.processLeaveRequest(id, data);
      await get().fetchLeaveRequests();
    } catch (err) {
      set({ error: (err as Error).message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  cancelLeaveRequest: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await hrService.cancelLeaveRequest(id);
      await Promise.all([get().fetchLeaveRequests(), get().fetchMyBalances()]);
    } catch (err) {
      set({ error: (err as Error).message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // ════════════════════════════════════
  // LEAVE BALANCES
  // ════════════════════════════════════
  fetchMyBalances: async (year) => {
    try {
      const balances = await hrService.getMyBalances(year);
      set({
        myBalances: (Array.isArray(balances) ? balances : []).map((b: any) => ({
          ...b,
          totalDays: Number(b.totalDays),
          usedDays: Number(b.usedDays),
        })),
      });
    } catch (err) {
      console.error("fetchMyBalances failed:", err);
      set({ myBalances: [] });
      throw err;
    }
  },

  fetchAllBalances: async (year) => {
    try {
      const balances = await hrService.getAllBalances(year);
      // Stored separately if needed by admin views
      set({ myBalances: Array.isArray(balances) ? balances : [] });
    } catch (err) {
      console.error("fetchAllBalances failed:", err);
      throw err;
    }
  },

  fetchLeaveStats: async (year) => {
    try {
      const stats = await hrService.getLeaveStats(year);
      set({ leaveStats: stats });
    } catch (err) {
      console.error("fetchLeaveStats failed:", err);
      throw err;
    }
  },

  // ════════════════════════════════════
  // ATTENDANCE
  // ════════════════════════════════════
  clockIn: async (notes) => {
    set({ isLoading: true, error: null });
    try {
      await hrService.clockIn(notes);
      await get().fetchTodayStatus();
    } catch (err) {
      set({ error: (err as Error).message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  clockOut: async (notes) => {
    set({ isLoading: true, error: null });
    try {
      await hrService.clockOut(notes);
      await get().fetchTodayStatus();
    } catch (err) {
      set({ error: (err as Error).message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchTodayStatus: async () => {
    try {
      const status = await hrService.getMyToday();
      set({ todayStatus: status });
    } catch (err) {
      console.error("fetchTodayStatus failed:", err);
      throw err;
    }
  },

  fetchMyAttendance: async (month, year) => {
    try {
      const records = await hrService.getMyAttendance(month, year);
      set({ myAttendance: Array.isArray(records) ? records : [] });
    } catch (err) {
      console.error("fetchMyAttendance failed:", err);
      set({ myAttendance: [] });
      throw err;
    }
  },

  fetchAllAttendance: async (filters, page = 1) => {
    set({ isLoading: true, error: null });
    try {
      const result = await hrService.getAllAttendance(filters, page);
      set({
        allAttendance: Array.isArray(result.data) ? result.data : [],
        attendanceMeta: result.meta,
      });
    } catch (err) {
      set({ error: (err as Error).message, allAttendance: [] });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  createAttendance: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await hrService.createAttendance(data);
      await get().fetchAllAttendance();
    } catch (err) {
      set({ error: (err as Error).message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  updateAttendance: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      await hrService.updateAttendance(id, data);
      await get().fetchAllAttendance();
    } catch (err) {
      set({ error: (err as Error).message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchAttendanceStats: async (userId, month, year) => {
    try {
      const stats = await hrService.getAttendanceStats(userId, month, year);
      set({ attendanceStats: stats });
    } catch (err) {
      console.error("fetchAttendanceStats failed:", err);
      throw err;
    }
  },

  // ════════════════════════════════════
  // PAYSLIPS
  // ════════════════════════════════════
  fetchMyPayslips: async (year) => {
    set({ isLoading: true, error: null });
    try {
      const payslips = await hrService.getMyPayslips(year);
      set({ myPayslips: Array.isArray(payslips) ? payslips : [] });
    } catch (err) {
      set({ error: (err as Error).message, myPayslips: [] });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchAllPayslips: async (filters, page = 1) => {
    set({ isLoading: true, error: null });
    try {
      const result = await hrService.getAllPayslips(filters, page);
      set({
        allPayslips: Array.isArray(result.data) ? result.data : [],
        payslipMeta: result.meta,
      });
    } catch (err) {
      set({ error: (err as Error).message, allPayslips: [] });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchPayslipById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const payslip = await hrService.getPayslipById(id);
      set({ selectedPayslip: payslip });
    } catch (err) {
      set({ error: (err as Error).message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  generatePayslip: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const payslip = await hrService.generatePayslip(data);
      await get().fetchAllPayslips();
      return payslip;
    } catch (err) {
      set({ error: (err as Error).message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  updatePayslip: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      await hrService.updatePayslip(id, data);
      await get().fetchAllPayslips();
    } catch (err) {
      set({ error: (err as Error).message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  markPayslipAsPaid: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await hrService.markPayslipAsPaid(id);
      // ✅ Optimistic update for instant UI feedback
      set((s) => ({
        allPayslips: s.allPayslips.map((p) =>
          p.id === id ? { ...p, status: "PAID" as const } : p,
        ),
      }));
      await get().fetchAllPayslips(); // Sync with server
    } catch (err) {
      set({ error: (err as Error).message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  deletePayslip: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await hrService.deletePayslip(id);
      set((s) => ({
        allPayslips: s.allPayslips.filter((p) => p.id !== id),
      }));
    } catch (err) {
      set({ error: (err as Error).message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
