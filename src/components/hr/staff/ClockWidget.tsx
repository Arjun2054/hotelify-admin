// src/components/hr/staff/ClockWidget.tsx

import { useState } from "react";
import { useHrStore } from "@/store/hr/useHrStore";
import type { AttendanceToday } from "@/types/hr-types";
import { AttendanceStatusBadge } from "@/components/hr/shared/StatusBadge";
import { Clock, LogIn, LogOut, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface Props {
  todayStatus: AttendanceToday | null;
}

export default function ClockWidget({ todayStatus }: Props) {
  const { clockIn, clockOut, isLoading } = useHrStore();
  const [notes, setNotes] = useState("");

  const hasClockedIn = todayStatus?.hasClockedIn ?? false;
  const hasClockedOut = todayStatus?.hasClockedOut ?? false;
  const record = todayStatus?.record;

  const handleClockIn = async () => {
    try {
      await clockIn(notes || undefined);
      toast.success("Clocked in successfully!");
      setNotes("");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to clock in");
    }
  };

  const handleClockOut = async () => {
    try {
      await clockOut(notes || undefined);
      toast.success("Clocked out. Have a good rest!");
      setNotes("");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to clock out");
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col gap-4">
      {/* Current time */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-600">
            Today's Attendance
          </span>
        </div>
        <span className="text-xs text-slate-400">
          {format(new Date(), "EEEE, MMM d")}
        </span>
      </div>

      {/* Status */}
      {record ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <AttendanceStatusBadge status={record.status as any} />
            {record.totalHours != null && (
              <span className="text-sm font-semibold text-slate-700">
                {Number(record.totalHours).toFixed(1)}h worked
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-emerald-50 rounded-xl p-3 text-center">
              <p className="text-xs text-slate-500 mb-1">Clock In</p>
              <p className="text-base font-bold text-emerald-700">
                {record.clockIn
                  ? format(new Date(record.clockIn), "HH:mm")
                  : "—"}
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <p className="text-xs text-slate-500 mb-1">Clock Out</p>
              <p className="text-base font-bold text-slate-700">
                {record.clockOut
                  ? format(new Date(record.clockOut), "HH:mm")
                  : "—"}
              </p>
            </div>
          </div>

          {record.lateMinutes > 0 && (
            <div className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
              ⚠️ {record.lateMinutes} min late
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-2">
            <Clock className="w-6 h-6 text-slate-400" />
          </div>
          <p className="text-sm text-slate-500">Not clocked in yet</p>
        </div>
      )}

      {/* Notes input */}
      <input
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notes (optional)..."
        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
      />

      {/* Actions */}
      {!hasClockedIn ? (
        <button
          disabled={isLoading}
          onClick={handleClockIn}
          className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors disabled:opacity-50"
        >
          {isLoading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <LogIn className="w-4 h-4" />
          )}
          Clock In
        </button>
      ) : !hasClockedOut ? (
        <button
          disabled={isLoading}
          onClick={handleClockOut}
          className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-semibold text-white bg-slate-700 hover:bg-slate-800 rounded-xl transition-colors disabled:opacity-50"
        >
          {isLoading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <LogOut className="w-4 h-4" />
          )}
          Clock Out
        </button>
      ) : (
        <div className="text-center py-1">
          <p className="text-sm text-slate-500 font-medium">
            ✓ Shift complete for today
          </p>
        </div>
      )}
    </div>
  );
}
