// src/components/hr/admin/AdminLeavePanel.tsx

import { useEffect, useState } from "react";
import { useHrStore } from "@/store/hr/useHrStore";
import { hrService } from "@/services/hr/hrService";
import SectionCard from "@/components/hr/shared/SectionCard";
import EmptyState from "@/components/hr/shared/EmptyState";
import { LeaveStatusBadge } from "@/components/hr/shared/StatusBadge";
import type { LeaveRequest, ProcessLeavePayload } from "@/types/hr-types";
import {
  CalendarRange,
  CheckCircle2,
  XCircle,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import AllBalancesTable from "./AllBalancesTable";
import LeaveTypeManager from "./LeaveTypeManager";

type ActiveTab = "requests" | "balances" | "types";

export default function AdminLeavePanel() {
  const {
    leaveRequests,
    leaveMeta,
    leaveTypes,
    isLoading,
    fetchLeaveRequests,
    fetchLeaveTypes,
    processLeaveRequest,
  } = useHrStore();

  const [activeTab, setActiveTab] = useState<ActiveTab>("requests");
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<{
    open: boolean;
    requestId: string;
  } | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    fetchLeaveRequests(filters, page);
    fetchLeaveTypes();
  }, [page, filters]);

  const handleProcess = async (
    requestId: string,
    data: ProcessLeavePayload,
  ) => {
    setProcessingId(requestId);
    try {
      await processLeaveRequest(requestId, data);
      toast.success(
        data.status === "APPROVED"
          ? "Leave request approved"
          : "Leave request rejected",
      );
      setRejectModal(null);
      setRejectReason("");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to process request");
    } finally {
      setProcessingId(null);
    }
  };

  const TABS: { id: ActiveTab; label: string }[] = [
    { id: "requests", label: "Requests" },
    { id: "balances", label: "Balances" },
    { id: "types", label: "Leave Types" },
  ];

  return (
    <div className="space-y-6">
      {/* Sub-tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab.id
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Requests Tab */}
      {activeTab === "requests" && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={filters.status ?? ""}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    status: e.target.value,
                  }))
                }
                className="text-sm text-slate-700 bg-transparent outline-none"
              >
                <option value="">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2">
              <SlidersHorizontal className="w-4 h-4 text-slate-400" />
              <select
                value={filters.leaveTypeId ?? ""}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    leaveTypeId: e.target.value,
                  }))
                }
                className="text-sm text-slate-700 bg-transparent outline-none"
              >
                <option value="">All Types</option>
                {leaveTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2">
              <select
                value={filters.year ?? ""}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, year: e.target.value }))
                }
                className="text-sm text-slate-700 bg-transparent outline-none"
              >
                <option value="">All Years</option>
                {[2024, 2025, 2026].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                setFilters({});
                setPage(1);
              }}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-500 hover:text-slate-700 bg-white border border-slate-200 rounded-lg transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>

          <SectionCard
            title="Leave Requests"
            subtitle={`${leaveMeta?.total ?? 0} total records`}
            noPadding
          >
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <RefreshCw className="w-5 h-5 text-slate-400 animate-spin" />
              </div>
            ) : leaveRequests.length === 0 ? (
              <EmptyState
                icon={CalendarRange}
                title="No leave requests found"
                description="Requests will appear here once staff submit them"
              />
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-100">
                        {[
                          "Staff",
                          "Leave Type",
                          "Duration",
                          "Days",
                          "Status",
                          "Submitted",
                          "Actions",
                        ].map((h) => (
                          <th
                            key={h}
                            className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {leaveRequests.map((req) => (
                        <LeaveRequestRow
                          key={req.id}
                          request={req}
                          isProcessing={processingId === req.id}
                          onApprove={() =>
                            handleProcess(req.id, { status: "APPROVED" })
                          }
                          onReject={() =>
                            setRejectModal({
                              open: true,
                              requestId: req.id,
                            })
                          }
                        />
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {leaveMeta && leaveMeta.totalPages > 1 && (
                  <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
                    <p className="text-sm text-slate-400">
                      Page {leaveMeta.page} of {leaveMeta.totalPages}
                    </p>
                    <div className="flex gap-2">
                      <button
                        disabled={page === 1}
                        onClick={() => setPage((p) => p - 1)}
                        className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        disabled={page === leaveMeta.totalPages}
                        onClick={() => setPage((p) => p + 1)}
                        className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </SectionCard>
        </div>
      )}

      {/* Balances Tab */}
      {activeTab === "balances" && <AllBalancesTable />}

      {/* Types Tab */}
      {activeTab === "types" && <LeaveTypeManager />}

      {/* Reject Modal */}
      {rejectModal?.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 mx-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-1">
              Reject Leave Request
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              Please provide a reason for rejection (optional but recommended).
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Insufficient staffing during this period..."
              rows={3}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 resize-none focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  setRejectModal(null);
                  setRejectReason("");
                }}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={!!processingId}
                onClick={() =>
                  handleProcess(rejectModal.requestId, {
                    status: "REJECTED",
                    rejectedReason: rejectReason || undefined,
                  })
                }
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-rose-500 hover:bg-rose-600 rounded-xl transition-colors disabled:opacity-50"
              >
                {processingId ? "Rejecting…" : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Leave Request Row ─────────────────────────────────

interface LeaveRequestRowProps {
  request: LeaveRequest;
  isProcessing: boolean;
  onApprove: () => void;
  onReject: () => void;
}

function LeaveRequestRow({
  request,
  isProcessing,
  onApprove,
  onReject,
}: LeaveRequestRowProps) {
  const isPending = request.status === "PENDING";

  return (
    <tr className="hover:bg-slate-50/50 transition-colors">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-emerald-700">
              {request.user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-800 truncate">
              {request.user.name}
            </p>
            <p className="text-xs text-slate-400 truncate">
              {request.user.email}
            </p>
          </div>
        </div>
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-2">
          {request.leaveType.color && (
            <div
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: request.leaveType.color }}
            />
          )}
          <span className="text-sm text-slate-700">
            {request.leaveType.name}
          </span>
        </div>
      </td>
      <td className="px-5 py-4">
        <p className="text-sm text-slate-700">
          {format(new Date(request.startDate), "MMM d")} –{" "}
          {format(new Date(request.endDate), "MMM d, yyyy")}
        </p>
      </td>
      <td className="px-5 py-4">
        <span className="text-sm font-semibold text-slate-800">
          {request.totalDays}d
        </span>
      </td>
      <td className="px-5 py-4">
        <LeaveStatusBadge status={request.status} />
      </td>
      <td className="px-5 py-4">
        <p className="text-sm text-slate-500">
          {format(new Date(request.createdAt), "MMM d, yyyy")}
        </p>
      </td>
      <td className="px-5 py-4">
        {isPending && (
          <div className="flex items-center gap-2">
            <button
              disabled={isProcessing}
              onClick={onApprove}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Approve
            </button>
            <button
              disabled={isProcessing}
              onClick={onReject}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <XCircle className="w-3.5 h-3.5" />
              Reject
            </button>
          </div>
        )}
        {!isPending && (
          <span className="text-xs text-slate-400">
            {request.approvedBy ? `by ${request.approvedBy.name}` : "—"}
          </span>
        )}
      </td>
    </tr>
  );
}
