// src/services/hr/hrService.ts

import adminApi from "@/lib/config";
import { authService } from "../authService";
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
  AttendanceFilters,
  Payslip,
  GeneratePayslipPayload,
  PayslipFilters,
} from "@/types/hr-types";
import type { ApiResponse, PaginatedResponseApi } from "@/lib/types";

class HrService {
  private baseUrl = "/hr";

  private getHeaders() {
    const orgId = authService.getActiveOrganizationId();
    if (!orgId) throw new Error("No active organization");
    return { "X-Organization-Id": orgId };
  }

  // ═══ LEAVE TYPES ══════════════════════════════════
  async getLeaveTypes(): Promise<LeaveType[]> {
    const res = await adminApi.get<ApiResponse<LeaveType[]>>(
      `${this.baseUrl}/leave/types`,
      { headers: this.getHeaders() },
    );
    return res.data.data;
  }

  async createLeaveType(data: Partial<LeaveType>): Promise<LeaveType> {
    const res = await adminApi.post<ApiResponse<LeaveType>>(
      `${this.baseUrl}/leave/types`,
      data,
      { headers: this.getHeaders() },
    );
    return res.data.data;
  }

  async updateLeaveType(
    id: string,
    data: Partial<LeaveType>,
  ): Promise<LeaveType> {
    const res = await adminApi.put<ApiResponse<LeaveType>>(
      `${this.baseUrl}/leave/types/${id}`,
      data,
      { headers: this.getHeaders() },
    );
    return res.data.data;
  }

  async deleteLeaveType(id: string): Promise<void> {
    await adminApi.delete(`${this.baseUrl}/leave/types/${id}`, {
      headers: this.getHeaders(),
    });
  }

  // ═══ LEAVE REQUESTS ═══════════════════════════════
  async getLeaveRequests(filters?: Record<string, any>, page = 1) {
    const params = new URLSearchParams({ page: String(page) });
    if (filters)
      Object.entries(filters).forEach(([k, v]) => {
        if (v) params.set(k, String(v));
      });
    const res = await adminApi.get<PaginatedResponseApi<LeaveRequest>>(
      `${this.baseUrl}/leave/requests?${params}`,
      { headers: this.getHeaders() },
    );
    return { data: res.data.data, meta: res.data.meta };
  }

  async createLeaveRequest(
    data: CreateLeaveRequestPayload,
  ): Promise<LeaveRequest> {
    const res = await adminApi.post<ApiResponse<LeaveRequest>>(
      `${this.baseUrl}/leave/requests`,
      data,
      { headers: this.getHeaders() },
    );
    return res.data.data;
  }

  async processLeaveRequest(
    id: string,
    data: ProcessLeavePayload,
  ): Promise<LeaveRequest> {
    const res = await adminApi.patch<ApiResponse<LeaveRequest>>(
      `${this.baseUrl}/leave/requests/${id}/process`,
      data,
      { headers: this.getHeaders() },
    );
    return res.data.data;
  }

  async cancelLeaveRequest(id: string): Promise<LeaveRequest> {
    const res = await adminApi.patch<ApiResponse<LeaveRequest>>(
      `${this.baseUrl}/leave/requests/${id}/cancel`,
      {},
      { headers: this.getHeaders() },
    );
    return res.data.data;
  }

  // ═══ LEAVE BALANCES ═══════════════════════════════
  async getMyBalances(year?: number): Promise<LeaveBalance[]> {
    const params = year ? `?year=${year}` : "";
    const res = await adminApi.get<ApiResponse<LeaveBalance[]>>(
      `${this.baseUrl}/leave/my-balances${params}`,
      { headers: this.getHeaders() },
    );
    return res.data.data;
  }

  async getAllBalances(year?: number) {
    const params = year ? `?year=${year}` : "";
    const res = await adminApi.get<ApiResponse<any[]>>(
      `${this.baseUrl}/leave/balances${params}`,
      { headers: this.getHeaders() },
    );
    return res.data.data;
  }

  async getLeaveStats(year?: number): Promise<LeaveStats> {
    const params = year ? `?year=${year}` : "";
    const res = await adminApi.get<ApiResponse<LeaveStats>>(
      `${this.baseUrl}/leave/stats${params}`,
      { headers: this.getHeaders() },
    );
    return res.data.data;
  }

  async initBalances(userId: string, year: number) {
    const res = await adminApi.post<ApiResponse<any>>(
      `${this.baseUrl}/leave/balances/init`,
      { userId, year },
      { headers: this.getHeaders() },
    );
    return res.data.data;
  }

  async adjustBalance(balanceId: string, totalDays: number) {
    const res = await adminApi.patch<ApiResponse<any>>(
      `${this.baseUrl}/leave/balances/${balanceId}/adjust`,
      { totalDays },
      { headers: this.getHeaders() },
    );
    return res.data.data;
  }

  // ═══ ATTENDANCE ═══════════════════════════════════
  async clockIn(notes?: string) {
    const res = await adminApi.post<ApiResponse<AttendanceRecord>>(
      `${this.baseUrl}/attendance/clock-in`,
      { notes },
      { headers: this.getHeaders() },
    );
    return res.data.data;
  }

  async clockOut(notes?: string) {
    const res = await adminApi.post<ApiResponse<AttendanceRecord>>(
      `${this.baseUrl}/attendance/clock-out`,
      { notes },
      { headers: this.getHeaders() },
    );
    return res.data.data;
  }

  async getMyToday(): Promise<AttendanceToday> {
    const res = await adminApi.get<ApiResponse<AttendanceToday>>(
      `${this.baseUrl}/attendance/my-today`,
      { headers: this.getHeaders() },
    );
    return res.data.data;
  }

  async getMyAttendance(
    month?: number,
    year?: number,
  ): Promise<AttendanceRecord[]> {
    const params = new URLSearchParams();
    if (month) params.set("month", String(month));
    if (year) params.set("year", String(year));
    const res = await adminApi.get<ApiResponse<AttendanceRecord[]>>(
      `${this.baseUrl}/attendance/my-history?${params}`,
      { headers: this.getHeaders() },
    );
    return res.data.data;
  }

  async getAllAttendance(filters?: AttendanceFilters, page = 1) {
    const params = new URLSearchParams({ page: String(page) });
    if (filters)
      Object.entries(filters).forEach(([k, v]) => {
        if (v) params.set(k, String(v));
      });
    const res = await adminApi.get<PaginatedResponseApi<AttendanceRecord>>(
      `${this.baseUrl}/attendance?${params}`,
      { headers: this.getHeaders() },
    );
    return { data: res.data.data, meta: res.data.meta };
  }

  async createAttendance(data: any) {
    const res = await adminApi.post<ApiResponse<AttendanceRecord>>(
      `${this.baseUrl}/attendance`,
      data,
      { headers: this.getHeaders() },
    );
    return res.data.data;
  }

  async updateAttendance(id: string, data: any) {
    const res = await adminApi.put<ApiResponse<AttendanceRecord>>(
      `${this.baseUrl}/attendance/${id}`,
      data,
      { headers: this.getHeaders() },
    );
    return res.data.data;
  }

  async getAttendanceStats(userId?: string, month?: number, year?: number) {
    const params = new URLSearchParams();
    if (userId) params.set("userId", userId);
    if (month) params.set("month", String(month));
    if (year) params.set("year", String(year));
    const res = await adminApi.get<ApiResponse<AttendanceStats>>(
      `${this.baseUrl}/attendance/stats?${params}`,
      { headers: this.getHeaders() },
    );
    return res.data.data;
  }

  // ═══ PAYSLIPS ═════════════════════════════════════
  async getMyPayslips(year?: number): Promise<Payslip[]> {
    const params = year ? `?year=${year}` : "";
    const res = await adminApi.get<ApiResponse<Payslip[]>>(
      `${this.baseUrl}/payslips/mine${params}`,
      { headers: this.getHeaders() },
    );
    return res.data.data;
  }

  async getAllPayslips(filters?: PayslipFilters, page = 1) {
    const params = new URLSearchParams({ page: String(page) });
    if (filters)
      Object.entries(filters).forEach(([k, v]) => {
        if (v) params.set(k, String(v));
      });
    const res = await adminApi.get<PaginatedResponseApi<Payslip>>(
      `${this.baseUrl}/payslips?${params}`,
      { headers: this.getHeaders() },
    );
    return { data: res.data.data, meta: res.data.meta };
  }

  async getPayslipById(id: string): Promise<Payslip> {
    const res = await adminApi.get<ApiResponse<Payslip>>(
      `${this.baseUrl}/payslips/${id}`,
      { headers: this.getHeaders() },
    );
    return res.data.data;
  }

  async generatePayslip(data: GeneratePayslipPayload): Promise<Payslip> {
    const res = await adminApi.post<ApiResponse<Payslip>>(
      `${this.baseUrl}/payslips`,
      data,
      { headers: this.getHeaders() },
    );
    return res.data.data;
  }

  async updatePayslip(id: string, data: any): Promise<Payslip> {
    const res = await adminApi.put<ApiResponse<Payslip>>(
      `${this.baseUrl}/payslips/${id}`,
      data,
      { headers: this.getHeaders() },
    );
    return res.data.data;
  }

  async markPayslipAsPaid(id: string): Promise<Payslip> {
    const res = await adminApi.patch<ApiResponse<Payslip>>(
      `${this.baseUrl}/payslips/${id}/pay`,
      {},
      { headers: this.getHeaders() },
    );
    return res.data.data;
  }

  async deletePayslip(id: string): Promise<void> {
    await adminApi.delete(`${this.baseUrl}/payslips/${id}`, {
      headers: this.getHeaders(),
    });
  }
}

export const hrService = new HrService();
