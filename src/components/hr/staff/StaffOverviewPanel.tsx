// src/components/hr/staff/StaffOverviewPanel.tsx

import { useEffect } from "react";
import { useHrStore } from "@/store/hr/useHrStore";
import { useAuthStore } from "@/store/useAuthStore";
import SectionCard from "@/components/hr/shared/SectionCard";
import ClockWidget from "./ClockWidget";
import { LeaveStatusBadge } from "@/components/hr/shared/StatusBadge";
import PayslipDetailModal from "@/components/hr/shared/PayslipDetailModal";
import { useState } from "react";
import type { Payslip } from "@/types/hr-types";
import {
  CalendarRange,
  Clock,
  FileText,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Wallet,
  Activity,
  BadgeCheck,
  DollarSign,
  Timer,
} from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function StaffOverviewPanel() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const {
    myBalances,
    leaveRequests,
    myPayslips,
    myAttendance,
    attendanceStats,
    todayStatus,
    fetchMyBalances,
    fetchLeaveRequests,
    fetchMyPayslips,
    fetchTodayStatus,
    fetchMyAttendance,
    fetchAttendanceStats,
  } = useHrStore();

  const [viewPayslip, setViewPayslip] = useState<Payslip | null>(null);

  useEffect(() => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    fetchMyBalances(year);
    fetchLeaveRequests({}, 1);
    fetchMyPayslips(year);
    fetchTodayStatus();
    fetchMyAttendance(month, year);
    if (user?.userId) {
      fetchAttendanceStats(user.userId, month, year);
    }
  }, [user?.userId]);

  // ── Derived ──────────────────────────────────────────
  const pendingRequests = leaveRequests.filter(
    (r) => r.status === "PENDING",
  ).length;
  const approvedRequests = leaveRequests.filter(
    (r) => r.status === "APPROVED",
  ).length;

  const totalRemainingDays = myBalances.reduce(
    (sum, b) => sum + (b.totalDays - b.usedDays),
    0,
  );

  const latestPayslip = myPayslips[0];
  const totalEarned = myPayslips
    .filter((p) => p.status === "PAID")
    .reduce((s, p) => s + Number(p.netPay ?? 0), 0);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  // ── Attendance for the week (last 5 records) ─────────
  const recentAttendance = myAttendance.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* ── Hero welcome banner ───────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 rounded-2xl p-6 text-white">
        {/* Decorative blobs */}
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-teal-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative">
          <p className="text-emerald-100 text-sm font-medium mb-0.5">
            {greeting} 👋
          </p>
          <h1 className="text-2xl font-bold tracking-tight">
            {user?.name ?? "Welcome"}
          </h1>
          <p className="text-emerald-200 text-sm mt-0.5">
            {format(new Date(), "EEEE, MMMM d, yyyy")}
          </p>
        </div>

        {/* Quick numbers */}
        <div className="relative mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: "Leave Balance",
              value: `${totalRemainingDays.toFixed(0)}d`,
              sub: "remaining",
              icon: CalendarRange,
            },
            {
              label: "Pending Requests",
              value: pendingRequests,
              sub: "awaiting approval",
              icon: Timer,
            },
            {
              label: "Approved Leave",
              value: approvedRequests,
              sub: "this year",
              icon: BadgeCheck,
            },
            {
              label: "Total Earned",
              value: `$${totalEarned.toLocaleString()}`,
              sub: "paid payslips",
              icon: Wallet,
            },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className="flex items-center gap-3 bg-white/10 border border-white/15 rounded-xl px-4 py-3 backdrop-blur-sm"
            >
              <div className="p-2 bg-white/10 rounded-lg shrink-0">
                <kpi.icon className="w-4 h-4 text-emerald-100" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-emerald-200 truncate">{kpi.label}</p>
                <p className="text-lg font-bold text-white leading-tight">
                  {kpi.value}
                </p>
                <p className="text-xs text-emerald-300">{kpi.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Top row: Clock widget + Leave balances ─────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Clock widget */}
        <ClockWidget todayStatus={todayStatus} />

        {/* Leave balances */}
        <div className="lg:col-span-2">
          <SectionCard
            title="My Leave Balances"
            subtitle={`${new Date().getFullYear()} allocations`}
            actions={
              <button
                onClick={() => navigate("/hr/leave")}
                className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
              >
                Request leave <ArrowRight className="w-3.5 h-3.5" />
              </button>
            }
          >
            {myBalances.length === 0 ? (
              <div className="flex flex-col items-center py-6 text-center">
                <CalendarRange className="w-8 h-8 text-slate-200 mb-2" />
                <p className="text-sm text-slate-400">No balances found</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {myBalances.map((b) => {
                  const remaining = b.totalDays - b.usedDays;
                  const pct =
                    b.totalDays > 0
                      ? Math.min(
                          100,
                          Math.round((b.usedDays / b.totalDays) * 100),
                        )
                      : 0;
                  return (
                    <div
                      key={b.id}
                      className="bg-slate-50 border border-slate-200 rounded-xl p-3.5"
                    >
                      <div className="flex items-center gap-1.5 mb-2">
                        {b.leaveType?.color && (
                          <div
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: b.leaveType.color }}
                          />
                        )}
                        <p className="text-xs font-semibold text-slate-600 truncate">
                          {b.leaveType?.name}
                        </p>
                      </div>
                      <p className="text-2xl font-black text-slate-900">
                        {remaining}
                      </p>
                      <p className="text-xs text-slate-400 mb-2">
                        of {b.totalDays} days remaining
                      </p>
                      <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            pct > 80
                              ? "bg-rose-400"
                              : pct > 50
                                ? "bg-amber-400"
                                : "bg-emerald-400"
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        {b.usedDays} used
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>
        </div>
      </div>

      {/* ── Middle row: Attendance stats + Monthly summary ─ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly attendance summary */}
        <SectionCard
          title="This Month's Attendance"
          subtitle={`${MONTHS[new Date().getMonth()]} ${new Date().getFullYear()}`}
          actions={
            <button
              onClick={() => navigate("/hr/attendance")}
              className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
            >
              Full history <ArrowRight className="w-3.5 h-3.5" />
            </button>
          }
        >
          {!attendanceStats ? (
            <div className="flex flex-col items-center py-6 text-center">
              <Clock className="w-8 h-8 text-slate-200 mb-2" />
              <p className="text-sm text-slate-400">No data yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Big numbers */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    label: "Present",
                    value: attendanceStats.present,
                    cls: "text-emerald-600",
                    bg: "bg-emerald-50",
                  },
                  {
                    label: "Absent",
                    value: attendanceStats.absent,
                    cls: "text-rose-500",
                    bg: "bg-rose-50",
                  },
                  {
                    label: "Late",
                    value: attendanceStats.late,
                    cls: "text-amber-600",
                    bg: "bg-amber-50",
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className={`${s.bg} rounded-xl p-3 text-center`}
                  >
                    <p className="text-xs text-slate-500 mb-0.5">{s.label}</p>
                    <p className={`text-2xl font-black ${s.cls}`}>{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Hours row */}
              <div className="grid grid-cols-3 gap-3 pt-1">
                {[
                  {
                    label: "Total Hours",
                    value: `${attendanceStats.totalHours?.toFixed(0) ?? 0}h`,
                  },
                  {
                    label: "Overtime",
                    value: `${attendanceStats.totalOvertime?.toFixed(1) ?? 0}h`,
                  },
                  {
                    label: "Avg/Day",
                    value: `${attendanceStats.averageHoursPerDay?.toFixed(1) ?? 0}h`,
                  },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="text-xs text-slate-400">{s.label}</p>
                    <p className="text-base font-bold text-slate-800 mt-0.5">
                      {s.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </SectionCard>

        {/* Recent attendance history */}
        <SectionCard
          title="Recent Attendance"
          subtitle="Last 5 days"
          actions={
            <button
              onClick={() => navigate("/hr/attendance")}
              className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </button>
          }
          noPadding
        >
          {recentAttendance.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-center px-4">
              <Clock className="w-8 h-8 text-slate-200 mb-2" />
              <p className="text-sm text-slate-400">No records yet</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentAttendance.map((rec) => (
                <div
                  key={rec.id}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/60 transition-colors"
                >
                  {/* Day */}
                  <div className="w-10 text-center shrink-0">
                    <p className="text-base font-bold text-slate-800">
                      {format(new Date(rec.date), "d")}
                    </p>
                    <p className="text-xs text-slate-400">
                      {format(new Date(rec.date), "EEE")}
                    </p>
                  </div>

                  {/* Times */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-mono text-slate-700">
                      {rec.clockIn
                        ? format(new Date(rec.clockIn), "HH:mm")
                        : "—"}{" "}
                      →{" "}
                      {rec.clockOut
                        ? format(new Date(rec.clockOut), "HH:mm")
                        : "—"}
                    </p>
                    {rec.totalHours != null && (
                      <p className="text-xs text-slate-400">
                        {Number(rec.totalHours).toFixed(1)}h worked
                        {Number(rec.overtime) > 0 && (
                          <span className="text-violet-500 ml-1">
                            +{Number(rec.overtime).toFixed(1)}h OT
                          </span>
                        )}
                      </p>
                    )}
                  </div>

                  {/* Status */}
                  <AttendanceStatusBadgeLocal status={rec.status} />
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      {/* ── Bottom row: Leave requests + Payslips ────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent leave requests */}
        <SectionCard
          title="My Leave Requests"
          subtitle={`${leaveRequests.length} total this year`}
          actions={
            <button
              onClick={() => navigate("/hr/leave")}
              className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
            >
              Manage <ArrowRight className="w-3.5 h-3.5" />
            </button>
          }
          noPadding
        >
          {leaveRequests.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-center px-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                <CheckCircle2 className="w-6 h-6 text-slate-300" />
              </div>
              <p className="text-sm font-semibold text-slate-600">
                No leave requests
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Submit your first request from the Leave tab
              </p>
              <button
                onClick={() => navigate("/hr/leave")}
                className="mt-3 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
              >
                Request leave
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {leaveRequests.slice(0, 5).map((req) => (
                <div
                  key={req.id}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/60 transition-colors"
                >
                  {req.leaveType?.color && (
                    <div
                      className="w-1 h-10 rounded-full shrink-0"
                      style={{ backgroundColor: req.leaveType.color }}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {req.leaveType?.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {format(new Date(req.startDate), "MMM d")} –{" "}
                      {format(new Date(req.endDate), "MMM d, yyyy")} ·{" "}
                      <span className="font-medium text-slate-600">
                        {req.totalDays}d
                      </span>
                    </p>
                    {req.rejectedReason && (
                      <p className="text-xs text-rose-500 mt-0.5 truncate">
                        {req.rejectedReason}
                      </p>
                    )}
                  </div>
                  <LeaveStatusBadge status={req.status} />
                </div>
              ))}

              {leaveRequests.length > 5 && (
                <div className="px-5 py-3 text-center">
                  <button
                    onClick={() => navigate("/hr/leave")}
                    className="text-xs font-semibold text-emerald-600 hover:underline"
                  >
                    +{leaveRequests.length - 5} more →
                  </button>
                </div>
              )}
            </div>
          )}
        </SectionCard>

        {/* Payslips */}
        <SectionCard
          title="My Payslips"
          subtitle={`${new Date().getFullYear()}`}
          actions={
            <button
              onClick={() => navigate("/hr/payslips")}
              className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
            >
              All payslips <ArrowRight className="w-3.5 h-3.5" />
            </button>
          }
          noPadding
        >
          {myPayslips.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-center px-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                <FileText className="w-6 h-6 text-slate-300" />
              </div>
              <p className="text-sm font-semibold text-slate-600">
                No payslips yet
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Your admin will generate them here
              </p>
            </div>
          ) : (
            <>
              {/* Earnings summary strip */}
              <div className="px-5 py-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500">
                      Total earned ({new Date().getFullYear()})
                    </p>
                    <p className="text-xl font-black text-emerald-700">
                      ${totalEarned.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Payslips</p>
                    <p className="text-xl font-black text-slate-800">
                      {myPayslips.length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {myPayslips.slice(0, 4).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setViewPayslip(p)}
                    className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/60 transition-colors text-left"
                  >
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-100 to-violet-200 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-violet-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800">
                        {MONTHS[p.month - 1]} {p.year}
                      </p>
                      <p className="text-xs text-slate-400">
                        Basic ${Number(p.basicSalary).toLocaleString()}
                        {p.totalAllowances > 0 && (
                          <span className="text-emerald-500 ml-1">
                            +${Number(p.totalAllowances).toLocaleString()}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-slate-900">
                        ${Number(p.netPay).toLocaleString()}
                      </p>
                      <PayslipStatusBadgeLocal status={p.status} />
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </SectionCard>
      </div>

      {/* Payslip detail modal */}
      {viewPayslip && (
        <PayslipDetailModal
          payslip={viewPayslip}
          onClose={() => setViewPayslip(null)}
        />
      )}
    </div>
  );
}

// ── Inline badge helpers (avoids import of the full shared file) ──────────
import {
  ATTENDANCE_STATUS_CONFIG,
  PAYSLIP_STATUS_CONFIG,
} from "@/types/hr-types";

function AttendanceStatusBadgeLocal({ status }: { status: string }) {
  const cfg =
    ATTENDANCE_STATUS_CONFIG[status as keyof typeof ATTENDANCE_STATUS_CONFIG];
  if (!cfg) return null;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.bgColor} ${cfg.color}`}
    >
      {cfg.label}
    </span>
  );
}

function PayslipStatusBadgeLocal({ status }: { status: string }) {
  const cfg =
    PAYSLIP_STATUS_CONFIG[status as keyof typeof PAYSLIP_STATUS_CONFIG];
  if (!cfg) return null;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.bgColor} ${cfg.color}`}
    >
      {cfg.label}
    </span>
  );
}
