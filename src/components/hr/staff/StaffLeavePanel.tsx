// src/components/hr/staff/StaffLeavePanel.tsx

import { useEffect, useState } from "react";
import { useHrStore } from "@/store/hr/useHrStore";
import SectionCard from "@/components/hr/shared/SectionCard";
import EmptyState from "@/components/hr/shared/EmptyState";
import { LeaveStatusBadge } from "@/components/hr/shared/StatusBadge";
import type { CreateLeaveRequestPayload } from "@/types/hr-types";
import {
  CalendarRange,
  Plus,
  X,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function StaffLeavePanel() {
  const {
    myBalances,
    leaveTypes,
    leaveRequests,
    leaveMeta,
    isLoading,
    fetchMyBalances,
    fetchLeaveTypes,
    fetchLeaveRequests,
    createLeaveRequest,
    cancelLeaveRequest,
  } = useHrStore();

  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateLeaveRequestPayload>({
    leaveTypeId: "",
    startDate: "",
    endDate: "",
    reason: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchMyBalances();
    fetchLeaveTypes();
    fetchLeaveRequests({}, page);
  }, [page]);

  const handleSubmit = async () => {
    if (!form.leaveTypeId || !form.startDate || !form.endDate || !form.reason) {
      toast.error("Please fill in all required fields");
      return;
    }
    setIsSubmitting(true);
    try {
      await createLeaveRequest(form);
      toast.success("Leave request submitted!");
      setShowForm(false);
      setForm({ leaveTypeId: "", startDate: "", endDate: "", reason: "" });
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to submit");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Cancel this leave request?")) return;
    setCancellingId(id);
    try {
      await cancelLeaveRequest(id);
      toast.success("Request cancelled");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Cannot cancel");
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Balances */}
      <SectionCard
        title="My Leave Balances"
        subtitle={`${new Date().getFullYear()}`}
      >
        {myBalances.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">
            No balances found
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {myBalances.map((b) => {
              const remaining = b.totalDays - b.usedDays;
              const pct =
                b.totalDays > 0
                  ? Math.min(100, Math.round((b.usedDays / b.totalDays) * 100))
                  : 0;
              return (
                <div
                  key={b.id}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-4"
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    {b.leaveType.color && (
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: b.leaveType.color }}
                      />
                    )}
                    <p className="text-xs font-semibold text-slate-600 truncate">
                      {b.leaveType.name}
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">
                    {remaining}
                  </p>
                  <p className="text-xs text-slate-400 mb-2">
                    of {b.totalDays} days
                  </p>
                  <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        pct > 80
                          ? "bg-rose-400"
                          : pct > 50
                            ? "bg-amber-400"
                            : "bg-emerald-400"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      {/* Requests */}
      <SectionCard
        title="My Leave Requests"
        subtitle={`${leaveMeta?.total ?? 0} total`}
        actions={
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Request Leave
          </button>
        }
        noPadding
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <RefreshCw className="w-5 h-5 text-slate-400 animate-spin" />
          </div>
        ) : leaveRequests.length === 0 ? (
          <EmptyState
            icon={CalendarRange}
            title="No leave requests yet"
            description="Submit your first leave request using the button above"
            action={
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Request Leave
              </button>
            }
          />
        ) : (
          <>
            <div className="divide-y divide-slate-100">
              {leaveRequests.map((req) => (
                <div
                  key={req.id}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/50 transition-colors"
                >
                  {req.leaveType.color && (
                    <div
                      className="w-1 h-12 rounded-full shrink-0"
                      style={{ backgroundColor: req.leaveType.color }}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-semibold text-slate-800">
                        {req.leaveType.name}
                      </p>
                      <span className="text-xs text-slate-400">
                        · {req.totalDays} day
                        {req.totalDays !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      {format(new Date(req.startDate), "MMM d")} –{" "}
                      {format(new Date(req.endDate), "MMM d, yyyy")}
                    </p>
                    {req.rejectedReason && (
                      <p className="text-xs text-rose-500 mt-0.5">
                        Reason: {req.rejectedReason}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <LeaveStatusBadge status={req.status} />
                    {(req.status === "PENDING" ||
                      req.status === "APPROVED") && (
                      <button
                        disabled={cancellingId === req.id}
                        onClick={() => handleCancel(req.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Cancel request"
                      >
                        {cancellingId === req.id ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {leaveMeta && leaveMeta.totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
                <p className="text-sm text-slate-400">
                  Page {leaveMeta.page} of {leaveMeta.totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={page === leaveMeta.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </SectionCard>

      {/* Request Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                New Leave Request
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Leave Type *
                </label>
                <select
                  value={form.leaveTypeId}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, leaveTypeId: e.target.value }))
                  }
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                >
                  <option value="">Select leave type</option>
                  {leaveTypes
                    .filter((t) => t.isActive)
                    .map((t) => {
                      const balance = myBalances.find(
                        (b) => b.leaveTypeId === t.id,
                      );
                      const remaining = balance
                        ? balance.totalDays - balance.usedDays
                        : null;
                      return (
                        <option key={t.id} value={t.id}>
                          {t.name}
                          {remaining !== null ? ` (${remaining}d left)` : ""}
                        </option>
                      );
                    })}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={form.startDate}
                    min={format(new Date(), "yyyy-MM-dd")}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, startDate: e.target.value }))
                    }
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={form.endDate}
                    min={form.startDate || format(new Date(), "yyyy-MM-dd")}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, endDate: e.target.value }))
                    }
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Reason *
                </label>
                <textarea
                  value={form.reason}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, reason: e.target.value }))
                  }
                  placeholder="Please explain the reason for your leave..."
                  rows={3}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-300"
                />
              </div>
            </div>

            <div className="flex gap-3 px-6 py-5 border-t border-slate-100">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={isSubmitting}
                onClick={handleSubmit}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : null}
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
