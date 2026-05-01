// src/components/hr/admin/CreateAttendanceModal.tsx

import { useEffect, useState } from "react";
import { useHrStore } from "@/store/hr/useHrStore";
import { hrService } from "@/services/hr/hrService";
import {
  X,
  RefreshCw,
  UserCheck,
  Clock,
  CalendarDays,
  StickyNote,
  ChevronDown,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  FieldError,
  FieldLabel,
  inputCls,
  ModalFooter,
  ModalShell,
  SkeletonInput,
} from "./EditAttendanceModal";

// ── Types ──────────────────────────────────────────────────
type AttendanceStatus = "PRESENT" | "ABSENT" | "HALF_DAY" | "LATE" | "ON_LEAVE";

interface StaffMember {
  userId: string;
  name: string;
  email: string;
}

interface FormState {
  userId: string;
  date: string;
  status: AttendanceStatus;
  clockIn: string;
  clockOut: string;
  breakMinutes: number;
  lateMinutes: number;
  overtime: number;
  notes: string;
}

// ── Status config ──────────────────────────────────────────
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

// ── Helpers ────────────────────────────────────────────────
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

// ── Component ──────────────────────────────────────────────
interface Props {
  onClose: () => void;
  onSaved: () => void;
}

const EMPTY_FORM: FormState = {
  userId: "",
  date: format(new Date(), "yyyy-MM-dd"),
  status: "PRESENT",
  clockIn: "",
  clockOut: "",
  breakMinutes: 0,
  lateMinutes: 0,
  overtime: 0,
  notes: "",
};

export default function CreateAttendanceModal({ onClose, onSaved }: Props) {
  const { createAttendance } = useHrStore();

  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<
    Partial<Record<keyof FormState, string>>
  >({});

  // ── Load staff list ──────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const balances = await hrService.getAllBalances(
          new Date().getFullYear(),
        );
        const seen = new Set<string>();
        const members: StaffMember[] = [];
        for (const b of balances ?? []) {
          if (!seen.has(b.user.userId)) {
            seen.add(b.user.userId);
            members.push(b.user);
          }
        }
        setStaff(members);
      } catch {
        setStaff([]);
        toast.error("Could not load staff list");
      } finally {
        setLoadingStaff(false);
      }
    };
    load();
  }, []);

  // ── Auto-populate late minutes if status = LATE ──────────
  const handleStatusChange = (status: AttendanceStatus) => {
    setForm((f) => ({
      ...f,
      status,
      // Clear time fields for non-working statuses
      ...(status === "ABSENT" || status === "ON_LEAVE"
        ? { clockIn: "", clockOut: "", lateMinutes: 0, overtime: 0 }
        : {}),
    }));
  };

  // ── Computed total hours ─────────────────────────────────
  const computedHours = calcTotalHours(
    form.clockIn,
    form.clockOut,
    form.breakMinutes,
  );

  // ── Validation ───────────────────────────────────────────
  const validate = (): boolean => {
    const errs: Partial<Record<keyof FormState, string>> = {};
    if (!form.userId) errs.userId = "Select a staff member";
    if (!form.date) errs.date = "Date is required";
    if (form.clockIn && form.clockOut) {
      const inT = new Date(`1970-01-01T${form.clockIn}:00`);
      const outT = new Date(`1970-01-01T${form.clockOut}:00`);
      if (outT <= inT) errs.clockOut = "Clock-out must be after clock-in";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Submit ───────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSaving(true);
    try {
      await createAttendance({
        userId: form.userId,
        date: form.date,
        status: form.status,
        clockIn: toISODateTime(form.date, form.clockIn),
        clockOut: toISODateTime(form.date, form.clockOut),
        breakMinutes: form.breakMinutes,
        lateMinutes: form.lateMinutes,
        overtime: form.overtime,
        totalHours: computedHours ?? undefined,
        notes: form.notes || undefined,
      });
      toast.success("Attendance record created");
      onSaved();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to create record");
    } finally {
      setIsSaving(false);
    }
  };

  const needsTime =
    form.status === "PRESENT" ||
    form.status === "LATE" ||
    form.status === "HALF_DAY";

  // ── Render ───────────────────────────────────────────────
  return (
    <ModalShell
      title="Add Attendance Record"
      subtitle="Manually create an attendance entry for a staff member"
      onClose={onClose}
    >
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
        {/* ── Staff + Date ────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Staff select */}
          <div className="sm:col-span-2">
            <FieldLabel icon={UserCheck} label="Staff Member" required />
            {loadingStaff ? (
              <SkeletonInput />
            ) : (
              <div className="relative">
                <select
                  value={form.userId}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, userId: e.target.value }))
                  }
                  className={inputCls(!!errors.userId)}
                >
                  <option value="">Choose a staff member…</option>
                  {staff.map((s) => (
                    <option key={s.userId} value={s.userId}>
                      {s.name} — {s.email}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
            )}
            {errors.userId && <FieldError msg={errors.userId} />}
          </div>

          {/* Date */}
          <div>
            <FieldLabel icon={CalendarDays} label="Date" required />
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              className={inputCls(!!errors.date)}
            />
            {errors.date && <FieldError msg={errors.date} />}
          </div>

          {/* Status */}
          <div>
            <FieldLabel label="Status" required />
            <div className="grid grid-cols-2 gap-2 mt-1">
              {(Object.keys(STATUS_CONFIG) as AttendanceStatus[]).map((s) => {
                const cfg = STATUS_CONFIG[s];
                const active = form.status === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleStatusChange(s)}
                    className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border-2 transition-all ${
                      active
                        ? `${cfg.bg} ${cfg.color} border-current shadow-sm scale-[1.02]`
                        : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {active && (
                      <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
                    )}
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Time fields (only if working) ────────────── */}
        {needsTime && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-slate-400" />
              <h4 className="text-sm font-semibold text-slate-700">
                Time Details
              </h4>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Clock In */}
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

              {/* Clock Out */}
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

              {/* Break */}
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

              {/* Late minutes */}
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

              {/* Overtime */}
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

              {/* Computed total hours pill */}
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

        {/* ── Notes ───────────────────────────────────── */}
        <div>
          <FieldLabel icon={StickyNote} label="Notes" />
          <textarea
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            placeholder="Optional notes about this attendance entry…"
            rows={2}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent placeholder:text-slate-300"
          />
        </div>
      </div>

      {/* ── Footer ────────────────────────────────────── */}
      <ModalFooter
        onCancel={onClose}
        onSubmit={handleSubmit}
        isSaving={isSaving}
        submitLabel="Create Record"
      />
    </ModalShell>
  );
}

// ─────────────────────────────────────────────────────────
// Edit Modal
// ─────────────────────────────────────────────────────────
