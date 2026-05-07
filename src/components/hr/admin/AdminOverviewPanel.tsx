import { useEffect, useState } from "react";
import { useHrStore } from "@/store/hr/useHrStore";
import { useAuthStore } from "@/store/useAuthStore";
import StatCard from "@/components/hr/shared/StatCard";
import {
  LeaveStatusBadge,
  AttendanceStatusBadge,
  PayslipStatusBadge,
} from "@/components/hr/shared/StatusBadge";
import {
  CalendarRange,
  Clock,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  UserCheck,
  Timer,
  DollarSign,
  ArrowRight,
  Wallet,
  CalendarDays,
  Activity,
  BadgeCheck,
  Building2,
} from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

// ── Months ────────────────────────────────────────────────────────────────────
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

// ── Skeleton components ───────────────────────────────────────────────────────
function SkeletonStatCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse space-y-3">
      <div className="flex items-center justify-between">
        <div className="h-3 bg-gray-100 rounded-full w-24" />
        <div className="w-8 h-8 rounded-xl bg-gray-100" />
      </div>
      <div className="h-8 bg-gray-100 rounded-lg w-16" />
      <div className="h-2.5 bg-gray-100 rounded-full w-32" />
    </div>
  );
}

function SkeletonSection({ rows = 3 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm animate-pulse overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/60 flex items-center justify-between">
        <div className="h-4 bg-gray-100 rounded-full w-36" />
        <div className="h-3 bg-gray-100 rounded-full w-16" />
      </div>
      <div className="p-5 space-y-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gray-100 shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 bg-gray-100 rounded-full w-3/4" />
              <div className="h-2.5 bg-gray-100 rounded-full w-1/2" />
            </div>
            <div className="h-5 w-16 bg-gray-100 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Donut ring ────────────────────────────────────────────────────────────────
function DonutRing({
  value,
  total,
  color,
  size = 72,
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
        stroke="#f3f4f6"
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
        fill="#1c1917"
      >
        {pct}%
      </text>
    </svg>
  );
}

// ── Section heading ───────────────────────────────────────────────────────────
function SectionHeading({
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
    <div className="flex items-center gap-2 mb-3">
      <div className="flex-1">
        <p className="font-semibold text-gray-800" style={{ fontSize: "13px" }}>
          {title}
        </p>
        {subtitle && (
          <p className="text-gray-400 mt-0.5" style={{ fontSize: "11px" }}>
            {subtitle}
          </p>
        )}
      </div>
      <div className="flex-1 h-px bg-gray-200" />
      {action && (
        <button
          onClick={() => navigate(action.href)}
          className="inline-flex items-center gap-1 text-stone-500 hover:text-stone-800 transition-colors font-medium shrink-0"
          style={{ fontSize: "12px" }}
        >
          {action.label}
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

// ── Card shell (replaces SectionCard where we need fine control) ──────────────
function DashCard({
  title,
  subtitle,
  action,
  noPadding,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  noPadding?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-100 bg-gray-50/60 shrink-0">
        <div>
          <p
            className="font-semibold text-gray-800"
            style={{ fontSize: "13px" }}
          >
            {title}
          </p>
          {subtitle && (
            <p className="text-gray-400 mt-0.5" style={{ fontSize: "11px" }}>
              {subtitle}
            </p>
          )}
        </div>
        {action}
      </div>
      <div className={cn("flex-1", !noPadding && "p-5")}>{children}</div>
    </div>
  );
}

// ── Nav link ──────────────────────────────────────────────────────────────────
function NavLink({
  label,
  href,
  navigate,
}: {
  label: string;
  href: string;
  navigate: (p: string) => void;
}) {
  return (
    <button
      onClick={() => navigate(href)}
      className="inline-flex items-center gap-1 text-stone-500 hover:text-stone-800 transition-colors font-medium"
      style={{ fontSize: "12px" }}
    >
      {label}
      <ArrowRight className="w-3.5 h-3.5" />
    </button>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
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

  // Derived
  const todayPresent = allAttendance.filter(
    (a) => a.status === "PRESENT" || a.status === "LATE",
  ).length;
  const todayAbsent = allAttendance.filter((a) => a.status === "ABSENT").length;
  const todayLate = allAttendance.filter((a) => a.status === "LATE").length;
  const todayOnLeave = allAttendance.filter(
    (a) => a.status === "ON_LEAVE",
  ).length;
  const totalNetPay = allPayslips.reduce(
    (s, p) => s + Number(p.netPay ?? 0),
    0,
  );
  const unpaidPayslips = allPayslips.filter((p) => p.status !== "PAID").length;
  const paidPayslips = allPayslips.filter((p) => p.status === "PAID").length;
  const totalPayslips = allPayslips.length;

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="min-h-screen">
      {/* ── Hero header ─────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-linear-to-br from-stone-800 via-stone-700 to-stone-900 px-8 py-10">
        {/* Decorative blobs */}
        <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-20 -left-8 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute top-6 right-52 w-20 h-20 rounded-full bg-white/3 pointer-events-none" />

        <div className="relative flex items-start justify-between gap-6 flex-wrap">
          {/* Left: greeting + title */}
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm shrink-0">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p
                  className="uppercase tracking-widest font-semibold text-stone-400"
                  style={{ fontSize: "10px" }}
                >
                  Human Resources
                </p>
                <span className="w-1 h-1 rounded-full bg-stone-500" />
                <p
                  className="uppercase tracking-widest font-semibold text-stone-400"
                  style={{ fontSize: "10px" }}
                >
                  Admin Dashboard
                </p>
              </div>
              <h1
                className="font-bold text-white leading-tight tracking-tight"
                style={{ fontSize: "22px" }}
              >
                HR Command Centre
              </h1>
              <p className="text-stone-300 mt-1" style={{ fontSize: "13px" }}>
                {greeting},{" "}
                <span className="font-semibold">
                  {user?.name?.split(" ")[0] ?? "Admin"}
                </span>{" "}
                · {format(new Date(), "EEEE, MMMM d, yyyy")}
              </p>
            </div>
          </div>

          {/* Month/Year picker */}
          <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-3 py-2 backdrop-blur-sm shrink-0">
            <CalendarDays className="w-3.5 h-3.5 text-stone-300 shrink-0" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-transparent text-white outline-none"
              style={{ fontSize: "13px" }}
            >
              {MONTHS.map((m, i) => (
                <option key={i} value={i + 1} className="text-stone-900">
                  {m}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-transparent text-white outline-none"
              style={{ fontSize: "13px" }}
            >
              {[2024, 2025, 2026].map((y) => (
                <option key={y} value={y} className="text-stone-900">
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Frosted KPI strip ─────────────────────────────────────────── */}
        <div className="relative mt-7 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: "Pending Leaves",
              value: leaveStats?.pending ?? 0,
              icon: CalendarRange,
              dot: "bg-amber-400",
            },
            {
              label: "Present Today",
              value: todayPresent,
              icon: UserCheck,
              dot: "bg-emerald-400",
            },
            {
              label: "Late Today",
              value: todayLate,
              icon: Timer,
              dot: "bg-orange-400",
            },
            {
              label: "Payroll",
              value: `$${totalNetPay.toLocaleString()}`,
              icon: DollarSign,
              dot: "bg-blue-400",
            },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className="flex items-center gap-3 bg-white/10 border border-white/15 rounded-xl px-4 py-3 backdrop-blur-sm"
            >
              <span className={cn("w-2 h-2 rounded-full shrink-0", kpi.dot)} />
              <div className="min-w-0">
                <p
                  className="text-stone-400 truncate"
                  style={{ fontSize: "10px" }}
                >
                  {kpi.label}
                </p>
                <p
                  className="font-bold text-white leading-tight"
                  style={{ fontSize: "17px" }}
                >
                  {isLoading ? "—" : kpi.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────────────────── */}
      <div className="px-8 py-6 space-y-7">
        {/* ── Today's Attendance snapshot ─────────────────────────────────── */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonStatCard key={i} />
            ))}
          </div>
        ) : (
          <>
            <div>
              <SectionHeading
                title="Today's Attendance Snapshot"
                subtitle={format(new Date(), "EEEE, MMMM d")}
                action={{ label: "View all", href: "/hr/attendance" }}
                navigate={navigate}
              />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
              <SectionHeading
                title="Leave Overview"
                subtitle={`${selectedYear} year to date`}
                action={{ label: "Manage leave", href: "/hr/leave" }}
                navigate={navigate}
              />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
                  iconColor="text-stone-500"
                  iconBg="bg-stone-100"
                  subtitle="All statuses"
                />
              </div>
            </div>

            {/* Payroll overview */}
            <div>
              <SectionHeading
                title="Payroll Overview"
                subtitle={`${MONTHS[selectedMonth - 1]} ${selectedYear}`}
                action={{ label: "View payslips", href: "/hr/payslips" }}
                navigate={navigate}
              />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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

        {/* ── Detail panels ────────────────────────────────────────────────── */}
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonSection key={i} rows={4} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <PendingLeavesCard
              requests={leaveRequests.filter((r) => r.status === "PENDING")}
              navigate={navigate}
            />
            <TodayAttendanceCard records={allAttendance} navigate={navigate} />
            <LeaveByTypeCard leaveStats={leaveStats} />
            <MonthlyAttendanceStatsCard
              stats={attendanceStats}
              month={selectedMonth}
              year={selectedYear}
            />
            <PayslipBreakdownCard
              payslips={allPayslips}
              month={selectedMonth}
              year={selectedYear}
              navigate={navigate}
            />
            <RecentPayslipsCard
              payslips={allPayslips.slice(0, 5)}
              navigate={navigate}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// Sub-components
// ═════════════════════════════════════════════════════════════════════════════

// ── Avatar initials ───────────────────────────────────────────────────────────
function Avatar({
  name,
  colorClass = "bg-stone-100 text-stone-600",
}: {
  name?: string;
  colorClass?: string;
}) {
  return (
    <div
      className={cn(
        "w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0",
        colorClass,
      )}
      style={{ fontSize: "13px" }}
    >
      {name?.charAt(0).toUpperCase() ?? "?"}
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyPanel({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center px-4">
      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-stone-100 border border-stone-200 mb-3">
        <Icon className="w-5 h-5 text-stone-400" />
      </div>
      <p className="font-semibold text-gray-700" style={{ fontSize: "13px" }}>
        {title}
      </p>
      {subtitle && (
        <p className="text-gray-400 mt-0.5" style={{ fontSize: "11px" }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

// ── Pending leaves ────────────────────────────────────────────────────────────
function PendingLeavesCard({
  requests,
  navigate,
}: {
  requests: any[];
  navigate: (p: string) => void;
}) {
  return (
    <DashCard
      title="Pending Leave Requests"
      subtitle={`${requests.length} awaiting approval`}
      action={<NavLink label="Manage" href="/hr/leave" navigate={navigate} />}
      noPadding
    >
      {requests.length === 0 ? (
        <EmptyPanel
          icon={CheckCircle2}
          title="All caught up!"
          subtitle="No pending leave requests"
        />
      ) : (
        <div className="divide-y divide-gray-50">
          {requests.slice(0, 5).map((req) => (
            <div
              key={req.id}
              className="flex items-center gap-3 px-5 py-3.5 hover:bg-stone-50/60 transition-colors"
            >
              <Avatar
                name={req.user?.name}
                colorClass="bg-amber-50 text-amber-700"
              />
              <div className="flex-1 min-w-0">
                <p
                  className="font-semibold text-gray-800 truncate"
                  style={{ fontSize: "13px" }}
                >
                  {req.user?.name ?? "—"}
                </p>
                <p
                  className="text-gray-400 truncate"
                  style={{ fontSize: "11px" }}
                >
                  {req.leaveType?.name} ·{" "}
                  {format(new Date(req.startDate), "MMM d")}–
                  {format(new Date(req.endDate), "MMM d")} ·{" "}
                  <span className="font-medium text-gray-600">
                    {req.totalDays}d
                  </span>
                </p>
              </div>
              {req.leaveType?.color && (
                <div
                  className="w-2 h-2 rounded-full shrink-0"
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
                className="text-stone-500 hover:text-stone-800 font-medium transition-colors"
                style={{ fontSize: "12px" }}
              >
                +{requests.length - 5} more requests →
              </button>
            </div>
          )}
        </div>
      )}
    </DashCard>
  );
}

// ── Today's attendance ────────────────────────────────────────────────────────
function TodayAttendanceCard({
  records,
  navigate,
}: {
  records: any[];
  navigate: (p: string) => void;
}) {
  return (
    <DashCard
      title="Today's Attendance"
      subtitle={`${records.length} records · ${format(new Date(), "MMM d, yyyy")}`}
      action={
        <NavLink label="Full view" href="/hr/attendance" navigate={navigate} />
      }
      noPadding
    >
      {records.length === 0 ? (
        <EmptyPanel
          icon={Clock}
          title="No records yet"
          subtitle="Records appear as staff clock in"
        />
      ) : (
        <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
          {records.slice(0, 8).map((rec) => (
            <div
              key={rec.id}
              className="flex items-center gap-3 px-5 py-3 hover:bg-stone-50/60 transition-colors"
            >
              <Avatar
                name={rec.user?.name}
                colorClass="bg-blue-50 text-blue-700"
              />
              <div className="flex-1 min-w-0">
                <p
                  className="font-semibold text-gray-800 truncate"
                  style={{ fontSize: "13px" }}
                >
                  {rec.user?.name ?? "—"}
                </p>
                <p className="text-gray-400" style={{ fontSize: "11px" }}>
                  {rec.clockIn ? format(new Date(rec.clockIn), "HH:mm") : "—"} →{" "}
                  {rec.clockOut
                    ? format(new Date(rec.clockOut), "HH:mm")
                    : "active"}
                  {rec.totalHours != null && (
                    <span className="ml-1 font-medium text-gray-600">
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
    </DashCard>
  );
}

// ── Leave by type ─────────────────────────────────────────────────────────────
function LeaveByTypeCard({ leaveStats }: { leaveStats: any }) {
  const BAR_COLORS = [
    "#10b981",
    "#3b82f6",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#06b6d4",
  ];

  if (!leaveStats || leaveStats.byType.length === 0) {
    return (
      <DashCard title="Leave by Type" subtitle="Year-to-date breakdown">
        <EmptyPanel icon={Activity} title="No leave data yet" />
      </DashCard>
    );
  }

  const total = leaveStats.totalRequests;

  return (
    <DashCard
      title="Leave by Type"
      subtitle={`${total} total requests this year`}
    >
      <div className="space-y-4">
        {leaveStats.byType.map((item: any, idx: number) => {
          const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
          const color = BAR_COLORS[idx % BAR_COLORS.length];
          return (
            <div key={item.typeId}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span
                    className="font-medium text-gray-700"
                    style={{ fontSize: "12px" }}
                  >
                    {item.typeName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400" style={{ fontSize: "11px" }}>
                    {pct}%
                  </span>
                  <span
                    className="font-bold text-gray-800 w-6 text-right"
                    style={{ fontSize: "12px" }}
                  >
                    {item.count}
                  </span>
                </div>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, backgroundColor: color }}
                />
              </div>
            </div>
          );
        })}

        {/* Summary pills */}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-100 flex-wrap">
          {[
            {
              label: "Approved",
              value: leaveStats.approved,
              cls: "bg-emerald-50 border-emerald-200 text-emerald-700",
            },
            {
              label: "Pending",
              value: leaveStats.pending,
              cls: "bg-amber-50 border-amber-200 text-amber-700",
            },
            {
              label: "Rejected",
              value: leaveStats.rejected,
              cls: "bg-red-50 border-red-200 text-red-700",
            },
          ].map((p) => (
            <span
              key={p.label}
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border font-medium",
                p.cls,
              )}
              style={{ fontSize: "11px" }}
            >
              {p.label}
              <span className="font-bold">{p.value}</span>
            </span>
          ))}
        </div>
      </div>
    </DashCard>
  );
}

// ── Monthly attendance stats ──────────────────────────────────────────────────
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
      <DashCard
        title="Monthly Attendance"
        subtitle={`${MONTHS[month - 1]} ${year}`}
      >
        <EmptyPanel icon={Clock} title="No attendance data" />
      </DashCard>
    );
  }

  const total = stats.totalDays || 1;
  const rows = [
    {
      label: "Present",
      value: stats.present,
      color: "#10b981",
      badge: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Absent",
      value: stats.absent,
      color: "#ef4444",
      badge: "bg-red-50 text-red-700",
    },
    {
      label: "Late",
      value: stats.late,
      color: "#f59e0b",
      badge: "bg-amber-50 text-amber-700",
    },
    {
      label: "Half Day",
      value: stats.halfDay,
      color: "#8b5cf6",
      badge: "bg-purple-50 text-purple-700",
    },
    {
      label: "On Leave",
      value: stats.onLeave,
      color: "#3b82f6",
      badge: "bg-blue-50 text-blue-700",
    },
  ];

  return (
    <DashCard
      title="Monthly Attendance"
      subtitle={`${MONTHS[month - 1]} ${year} · ${stats.totalDays} records`}
    >
      <div className="flex items-start gap-5">
        {/* Donut */}
        <div className="flex flex-col items-center shrink-0">
          <DonutRing
            value={stats.present}
            total={total}
            color="#10b981"
            size={80}
          />
          <p className="text-gray-400 mt-1" style={{ fontSize: "10px" }}>
            Attendance rate
          </p>
        </div>

        {/* Bars */}
        <div className="flex-1 space-y-2.5 min-w-0">
          {rows.map((r) => {
            const pct = total > 0 ? Math.round((r.value / total) * 100) : 0;
            return (
              <div key={r.label}>
                <div className="flex items-center justify-between mb-1">
                  <span
                    className="font-medium text-gray-600"
                    style={{ fontSize: "11px" }}
                  >
                    {r.label}
                  </span>
                  <span
                    className={cn(
                      "px-1.5 py-0.5 rounded-full font-bold leading-none",
                      r.badge,
                    )}
                    style={{ fontSize: "10px" }}
                  >
                    {r.value}
                  </span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, backgroundColor: r.color }}
                  />
                </div>
              </div>
            );
          })}

          {/* Hours summary */}
          <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
            {[
              {
                label: "Total Hours",
                value: `${stats.totalHours?.toFixed(0) ?? 0}h`,
                cls: "text-gray-800",
              },
              {
                label: "Overtime",
                value: `${stats.totalOvertime?.toFixed(1) ?? 0}h`,
                cls: "text-purple-600",
              },
              {
                label: "Avg/Day",
                value: `${stats.averageHoursPerDay?.toFixed(1) ?? 0}h`,
                cls: "text-gray-800",
              },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-gray-400" style={{ fontSize: "10px" }}>
                  {s.label}
                </p>
                <p
                  className={cn("font-bold", s.cls)}
                  style={{ fontSize: "13px" }}
                >
                  {s.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashCard>
  );
}

// ── Payslip breakdown ─────────────────────────────────────────────────────────
function PayslipBreakdownCard({
  payslips,
  month,
  year,
  navigate,
}: {
  payslips: any[];
  month: number;
  year: number;
  navigate: (p: string) => void;
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
      badge: "bg-emerald-50 text-emerald-700",
      amount: paid.reduce((s, p) => s + Number(p.netPay ?? 0), 0),
    },
    {
      label: "Generated",
      count: generated.length,
      color: "#3b82f6",
      badge: "bg-blue-50 text-blue-700",
      amount: generated.reduce((s, p) => s + Number(p.netPay ?? 0), 0),
    },
    {
      label: "Draft",
      count: draft.length,
      color: "#9ca3af",
      badge: "bg-gray-100 text-gray-600",
      amount: draft.reduce((s, p) => s + Number(p.netPay ?? 0), 0),
    },
  ];

  return (
    <DashCard
      title="Payroll Breakdown"
      subtitle={`${MONTHS[month - 1]} ${year}`}
      action={
        <NavLink label="Payslips" href="/hr/payslips" navigate={navigate} />
      }
    >
      {payslips.length === 0 ? (
        <EmptyPanel icon={Wallet} title="No payslips this period" />
      ) : (
        <div className="space-y-4">
          {/* Summary row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                label: "Gross",
                value: `$${totalGross.toLocaleString()}`,
                cls: "text-gray-800",
              },
              {
                label: "Deductions",
                value: `-$${totalDeductions.toLocaleString()}`,
                cls: "text-red-500",
              },
              {
                label: "Net Pay",
                value: `$${totalNet.toLocaleString()}`,
                cls: "text-emerald-600",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-gray-50 rounded-xl p-3 text-center"
              >
                <p
                  className="text-gray-400 mb-0.5"
                  style={{ fontSize: "10px" }}
                >
                  {s.label}
                </p>
                <p
                  className={cn("font-bold", s.cls)}
                  style={{ fontSize: "13px" }}
                >
                  {s.value}
                </p>
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
                      <span
                        className="font-medium text-gray-600"
                        style={{ fontSize: "11px" }}
                      >
                        {b.label}
                      </span>
                      <span
                        className={cn(
                          "px-1.5 py-0.5 rounded-full font-bold leading-none",
                          b.badge,
                        )}
                        style={{ fontSize: "10px" }}
                      >
                        {b.count}
                      </span>
                    </div>
                    <span
                      className="text-gray-400"
                      style={{ fontSize: "11px" }}
                    >
                      ${b.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: b.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </DashCard>
  );
}

// ── Recent payslips ───────────────────────────────────────────────────────────
function RecentPayslipsCard({
  payslips,
  navigate,
}: {
  payslips: any[];
  navigate: (p: string) => void;
}) {
  return (
    <DashCard
      title="Recent Payslips"
      subtitle="Latest entries"
      action={
        <NavLink label="View all" href="/hr/payslips" navigate={navigate} />
      }
      noPadding
    >
      {payslips.length === 0 ? (
        <EmptyPanel
          icon={FileText}
          title="No payslips yet"
          subtitle="Generate payslips from the Payslips tab"
        />
      ) : (
        <div className="divide-y divide-gray-50">
          {payslips.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-3 px-5 py-3.5 hover:bg-stone-50/60 transition-colors"
            >
              <Avatar
                name={p.user?.name}
                colorClass="bg-purple-50 text-purple-700"
              />
              <div className="flex-1 min-w-0">
                <p
                  className="font-semibold text-gray-800 truncate"
                  style={{ fontSize: "13px" }}
                >
                  {p.user?.name ?? "—"}
                </p>
                <p className="text-gray-400" style={{ fontSize: "11px" }}>
                  {MONTHS[p.month - 1]} {p.year}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p
                  className="font-bold text-gray-900"
                  style={{ fontSize: "13px" }}
                >
                  ${Number(p.netPay).toLocaleString()}
                </p>
                <PayslipStatusBadge status={p.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </DashCard>
  );
}
