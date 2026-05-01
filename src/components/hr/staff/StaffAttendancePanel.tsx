// src/components/hr/staff/StaffAttendancePanel.tsx

import { useEffect, useState } from "react";
import { useHrStore } from "@/store/hr/useHrStore";
import SectionCard from "@/components/hr/shared/SectionCard";
import StatCard from "@/components/hr/shared/StatCard";
import EmptyState from "@/components/hr/shared/EmptyState";
import ClockWidget from "./ClockWidget";
import { AttendanceStatusBadge } from "@/components/hr/shared/StatusBadge";
import {
  Clock,
  Users,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { format } from "date-fns";

export default function StaffAttendancePanel() {
  const {
    myAttendance,
    attendanceStats,
    todayStatus,
    isLoading,
    fetchMyAttendance,
    fetchAttendanceStats,
    fetchTodayStatus,
  } = useHrStore();

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchTodayStatus();
    fetchMyAttendance(selectedMonth, selectedYear);
    fetchAttendanceStats(undefined, selectedMonth, selectedYear);
  }, [selectedMonth, selectedYear]);

  const MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <div className="space-y-6">
      {/* Clock widget + Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ClockWidget todayStatus={todayStatus} />

        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          <StatCard
            label="Present Days"
            value={attendanceStats?.present ?? 0}
            icon={Users}
            iconColor="text-emerald-600"
            iconBg="bg-emerald-50"
            subtitle={`${MONTHS[selectedMonth - 1]} ${selectedYear}`}
          />
          <StatCard
            label="Absent Days"
            value={attendanceStats?.absent ?? 0}
            icon={AlertTriangle}
            iconColor="text-rose-500"
            iconBg="bg-rose-50"
          />
          <StatCard
            label="Late Arrivals"
            value={attendanceStats?.late ?? 0}
            icon={Clock}
            iconColor="text-amber-500"
            iconBg="bg-amber-50"
          />
          <StatCard
            label="Total Hours"
            value={
              attendanceStats
                ? `${attendanceStats.totalHours.toFixed(0)}h`
                : "—"
            }
            icon={TrendingUp}
            iconColor="text-blue-500"
            iconBg="bg-blue-50"
          />
        </div>
      </div>

      {/* History */}
      <SectionCard
        title="Attendance History"
        subtitle={`${MONTHS[selectedMonth - 1]} ${selectedYear}`}
        actions={
          <div className="flex items-center gap-2">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white"
            >
              {MONTHS.map((m, i) => (
                <option key={i} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white"
            >
              {[2024, 2025, 2026].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        }
        noPadding
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <RefreshCw className="w-5 h-5 text-slate-400 animate-spin" />
          </div>
        ) : myAttendance.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="No attendance records"
            description="Your clock-in history will appear here"
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {myAttendance.map((record) => (
              <div
                key={record.id}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/50 transition-colors"
              >
                <div className="w-10 text-center shrink-0">
                  <p className="text-lg font-bold text-slate-800">
                    {format(new Date(record.date), "d")}
                  </p>
                  <p className="text-xs text-slate-400">
                    {format(new Date(record.date), "EEE")}
                  </p>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <AttendanceStatusBadge status={record.status as any} />
                    {record.lateMinutes > 0 && (
                      <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                        {record.lateMinutes}m late
                      </span>
                    )}
                  </div>
                  {record.notes && (
                    <p className="text-xs text-slate-400 mt-0.5 truncate">
                      {record.notes}
                    </p>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <p className="text-sm font-medium text-slate-700">
                    {record.clockIn
                      ? format(new Date(record.clockIn), "HH:mm")
                      : "—"}{" "}
                    →{" "}
                    {record.clockOut
                      ? format(new Date(record.clockOut), "HH:mm")
                      : "—"}
                  </p>
                  {record.totalHours != null && (
                    <p className="text-xs text-slate-400">
                      {Number(record.totalHours).toFixed(1)}h
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
