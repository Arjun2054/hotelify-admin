// src/components/hr/admin/EditAttendanceModal.tsx

import { useState } from "react";
import { useHrStore } from "@/store/hr/useHrStore";
import type { AttendanceRecord } from "@/types/hr-types";
import { Clock, CalendarDays, StickyNote } from "lucide-react";
import { format } from "date-fns";

type AttendanceStatus = "PRESENT" | "ABSENT" | "HALF_DAY" | "LATE" | "ON_LEAVE";

const STATUS_CONFIG: Record<
  AttendanceStatus,
  { label: string; color: string; bg: string }
> = {
  PRESENT: {
    label: "Present",
    color: "text-emerald-700",
    bg: "bg-emerald-100",
  },
  ABSENT: { label: "Absent", color: "text-rose-700", bg: "bg-rose-100" },
  HALF_DAY: {
    label: "Half Day",
    color: "text-amber-700",
    bg: "bg-amber-100",
  },
  LATE: { label: "Late", color: "text-orange-700", bg: "bg-orange-100" },
  ON_LEAVE: { label: "On Leave", color: "text-blue-700", bg: "bg-blue-100" },
};

function extractTime(iso?: string | null): string {
  if (!iso) return "";
  try {
    return format(new Date(iso), "HH:mm");
  } catch {
    return "";
  }
}

function toISODateTime(date: string, time: string): string | undefined {
  if (!date || !time) return undefined;
  return new Date(`${date}T${time}:00`).toISOString();
}

function calcTotalHours(
  clockIn: string,
  clockOut: string,
  breakMinutes: number,
): number | null {
  if (!clockIn || !clockOut) return null;
  const inDate = new Date(`1970-01-01T${clockIn}:00`);
  const outDate = new Date(`1970-01-01T${clockOut}:00`);
  const diffMs = outDate.getTime() - inDate.getTime();
  if (diffMs <= 0) return null;
  return Math.max(0, (diffMs / 1000 / 60 - breakMinutes) / 60);
}

interface EditFormState {
  status: AttendanceStatus;
  clockIn: string;
  clockOut: string;
  breakMinutes: number;
  lateMinutes: number;
  overtime: number;
  notes: string;
}

interface Props {
  record: AttendanceRecord;
  onClose: () => void;
  onSaved: () => void;
}

export default function EditAttendanceModal({
  record,
  onClose,
  onSaved,
}: Props) {
  const { updateAttendance } = useHrStore();

  const dateStr = format(new Date(record.date), "yyyy-MM-dd");

  const [form, setForm] = useState<EditFormState>({
    status: record.status as AttendanceStatus,
    clockIn: extractTime(record.clockIn),
    clockOut: extractTime(record.clockOut),
    breakMinutes: record.breakMinutes ?? 0,
    lateMinutes: record.lateMinutes ?? 0,
    overtime: Number(record.overtime) ?? 0,
    notes: record.notes ?? "",
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof EditFormState, string>>
  >({});
  const [isSaving, setIsSaving] = useState(false);

  const computedHours = calcTotalHours(
    form.clockIn,
    form.clockOut,
    form.breakMinutes,
  );

  const handleStatusChange = (status: AttendanceStatus) => {
    setForm((f) => ({
      ...f,
      status,
      ...(status === "ABSENT" || status === "ON_LEAVE"
        ? { clockIn: "", clockOut: "", lateMinutes: 0, overtime: 0 }
        : {}),
    }));
  };

  const validate = () => {
    const errs: Partial<Record<keyof EditFormState, string>> = {};
    if (form.clockIn && form.clockOut) {
      const inT = new Date(`1970-01-01T${form.clockIn}:00`);
      const outT = new Date(`1970-01-01T${form.clockOut}:00`);
      if (outT <= inT) errs.clockOut = "Clock-out must be after clock-in";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSaving(true);
    try {
      await updateAttendance(record.id, {
        status: form.status,
        clockIn: toISODateTime(dateStr, form.clockIn),
        clockOut: toISODateTime(dateStr, form.clockOut),
        breakMinutes: form.breakMinutes,
        lateMinutes: form.lateMinutes,
        overtime: form.overtime,
        totalHours: computedHours ?? undefined,
        notes: form.notes || undefined,
      });
      toast.success("Attendance record updated");
      onSaved();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to update");
    } finally {
      setIsSaving(false);
    }
  };

  const needsTime =
    form.status === "PRESENT" ||
    form.status === "LATE" ||
    form.status === "HALF_DAY";

  return (
    <ModalShell
      title="Edit Attendance Record"
      subtitle={`${record.user?.name ?? "Staff"} · ${format(new Date(record.date), "EEEE, MMMM d, yyyy")}`}
      onClose={onClose}
    >
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
        {/* Read-only info strip */}
        <div className="flex items-center gap-4 p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
          <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-100 to-blue-200 flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-blue-700">
              {record.user?.name?.charAt(0).toUpperCase() ?? "?"}
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">
              {record.user?.name ?? "—"}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
              <p className="text-xs text-slate-500">
                {format(new Date(record.date), "EEEE, MMMM d, yyyy")}
              </p>
            </div>
          </div>
        </div>

        {/* Status selector */}
        <div>
          <FieldLabel label="Status" required />
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-1">
            {(Object.keys(STATUS_CONFIG) as AttendanceStatus[]).map((s) => {
              const cfg = STATUS_CONFIG[s];
              const active = form.status === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleStatusChange(s)}
                  className={`flex flex-col items-center justify-center gap-1 px-2 py-2.5 rounded-xl text-xs font-semibold border-2 transition-all ${
                    active
                      ? `${cfg.bg} ${cfg.color} border-current shadow-sm scale-[1.02]`
                      : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {active && (
                    <span className="w-2 h-2 rounded-full bg-current" />
                  )}
                  {cfg.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Time fields */}
        {needsTime && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-slate-400" />
              <h4 className="text-sm font-semibold text-slate-700">
                Time Details
              </h4>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  Clock In
                </label>
                <input
                  type="time"
                  value={form.clockIn}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, clockIn: e.target.value }))
                  }
                  className={inputCls(false)}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  Clock Out
                </label>
                <input
                  type="time"
                  value={form.clockOut}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, clockOut: e.target.value }))
                  }
                  className={inputCls(!!errors.clockOut)}
                />
                {errors.clockOut && <FieldError msg={errors.clockOut} />}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  Break (minutes)
                </label>
                <input
                  type="number"
                  min={0}
                  max={480}
                  value={form.breakMinutes || ""}
                  placeholder="0"
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      breakMinutes: Number(e.target.value),
                    }))
                  }
                  className={inputCls(false)}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  Late (minutes)
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.lateMinutes || ""}
                  placeholder="0"
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      lateMinutes: Number(e.target.value),
                    }))
                  }
                  className={inputCls(false)}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  Overtime (hours)
                </label>
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  value={form.overtime || ""}
                  placeholder="0"
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      overtime: Number(e.target.value),
                    }))
                  }
                  className={inputCls(false)}
                />
              </div>

              {computedHours !== null && (
                <div className="flex items-center">
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl w-full">
                    <Clock className="w-4 h-4 text-emerald-500 shrink-0" />
                    <div>
                      <p className="text-xs text-emerald-600 font-medium">
                        Computed Total
                      </p>
                      <p className="text-base font-bold text-emerald-700">
                        {computedHours.toFixed(2)}h
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        <div>
          <FieldLabel icon={StickyNote} label="Notes" />
          <textarea
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            placeholder="Optional notes…"
            rows={2}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent placeholder:text-slate-300"
          />
        </div>
      </div>

      <ModalFooter
        onCancel={onClose}
        onSubmit={handleSave}
        isSaving={isSaving}
        submitLabel="Save Changes"
      />
    </ModalShell>
  );
}

// ─────────────────────────────────────────────────────────
// Shared primitives used by both modals
// (put these in a shared file if you prefer)
// ─────────────────────────────────────────────────────────

import { X, RefreshCw, Save } from "lucide-react";
import { toast } from "sonner";

export function ModalShell({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{title}</h2>
            {subtitle && (
              <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors shrink-0 ml-3"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

export function ModalFooter({
  onCancel,
  onSubmit,
  isSaving,
  submitLabel,
}: {
  onCancel: () => void;
  onSubmit: () => void;
  isSaving: boolean;
  submitLabel: string;
}) {
  return (
    <div className="flex items-center gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/60 rounded-b-2xl shrink-0">
      <button
        onClick={onCancel}
        disabled={isSaving}
        className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors disabled:opacity-50"
      >
        Cancel
      </button>
      <button
        onClick={onSubmit}
        disabled={isSaving}
        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors disabled:opacity-50 shadow-sm"
      >
        {isSaving ? (
          <RefreshCw className="w-4 h-4 animate-spin" />
        ) : (
          <Save className="w-4 h-4" />
        )}
        {isSaving ? "Saving…" : submitLabel}
      </button>
    </div>
  );
}

// ── Small reusable field helpers ──────────────────────────

export function FieldLabel({
  label,
  required,
  icon: Icon,
}: {
  label: string;
  required?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-1.5">
      {Icon && <Icon className="w-3.5 h-3.5 text-slate-400" />}
      {label}
      {required && <span className="text-rose-400 ml-0.5">*</span>}
    </label>
  );
}

export function FieldError({ msg }: { msg: string }) {
  return <p className="mt-1 text-xs text-rose-500 font-medium">{msg}</p>;
}

export function SkeletonInput() {
  return <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />;
}

export function inputCls(hasError: boolean) {
  return [
    "w-full border rounded-xl px-3 py-2.5 text-sm text-slate-800",
    "focus:outline-none focus:ring-2 focus:border-transparent",
    "placeholder:text-slate-300 transition-colors",
    hasError
      ? "border-rose-300 focus:ring-rose-300 bg-rose-50/30"
      : "border-slate-200 focus:ring-emerald-300 bg-white",
  ].join(" ");
}
