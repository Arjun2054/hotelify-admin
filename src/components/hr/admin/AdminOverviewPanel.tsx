// src/components/hr/admin/AdminOverviewPanel.tsx

import { useEffect, useState } from "react";
import { useHrStore } from "@/store/hr/useHrStore";
import { useAuthStore } from "@/store/useAuthStore";
import { hrService } from "@/services/hr/hrService";
import StatCard from "@/components/hr/shared/StatCard";
import SectionCard from "@/components/hr/shared/SectionCard";
import {
  LeaveStatusBadge,
  AttendanceStatusBadge,
  PayslipStatusBadge,
} from "@/components/hr/shared/StatusBadge";
import {
  Users,
  CalendarRange,
  Clock,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  UserCheck,
  Timer,
  DollarSign,
  RefreshCw,
  ArrowRight,
  Wallet,
  CalendarDays,
  Activity,
  BadgeCheck,
} from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { useNavigate } from "react-router-dom";

// ─── Types ─────────────────────────────────────────────────────────────────
interface DashboardData {
  staffCount: number;
  todayPresent: number;
  todayAbsent: number;
  todayLate: number;
  todayOnLeave: number;
  pendingLeaves: number;
  approvedLeavesThisMonth: number;
  totalPayrollThisMonth: number;
  unpaidPayslips: number;
  recentLeaveRequests: any[];
  todayAttendance: any[];
  leaveStats: any;
  monthlyPayslips: any[];
  attendanceStats: any;
}

// ─── Skeleton ──────────────────────────────────────────────────────────────
function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 p-5 animate-pulse ${className}`}
    >
      <div className="h-3 bg-slate-100 rounded w-24 mb-3" />
      <div className="h-8 bg-slate-100 rounded w-16 mb-2" />
      <div className="h-2 bg-slate-100 rounded w-32" />
    </div>
  );
}

function SkeletonSection({ rows = 3 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 animate-pulse">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="h-4 bg-slate-100 rounded w-32" />
        <div className="h-3 bg-slate-100 rounded w-16" />
      </div>
      <div className="p-5 space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-100 shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 bg-slate-100 rounded w-3/4" />
              <div className="h-2 bg-slate-100 rounded w-1/2" />
            </div>
            <div className="h-5 w-16 bg-slate-100 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Mini donut chart (pure CSS) ──────────────────────────────────────────
function DonutRing({
  value,
  total,
  color,
  size = 64,
}: {
  value: number;
  total: number;
  color: string;
  size?: number;
}) {
  const pct = total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0;
  const r = 20;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      <circle
        cx="24"
        cy="24"
        r={r}
        fill="none"
        stroke="#f1f5f9"
        strokeWidth="6"
      />
      <circle
        cx="24"
        cy="24"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="6"
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round"
        transform="rotate(-90 24 24)"
      />
      <text
        x="24"
        y="24"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="10"
        fontWeight="700"
        fill="#1e293b"
      >
        {pct}%
      </text>
    </svg>
  );
}

// ─── Month/Year selector ───────────────────────────────────────────────────
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

// ══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════
export default function AdminOverviewPanel() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const {
    leaveStats,
    leaveRequests,
    allAttendance,
    allPayslips,
    attendanceStats,
    fetchLeaveStats,
    fetchLeaveRequests,
    fetchAllAttendance,
    fetchAllPayslips,
    fetchAttendanceStats,
  } = useHrStore();

  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // ── Load all dashboard data ──────────────────────────
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const today = format(new Date(), "yyyy-MM-dd");

      await Promise.allSettled([
        fetchLeaveStats(selectedYear),
        fetchLeaveRequests({ status: "PENDING" }, 1),
        fetchAllAttendance({ dateFrom: today, dateTo: today }, 1),
        fetchAllPayslips({ month: selectedMonth, year: selectedYear }, 1),
        fetchAttendanceStats(undefined, selectedMonth, selectedYear),
      ]);

      setIsLoading(false);
    };

    load();
  }, [selectedMonth, selectedYear]);

  // ── Derived metrics ──────────────────────────────────
  const today = allAttendance;
  const todayPresent = today.filter(
    (a) => a.status === "PRESENT" || a.status === "LATE",
  ).length;
  const todayAbsent = today.filter((a) => a.status === "ABSENT").length;
  const todayLate = today.filter((a) => a.status === "LATE").length;
  const todayOnLeave = today.filter((a) => a.status === "ON_LEAVE").length;

  const pendingLeaves = leaveRequests.filter(
    (r) => r.status === "PENDING",
  ).length;

  const totalNetPay = allPayslips.reduce(
    (s, p) => s + Number(p.netPay ?? 0),
    0,
  );
  const unpaidPayslips = allPayslips.filter((p) => p.status !== "PAID").length;
  const paidPayslips = allPayslips.filter((p) => p.status === "PAID").length;

  const totalPayslips = allPayslips.length;

  // ── Greeting ─────────────────────────────────────────
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  // ═══════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════
  return (
    <div className="space-y-6">
      {/* ── Hero Banner ────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 rounded-2xl p-6 text-white">
        {/* decorative blobs */}
        <div className="absolute -top-10 -right-10 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-slate-400 text-sm font-medium mb-0.5">
              {greeting}, {user?.name?.split(" ")[0] ?? "Admin"} 👋
            </p>
            <h1 className="text-2xl font-bold tracking-tight">
              HR Command Centre
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {format(new Date(), "EEEE, MMMM d, yyyy")}
            </p>
          </div>

          {/* Month/Year picker */}
          <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-3 py-2 backdrop-blur-sm">
            <CalendarDays className="w-4 h-4 text-slate-300 shrink-0" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="text-sm text-white bg-transparent outline-none"
            >
              {MONTHS.map((m, i) => (
                <option key={i} value={i + 1} className="text-slate-900">
                  {m}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="text-sm text-white bg-transparent outline-none"
            >
              {[2024, 2025, 2026].map((y) => (
                <option key={y} value={y} className="text-slate-900">
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick KPIs inside hero */}
        <div className="relative mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: "Pending Leaves",
              value: leaveStats?.pending ?? 0,
              icon: CalendarRange,
              color: "text-amber-300",
              bg: "bg-amber-500/10",
            },
            {
              label: "Present Today",
              value: todayPresent,
              icon: UserCheck,
              color: "text-emerald-300",
              bg: "bg-emerald-500/10",
            },
            {
              label: "Late Today",
              value: todayLate,
              icon: Timer,
              color: "text-orange-300",
              bg: "bg-orange-500/10",
            },
            {
              label: "Payroll",
              value: `$${totalNetPay.toLocaleString()}`,
              icon: DollarSign,
              color: "text-blue-300",
              bg: "bg-blue-500/10",
            },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3"
            >
              <div className={`p-2 rounded-lg shrink-0 ${kpi.bg}`}>
                <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-400 truncate">{kpi.label}</p>
                <p className="text-lg font-bold text-white leading-tight">
                  {kpi.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Stat Cards Row ─────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <>
          {/* Today's Attendance */}
          <div>
            <SectionHeader
              title="Today's Attendance Snapshot"
              subtitle={format(new Date(), "EEEE, MMMM d")}
              action={{ label: "View all", href: "/hr/attendance" }}
              navigate={navigate}
            />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3">
              <StatCard
                label="Present"
                value={todayPresent}
                icon={UserCheck}
                iconColor="text-emerald-600"
                iconBg="bg-emerald-50"
                subtitle="Clocked in today"
              />
              <StatCard
                label="Absent"
                value={todayAbsent}
                icon={XCircle}
                iconColor="text-rose-500"
                iconBg="bg-rose-50"
                subtitle="Not clocked in"
              />
              <StatCard
                label="Late"
                value={todayLate}
                icon={Timer}
                iconColor="text-amber-500"
                iconBg="bg-amber-50"
                subtitle="Past start time"
              />
              <StatCard
                label="On Leave"
                value={todayOnLeave}
                icon={CalendarRange}
                iconColor="text-blue-500"
                iconBg="bg-blue-50"
                subtitle="Approved leave"
              />
            </div>
          </div>

          {/* Leave overview */}
          <div>
            <SectionHeader
              title="Leave Overview"
              subtitle={`${selectedYear} year to date`}
              action={{ label: "Manage leave", href: "/hr/leave" }}
              navigate={navigate}
            />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3">
              <StatCard
                label="Pending Requests"
                value={leaveStats?.pending ?? 0}
                icon={AlertTriangle}
                iconColor="text-amber-600"
                iconBg="bg-amber-50"
                subtitle="Awaiting approval"
              />
              <StatCard
                label="Approved"
                value={leaveStats?.approved ?? 0}
                icon={CheckCircle2}
                iconColor="text-emerald-600"
                iconBg="bg-emerald-50"
                subtitle="This year"
              />
              <StatCard
                label="Rejected"
                value={leaveStats?.rejected ?? 0}
                icon={XCircle}
                iconColor="text-rose-500"
                iconBg="bg-rose-50"
                subtitle="This year"
              />
              <StatCard
                label="Total Requests"
                value={leaveStats?.totalRequests ?? 0}
                icon={CalendarRange}
                iconColor="text-slate-500"
                iconBg="bg-slate-100"
                subtitle="All statuses"
              />
            </div>
          </div>

          {/* Payroll overview */}
          <div>
            <SectionHeader
              title="Payroll Overview"
              subtitle={`${MONTHS[selectedMonth - 1]} ${selectedYear}`}
              action={{ label: "View payslips", href: "/hr/payslips" }}
              navigate={navigate}
            />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3">
              <StatCard
                label="Total Payroll"
                value={`$${totalNetPay.toLocaleString()}`}
                icon={Wallet}
                iconColor="text-emerald-600"
                iconBg="bg-emerald-50"
                subtitle="Net pay total"
              />
              <StatCard
                label="Payslips Issued"
                value={totalPayslips}
                icon={FileText}
                iconColor="text-blue-500"
                iconBg="bg-blue-50"
                subtitle="This period"
              />
              <StatCard
                label="Paid"
                value={paidPayslips}
                icon={BadgeCheck}
                iconColor="text-emerald-600"
                iconBg="bg-emerald-50"
                subtitle="Disbursed"
              />
              <StatCard
                label="Unpaid"
                value={unpaidPayslips}
                icon={DollarSign}
                iconColor="text-rose-500"
                iconBg="bg-rose-50"
                subtitle="Pending payment"
              />
            </div>
          </div>
        </>
      )}

      {/* ── Detail panels grid ─────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonSection rows={4} />
          <SkeletonSection rows={4} />
          <SkeletonSection rows={3} />
          <SkeletonSection rows={3} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending leave requests */}
          <PendingLeavesCard
            requests={leaveRequests.filter((r) => r.status === "PENDING")}
            navigate={navigate}
          />

          {/* Today's attendance list */}
          <TodayAttendanceCard records={allAttendance} navigate={navigate} />

          {/* Leave by type breakdown */}
          <LeaveByTypeCard leaveStats={leaveStats} />

          {/* Monthly attendance stats */}
          <MonthlyAttendanceStatsCard
            stats={attendanceStats}
            month={selectedMonth}
            year={selectedYear}
          />

          {/* Payslip status breakdown */}
          <PayslipBreakdownCard
            payslips={allPayslips}
            month={selectedMonth}
            year={selectedYear}
            navigate={navigate}
          />

          {/* Recent payslips */}
          <RecentPayslipsCard
            payslips={allPayslips.slice(0, 5)}
            navigate={navigate}
          />
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Sub-components
// ═══════════════════════════════════════════════════════════════════════════

// ─── Section header with "view all" link ──────────────────────────────────
function SectionHeader({
  title,
  subtitle,
  action,
  navigate,
}: {
  title: string;
  subtitle?: string;
  action?: { label: string; href: string };
  navigate: (path: string) => void;
}) {
  return (
    <div className="flex items-end justify-between">
      <div>
        <h2 className="text-base font-bold text-slate-800">{title}</h2>
        {subtitle && (
          <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
        )}
      </div>
      {action && (
        <button
          onClick={() => navigate(action.href)}
          className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          {action.label}
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

// ─── Pending leaves card ──────────────────────────────────────────────────
function PendingLeavesCard({
  requests,
  navigate,
}: {
  requests: any[];
  navigate: (path: string) => void;
}) {
  return (
    <SectionCard
      title="Pending Leave Requests"
      subtitle={`${requests.length} awaiting your approval`}
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
      {requests.length === 0 ? (
        <div className="flex flex-col items-center py-10 text-center px-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mb-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          </div>
          <p className="text-sm font-semibold text-slate-600">All caught up!</p>
          <p className="text-xs text-slate-400 mt-0.5">
            No pending leave requests
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-50">
          {requests.slice(0, 5).map((req) => (
            <div
              key={req.id}
              className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/60 transition-colors"
            >
              {/* Avatar */}
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-amber-700">
                  {req.user?.name?.charAt(0).toUpperCase() ?? "?"}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">
                  {req.user?.name ?? "—"}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {req.leaveType?.name} ·{" "}
                  {format(new Date(req.startDate), "MMM d")}–
                  {format(new Date(req.endDate), "MMM d")} ·{" "}
                  <span className="font-medium text-slate-600">
                    {req.totalDays}d
                  </span>
                </p>
              </div>

              {/* Color dot */}
              {req.leaveType?.color && (
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: req.leaveType.color }}
                />
              )}

              <LeaveStatusBadge status={req.status} />
            </div>
          ))}

          {requests.length > 5 && (
            <div className="px-5 py-3 text-center">
              <button
                onClick={() => navigate("/hr/leave")}
                className="text-xs font-semibold text-emerald-600 hover:underline"
              >
                +{requests.length - 5} more requests →
              </button>
            </div>
          )}
        </div>
      )}
    </SectionCard>
  );
}

// ─── Today's attendance ───────────────────────────────────────────────────
function TodayAttendanceCard({
  records,
  navigate,
}: {
  records: any[];
  navigate: (path: string) => void;
}) {
  return (
    <SectionCard
      title="Today's Attendance"
      subtitle={`${records.length} records · ${format(new Date(), "MMM d, yyyy")}`}
      actions={
        <button
          onClick={() => navigate("/hr/attendance")}
          className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
        >
          Full view <ArrowRight className="w-3.5 h-3.5" />
        </button>
      }
      noPadding
    >
      {records.length === 0 ? (
        <div className="flex flex-col items-center py-10 text-center px-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
            <Clock className="w-6 h-6 text-slate-400" />
          </div>
          <p className="text-sm font-semibold text-slate-600">No records yet</p>
          <p className="text-xs text-slate-400 mt-0.5">
            Records appear as staff clock in
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-50 max-h-72 overflow-y-auto">
          {records.slice(0, 8).map((rec) => (
            <div
              key={rec.id}
              className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50/60 transition-colors"
            >
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-blue-700">
                  {rec.user?.name?.charAt(0).toUpperCase() ?? "?"}
                </span>
              </div>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">
                  {rec.user?.name ?? "—"}
                </p>
                <p className="text-xs text-slate-400">
                  {rec.clockIn ? format(new Date(rec.clockIn), "HH:mm") : "—"} →{" "}
                  {rec.clockOut
                    ? format(new Date(rec.clockOut), "HH:mm")
                    : "active"}
                  {rec.totalHours != null && (
                    <span className="ml-1 font-medium text-slate-600">
                      · {Number(rec.totalHours).toFixed(1)}h
                    </span>
                  )}
                </p>
              </div>

              <AttendanceStatusBadge status={rec.status} />
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

// ─── Leave by type ────────────────────────────────────────────────────────
function LeaveByTypeCard({ leaveStats }: { leaveStats: any }) {
  if (!leaveStats || leaveStats.byType.length === 0) {
    return (
      <SectionCard title="Leave by Type" subtitle="Year-to-date breakdown">
        <div className="flex flex-col items-center py-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
            <Activity className="w-6 h-6 text-slate-300" />
          </div>
          <p className="text-sm text-slate-400">No leave data yet</p>
        </div>
      </SectionCard>
    );
  }

  const total = leaveStats.totalRequests;

  return (
    <SectionCard
      title="Leave by Type"
      subtitle={`${total} total requests this year`}
    >
      <div className="space-y-4">
        {leaveStats.byType.map((item: any, idx: number) => {
          const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;

          const BAR_COLORS = [
            "#10b981", // emerald
            "#3b82f6", // blue
            "#f59e0b", // amber
            "#ef4444", // rose
            "#8b5cf6", // violet
            "#06b6d4", // cyan
          ];
          const color = BAR_COLORS[idx % BAR_COLORS.length];

          return (
            <div key={item.typeId}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm font-medium text-slate-700">
                    {item.typeName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">{pct}%</span>
                  <span className="text-sm font-bold text-slate-800 w-6 text-right">
                    {item.count}
                  </span>
                </div>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, backgroundColor: color }}
                />
              </div>
            </div>
          );
        })}

        {/* Summary pills */}
        <div className="flex items-center gap-3 pt-2 border-t border-slate-100 flex-wrap">
          {[
            {
              label: "Approved",
              value: leaveStats.approved,
              cls: "bg-emerald-50 text-emerald-700",
            },
            {
              label: "Pending",
              value: leaveStats.pending,
              cls: "bg-amber-50 text-amber-700",
            },
            {
              label: "Rejected",
              value: leaveStats.rejected,
              cls: "bg-rose-50 text-rose-700",
            },
          ].map((p) => (
            <div
              key={p.label}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${p.cls}`}
            >
              {p.label}
              <span className="font-bold">{p.value}</span>
            </div>
          ))}
        </div>
      </div>
    </SectionCard>
  );
}

// ─── Monthly attendance stats ─────────────────────────────────────────────
function MonthlyAttendanceStatsCard({
  stats,
  month,
  year,
}: {
  stats: any;
  month: number;
  year: number;
}) {
  if (!stats) {
    return (
      <SectionCard
        title="Monthly Attendance"
        subtitle={`${MONTHS[month - 1]} ${year}`}
      >
        <div className="flex flex-col items-center py-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
            <Clock className="w-6 h-6 text-slate-300" />
          </div>
          <p className="text-sm text-slate-400">No attendance data</p>
        </div>
      </SectionCard>
    );
  }

  const total = stats.totalDays || 1;

  const rows = [
    {
      label: "Present",
      value: stats.present,
      color: "#10b981",
      bg: "bg-emerald-50",
      text: "text-emerald-700",
    },
    {
      label: "Absent",
      value: stats.absent,
      color: "#ef4444",
      bg: "bg-rose-50",
      text: "text-rose-700",
    },
    {
      label: "Late",
      value: stats.late,
      color: "#f59e0b",
      bg: "bg-amber-50",
      text: "text-amber-700",
    },
    {
      label: "Half Day",
      value: stats.halfDay,
      color: "#8b5cf6",
      bg: "bg-violet-50",
      text: "text-violet-700",
    },
    {
      label: "On Leave",
      value: stats.onLeave,
      color: "#3b82f6",
      bg: "bg-blue-50",
      text: "text-blue-700",
    },
  ];

  return (
    <SectionCard
      title="Monthly Attendance"
      subtitle={`${MONTHS[month - 1]} ${year} · ${stats.totalDays} records`}
    >
      <div className="flex items-start gap-6">
        {/* Donut */}
        <div className="flex flex-col items-center shrink-0">
          <DonutRing
            value={stats.present}
            total={total}
            color="#10b981"
            size={80}
          />
          <p className="text-xs text-slate-400 mt-1">Attendance rate</p>
        </div>

        {/* Bars */}
        <div className="flex-1 space-y-2.5 min-w-0">
          {rows.map((r) => {
            const pct = total > 0 ? Math.round((r.value / total) * 100) : 0;
            return (
              <div key={r.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-slate-600">
                    {r.label}
                  </span>
                  <span
                    className={`text-xs font-bold px-1.5 py-0.5 rounded ${r.bg} ${r.text}`}
                  >
                    {r.value}
                  </span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, backgroundColor: r.color }}
                  />
                </div>
              </div>
            );
          })}

          {/* Hours summary */}
          <div className="flex items-center gap-4 pt-2 border-t border-slate-100">
            <div>
              <p className="text-xs text-slate-400">Total Hours</p>
              <p className="text-sm font-bold text-slate-800">
                {stats.totalHours?.toFixed(0) ?? 0}h
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Overtime</p>
              <p className="text-sm font-bold text-violet-600">
                {stats.totalOvertime?.toFixed(1) ?? 0}h
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Avg/Day</p>
              <p className="text-sm font-bold text-slate-800">
                {stats.averageHoursPerDay?.toFixed(1) ?? 0}h
              </p>
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

// ─── Payslip breakdown ────────────────────────────────────────────────────
function PayslipBreakdownCard({
  payslips,
  month,
  year,
  navigate,
}: {
  payslips: any[];
  month: number;
  year: number;
  navigate: (path: string) => void;
}) {
  const paid = payslips.filter((p) => p.status === "PAID");
  const generated = payslips.filter((p) => p.status === "GENERATED");
  const draft = payslips.filter((p) => p.status === "DRAFT");

  const total = payslips.length || 1;

  const totalNet = payslips.reduce((s, p) => s + Number(p.netPay ?? 0), 0);
  const totalGross = payslips.reduce((s, p) => s + Number(p.grossPay ?? 0), 0);
  const totalDeductions = payslips.reduce(
    (s, p) => s + Number(p.totalDeductions ?? 0),
    0,
  );

  const breakdown = [
    {
      label: "Paid",
      count: paid.length,
      color: "#10b981",
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      amount: paid.reduce((s, p) => s + Number(p.netPay ?? 0), 0),
    },
    {
      label: "Generated",
      count: generated.length,
      color: "#3b82f6",
      bg: "bg-blue-50",
      text: "text-blue-700",
      amount: generated.reduce((s, p) => s + Number(p.netPay ?? 0), 0),
    },
    {
      label: "Draft",
      count: draft.length,
      color: "#94a3b8",
      bg: "bg-slate-100",
      text: "text-slate-600",
      amount: draft.reduce((s, p) => s + Number(p.netPay ?? 0), 0),
    },
  ];

  return (
    <SectionCard
      title="Payroll Breakdown"
      subtitle={`${MONTHS[month - 1]} ${year}`}
      actions={
        <button
          onClick={() => navigate("/hr/payslips")}
          className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
        >
          Payslips <ArrowRight className="w-3.5 h-3.5" />
        </button>
      }
    >
      {payslips.length === 0 ? (
        <div className="flex flex-col items-center py-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
            <Wallet className="w-6 h-6 text-slate-300" />
          </div>
          <p className="text-sm text-slate-400">No payslips this period</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Total summary */}
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                label: "Gross",
                value: `$${totalGross.toLocaleString()}`,
                cls: "text-slate-800",
              },
              {
                label: "Deductions",
                value: `-$${totalDeductions.toLocaleString()}`,
                cls: "text-rose-500",
              },
              {
                label: "Net Pay",
                value: `$${totalNet.toLocaleString()}`,
                cls: "text-emerald-600",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-slate-50 rounded-xl p-3 text-center"
              >
                <p className="text-xs text-slate-400 mb-0.5">{s.label}</p>
                <p className={`text-sm font-bold ${s.cls}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Status bars */}
          <div className="space-y-2.5">
            {breakdown.map((b) => {
              const pct = Math.round((b.count / total) * 100);
              return (
                <div key={b.label}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: b.color }}
                      />
                      <span className="text-xs font-medium text-slate-600">
                        {b.label}
                      </span>
                      <span
                        className={`text-xs font-bold px-1.5 py-0.5 rounded ${b.bg} ${b.text}`}
                      >
                        {b.count}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500">
                      ${b.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: b.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </SectionCard>
  );
}

// ─── Recent payslips ──────────────────────────────────────────────────────
function RecentPayslipsCard({
  payslips,
  navigate,
}: {
  payslips: any[];
  navigate: (path: string) => void;
}) {
  return (
    <SectionCard
      title="Recent Payslips"
      subtitle="Latest entries"
      actions={
        <button
          onClick={() => navigate("/hr/payslips")}
          className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
        >
          View all <ArrowRight className="w-3.5 h-3.5" />
        </button>
      }
      noPadding
    >
      {payslips.length === 0 ? (
        <div className="flex flex-col items-center py-10 text-center px-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
            <FileText className="w-6 h-6 text-slate-300" />
          </div>
          <p className="text-sm font-semibold text-slate-600">
            No payslips yet
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            Generate payslips from the Payslips tab
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-50">
          {payslips.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/60 transition-colors"
            >
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-100 to-violet-200 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-violet-700">
                  {p.user?.name?.charAt(0).toUpperCase() ?? "?"}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">
                  {p.user?.name ?? "—"}
                </p>
                <p className="text-xs text-slate-400">
                  {MONTHS[p.month - 1]} {p.year}
                </p>
              </div>

              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-slate-900">
                  ${Number(p.netPay).toLocaleString()}
                </p>
                <PayslipStatusBadge status={p.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}
