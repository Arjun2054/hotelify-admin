// src/components/hr/admin/AdminAttendancePanel.tsx

import { useEffect, useState } from "react";
import { useHrStore } from "@/store/hr/useHrStore";
import SectionCard from "@/components/hr/shared/SectionCard";
import StatCard from "@/components/hr/shared/StatCard";
import EmptyState from "@/components/hr/shared/EmptyState";
import { AttendanceStatusBadge } from "@/components/hr/shared/StatusBadge";
import type { AttendanceRecord } from "@/types/hr-types";
import {
  Clock,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Plus,
  Pencil,
  Filter,
  CalendarDays,
  Timer,
  UserCheck,
} from "lucide-react";
import { format } from "date-fns";
import CreateAttendanceModal from "./CreateAttendanceModal";
import EditAttendanceModal from "./EditAttendanceModal";

type AttendanceStatusType =
  | "PRESENT"
  | "ABSENT"
  | "HALF_DAY"
  | "LATE"
  | "ON_LEAVE";

const STATUS_OPTIONS: AttendanceStatusType[] = [
  "PRESENT",
  "ABSENT",
  "HALF_DAY",
  "LATE",
  "ON_LEAVE",
];

export default function AdminAttendancePanel() {
  const {
    allAttendance,
    attendanceMeta,
    attendanceStats,
    isLoading,
    fetchAllAttendance,
    fetchAttendanceStats,
  } = useHrStore();

  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Record<string, string>>({
    dateFrom: format(new Date(), "yyyy-MM-dd"),
    dateTo: format(new Date(), "yyyy-MM-dd"),
  });

  // Modal state
  const [showCreate, setShowCreate] = useState(false);
  const [editRecord, setEditRecord] = useState<AttendanceRecord | null>(null);

  // ── Load data ──────────────────────────────────────────
  useEffect(() => {
    fetchAllAttendance(filters, page);
  }, [page, filters]);

  useEffect(() => {
    const today = new Date();
    fetchAttendanceStats(undefined, today.getMonth() + 1, today.getFullYear());
  }, []);

  // ── Helpers ────────────────────────────────────────────
  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const resetFilters = () => {
    setFilters({
      dateFrom: format(new Date(), "yyyy-MM-dd"),
      dateTo: format(new Date(), "yyyy-MM-dd"),
    });
    setPage(1);
  };

  const onRecordSaved = () => {
    fetchAllAttendance(filters, page);
    fetchAttendanceStats(
      undefined,
      new Date().getMonth() + 1,
      new Date().getFullYear(),
    );
  };

  // ── Render ─────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* ── Stats Row ─────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Present (Month)"
          value={attendanceStats?.present ?? 0}
          icon={UserCheck}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
          subtitle="Current month"
        />
        <StatCard
          label="Absent (Month)"
          value={attendanceStats?.absent ?? 0}
          icon={AlertTriangle}
          iconColor="text-rose-500"
          iconBg="bg-rose-50"
          subtitle="Current month"
        />
        <StatCard
          label="Late (Month)"
          value={attendanceStats?.late ?? 0}
          icon={Timer}
          iconColor="text-amber-500"
          iconBg="bg-amber-50"
          subtitle="Current month"
        />
        <StatCard
          label="Avg Hours / Day"
          value={
            attendanceStats
              ? `${attendanceStats.averageHoursPerDay.toFixed(1)}h`
              : "—"
          }
          icon={TrendingUp}
          iconColor="text-blue-500"
          iconBg="bg-blue-50"
          subtitle="Current month"
        />
      </div>

      {/* ── Filter Bar ────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Status filter */}
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={filters.status ?? ""}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="text-sm text-slate-700 bg-transparent outline-none pr-1"
          >
            <option value="">All Status</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>

        {/* Date range */}
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm">
          <CalendarDays className="w-4 h-4 text-slate-400 shrink-0" />
          <label className="text-xs text-slate-400 shrink-0">From</label>
          <input
            type="date"
            value={filters.dateFrom ?? ""}
            onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
            className="text-sm text-slate-700 bg-transparent outline-none"
          />
        </div>

        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm">
          <CalendarDays className="w-4 h-4 text-slate-400 shrink-0" />
          <label className="text-xs text-slate-400 shrink-0">To</label>
          <input
            type="date"
            value={filters.dateTo ?? ""}
            onChange={(e) => handleFilterChange("dateTo", e.target.value)}
            className="text-sm text-slate-700 bg-transparent outline-none"
          />
        </div>

        {/* Reset */}
        <button
          onClick={resetFilters}
          className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-500 hover:text-slate-700 bg-white border border-slate-200 rounded-lg shadow-sm transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reset
        </button>

        {/* Create — pushed to the right */}
        <button
          onClick={() => setShowCreate(true)}
          className="ml-auto flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-stone-700 hover:bg-stone-800 rounded-lg shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Record
        </button>
      </div>

      {/* ── Table ─────────────────────────────────────── */}
      <SectionCard
        title="Attendance Records"
        subtitle={`${attendanceMeta?.total ?? 0} total records`}
        noPadding
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-6 h-6 text-slate-300 animate-spin" />
          </div>
        ) : allAttendance.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="No attendance records found"
            description="Try adjusting your filters, or add a manual record."
            action={
              <button
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-stone-700 hover:bg-stone-800 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Record
              </button>
            }
          />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60">
                    {[
                      "Staff",
                      "Date",
                      "Clock In",
                      "Clock Out",
                      "Break",
                      "Total Hrs",
                      "Overtime",
                      "Late",
                      "Status",
                      "Notes",
                      "",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {allAttendance.map((record) => (
                    <AttendanceTableRow
                      key={record.id}
                      record={record}
                      onEdit={() => setEditRecord(record)}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-slate-100">
              {allAttendance.map((record) => (
                <AttendanceMobileCard
                  key={record.id}
                  record={record}
                  onEdit={() => setEditRecord(record)}
                />
              ))}
            </div>

            {/* Pagination */}
            {attendanceMeta && attendanceMeta.totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 bg-slate-50/40">
                <p className="text-sm text-slate-400">
                  Page{" "}
                  <span className="font-semibold text-slate-600">
                    {attendanceMeta.page}
                  </span>{" "}
                  of {attendanceMeta.totalPages} ·{" "}
                  <span className="font-semibold text-slate-600">
                    {attendanceMeta.total}
                  </span>{" "}
                  records
                </p>
                <div className="flex items-center gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Prev
                  </button>
                  <button
                    disabled={page === attendanceMeta.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </SectionCard>

      {/* ── Modals ────────────────────────────────────── */}
      {showCreate && (
        <CreateAttendanceModal
          onClose={() => setShowCreate(false)}
          onSaved={() => {
            setShowCreate(false);
            onRecordSaved();
          }}
        />
      )}

      {editRecord && (
        <EditAttendanceModal
          record={editRecord}
          onClose={() => setEditRecord(null)}
          onSaved={() => {
            setEditRecord(null);
            onRecordSaved();
          }}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Desktop Table Row
// ─────────────────────────────────────────────────────────
interface RowProps {
  record: AttendanceRecord;
  onEdit: () => void;
}

function AttendanceTableRow({ record, onEdit }: RowProps) {
  return (
    <tr className="hover:bg-slate-50/60 transition-colors group">
      {/* Staff */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-100 to-blue-200 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-blue-700">
              {record.user?.name?.charAt(0).toUpperCase() ?? "?"}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">
              {record.user?.name ?? "—"}
            </p>
            <p className="text-xs text-slate-400 truncate">
              {record.user?.email ?? ""}
            </p>
          </div>
        </div>
      </td>

      {/* Date */}
      <td className="px-4 py-3.5 whitespace-nowrap">
        <p className="text-sm font-medium text-slate-700">
          {format(new Date(record.date), "EEE, MMM d")}
        </p>
        <p className="text-xs text-slate-400">
          {format(new Date(record.date), "yyyy")}
        </p>
      </td>

      {/* Clock In */}
      <td className="px-4 py-3.5">
        <span className="text-sm font-mono text-slate-700">
          {record.clockIn ? (
            format(new Date(record.clockIn), "HH:mm")
          ) : (
            <span className="text-slate-300">—</span>
          )}
        </span>
      </td>

      {/* Clock Out */}
      <td className="px-4 py-3.5">
        <span className="text-sm font-mono text-slate-700">
          {record.clockOut ? (
            format(new Date(record.clockOut), "HH:mm")
          ) : (
            <span className="text-slate-300">—</span>
          )}
        </span>
      </td>

      {/* Break */}
      <td className="px-4 py-3.5">
        <span className="text-sm text-slate-600">
          {record.breakMinutes > 0 ? `${record.breakMinutes}m` : "—"}
        </span>
      </td>

      {/* Total Hrs */}
      <td className="px-4 py-3.5">
        {record.totalHours != null ? (
          <span className="text-sm font-semibold text-slate-800">
            {Number(record.totalHours).toFixed(1)}h
          </span>
        ) : (
          <span className="text-slate-300 text-sm">—</span>
        )}
      </td>

      {/* Overtime */}
      <td className="px-4 py-3.5">
        {Number(record.overtime) > 0 ? (
          <span className="text-sm font-medium text-violet-600">
            +{Number(record.overtime).toFixed(1)}h
          </span>
        ) : (
          <span className="text-slate-300 text-sm">—</span>
        )}
      </td>

      {/* Late */}
      <td className="px-4 py-3.5">
        {record.lateMinutes > 0 ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
            {record.lateMinutes}m
          </span>
        ) : (
          <span className="text-slate-300 text-sm">—</span>
        )}
      </td>

      {/* Status */}
      <td className="px-4 py-3.5">
        <AttendanceStatusBadge status={record.status as any} />
      </td>

      {/* Notes */}
      <td className="px-4 py-3.5 max-w-[140px]">
        {record.notes ? (
          <p className="text-xs text-slate-500 truncate" title={record.notes}>
            {record.notes}
          </p>
        ) : (
          <span className="text-slate-300 text-sm">—</span>
        )}
      </td>

      {/* Edit action */}
      <td className="px-4 py-3.5">
        <button
          onClick={onEdit}
          className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all"
        >
          <Pencil className="w-3.5 h-3.5" />
          Edit
        </button>
      </td>
    </tr>
  );
}

// ─────────────────────────────────────────────────────────
// Mobile Card
// ─────────────────────────────────────────────────────────
function AttendanceMobileCard({ record, onEdit }: RowProps) {
  return (
    <div className="px-4 py-4 space-y-3">
      {/* Top row: avatar + name + status + edit */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-blue-700">
              {record.user?.name?.charAt(0).toUpperCase() ?? "?"}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">
              {record.user?.name ?? "—"}
            </p>
            <p className="text-xs text-slate-400">
              {format(new Date(record.date), "EEE, MMM d, yyyy")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <AttendanceStatusBadge status={record.status as any} />
          <button
            onClick={onEdit}
            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Time row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-slate-50 rounded-lg p-2 text-center">
          <p className="text-[10px] text-slate-400 mb-0.5">In</p>
          <p className="text-sm font-mono font-semibold text-slate-700">
            {record.clockIn ? format(new Date(record.clockIn), "HH:mm") : "—"}
          </p>
        </div>
        <div className="bg-slate-50 rounded-lg p-2 text-center">
          <p className="text-[10px] text-slate-400 mb-0.5">Out</p>
          <p className="text-sm font-mono font-semibold text-slate-700">
            {record.clockOut ? format(new Date(record.clockOut), "HH:mm") : "—"}
          </p>
        </div>
        <div className="bg-slate-50 rounded-lg p-2 text-center">
          <p className="text-[10px] text-slate-400 mb-0.5">Hours</p>
          <p className="text-sm font-semibold text-slate-700">
            {record.totalHours != null
              ? `${Number(record.totalHours).toFixed(1)}h`
              : "—"}
          </p>
        </div>
      </div>

      {/* Tags row */}
      <div className="flex items-center gap-2 flex-wrap">
        {record.lateMinutes > 0 && (
          <span className="text-xs px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full font-medium">
            {record.lateMinutes}m late
          </span>
        )}
        {Number(record.overtime) > 0 && (
          <span className="text-xs px-2 py-0.5 bg-violet-50 text-violet-700 rounded-full font-medium">
            +{Number(record.overtime).toFixed(1)}h OT
          </span>
        )}
        {record.breakMinutes > 0 && (
          <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
            {record.breakMinutes}m break
          </span>
        )}
        {record.notes && (
          <span
            className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full truncate max-w-[160px]"
            title={record.notes}
          >
            {record.notes}
          </span>
        )}
      </div>
    </div>
  );
}
