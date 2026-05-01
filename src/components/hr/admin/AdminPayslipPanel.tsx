// src/components/hr/admin/AdminPayslipPanel.tsx

import { useEffect, useState } from "react";
import { useHrStore } from "@/store/hr/useHrStore";
import SectionCard from "@/components/hr/shared/SectionCard";
import EmptyState from "@/components/hr/shared/EmptyState";
import { PayslipStatusBadge } from "@/components/hr/shared/StatusBadge";
import type { Payslip } from "@/types/hr-types";
import {
  FileText,
  Plus,
  Eye,
  Trash2,
  CheckCircle2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Filter,
  DollarSign,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import GeneratePayslipModal from "./GeneratePayslipModal";
import PayslipDetailModal from "../shared/PayslipDetailModal";

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

export default function AdminPayslipPanel() {
  const {
    allPayslips,
    payslipMeta,
    isLoading,
    fetchAllPayslips,
    markPayslipAsPaid,
    deletePayslip,
  } = useHrStore();

  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Record<string, any>>({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });
  const [showGenerate, setShowGenerate] = useState(false);
  const [viewPayslip, setViewPayslip] = useState<Payslip | null>(null);
  const [markingPaidId, setMarkingPaidId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchAllPayslips(filters, page);
  }, [page, filters]);

  const handleMarkPaid = async (id: string) => {
    setMarkingPaidId(id);
    try {
      await markPayslipAsPaid(id);
      toast.success("Payslip marked as paid");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed");
    } finally {
      setMarkingPaidId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this payslip?")) return;
    setDeletingId(id);
    try {
      await deletePayslip(id);
      toast.success("Payslip deleted");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Cannot delete");
    } finally {
      setDeletingId(null);
    }
  };

  const totalNetPay = allPayslips.reduce((s, p) => s + p.netPay, 0);
  const totalPaid = allPayslips.filter((p) => p.status === "PAID").length;

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Payroll
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            ${totalNetPay.toLocaleString()}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            {MONTHS[(filters.month ?? 1) - 1]} {filters.year}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Payslips Issued
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {allPayslips.length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Paid
          </p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">
            {totalPaid}/{allPayslips.length}
          </p>
        </div>
      </div>

      {/* Filters + Generate */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filters.month ?? ""}
            onChange={(e) =>
              setFilters((f) => ({ ...f, month: Number(e.target.value) }))
            }
            className="text-sm text-slate-700 bg-transparent outline-none"
          >
            {MONTHS.map((m, i) => (
              <option key={i} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2">
          <select
            value={filters.year ?? ""}
            onChange={(e) =>
              setFilters((f) => ({ ...f, year: Number(e.target.value) }))
            }
            className="text-sm text-slate-700 bg-transparent outline-none"
          >
            {[2024, 2025, 2026].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2">
          <select
            value={filters.status ?? ""}
            onChange={(e) =>
              setFilters((f) => ({ ...f, status: e.target.value }))
            }
            className="text-sm text-slate-700 bg-transparent outline-none"
          >
            <option value="">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="GENERATED">Generated</option>
            <option value="PAID">Paid</option>
          </select>
        </div>

        <button
          onClick={() => setShowGenerate(true)}
          className="ml-auto flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Generate Payslip
        </button>
      </div>

      <SectionCard
        title="Payslips"
        subtitle={`${payslipMeta?.total ?? 0} records`}
        noPadding
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <RefreshCw className="w-5 h-5 text-slate-400 animate-spin" />
          </div>
        ) : allPayslips.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No payslips found"
            description="Generate payslips for your team members"
            action={
              <button
                onClick={() => setShowGenerate(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Generate Payslip
              </button>
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    {[
                      "Staff",
                      "Period",
                      "Basic",
                      "Allowances",
                      "Deductions",
                      "Net Pay",
                      "Status",
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
                  {allPayslips.map((p) => (
                    <PayslipRow
                      key={p.id}
                      payslip={p}
                      isMarkingPaid={markingPaidId === p.id}
                      isDeleting={deletingId === p.id}
                      onView={() => setViewPayslip(p)}
                      onMarkPaid={() => handleMarkPaid(p.id)}
                      onDelete={() => handleDelete(p.id)}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {payslipMeta && payslipMeta.totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
                <p className="text-sm text-slate-400">
                  Page {payslipMeta.page} of {payslipMeta.totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={page === payslipMeta.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </SectionCard>

      {showGenerate && (
        <GeneratePayslipModal
          onClose={() => setShowGenerate(false)}
          onGenerated={() => {
            setShowGenerate(false);
            fetchAllPayslips(filters, page);
          }}
        />
      )}

      {viewPayslip && (
        <PayslipDetailModal
          payslip={viewPayslip}
          onClose={() => setViewPayslip(null)}
        />
      )}
    </div>
  );
}

// ─── Payslip Row ──────────────────────────────────────

interface PayslipRowProps {
  payslip: Payslip;
  isMarkingPaid: boolean;
  isDeleting: boolean;
  onView: () => void;
  onMarkPaid: () => void;
  onDelete: () => void;
}

function PayslipRow({
  payslip,
  isMarkingPaid,
  isDeleting,
  onView,
  onMarkPaid,
  onDelete,
}: PayslipRowProps) {
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

  return (
    <tr className="hover:bg-slate-50/50 transition-colors">
      <td className="px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-100 to-violet-200 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-violet-700">
              {payslip.user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-800 truncate">
              {payslip.user.name}
            </p>
            <p className="text-xs text-slate-400 truncate">
              {payslip.user.email}
            </p>
          </div>
        </div>
      </td>
      <td className="px-5 py-4 text-sm text-slate-600">
        {MONTHS[payslip.month - 1]} {payslip.year}
      </td>
      <td className="px-5 py-4 text-sm text-slate-600">
        ${payslip.basicSalary.toLocaleString()}
      </td>
      <td className="px-5 py-4 text-sm text-emerald-600">
        +${payslip.totalAllowances.toLocaleString()}
      </td>
      <td className="px-5 py-4 text-sm text-rose-500">
        -${payslip.totalDeductions.toLocaleString()}
      </td>
      <td className="px-5 py-4">
        <p className="text-sm font-bold text-slate-900">
          ${payslip.netPay.toLocaleString()}
        </p>
      </td>
      <td className="px-5 py-4">
        <PayslipStatusBadge status={payslip.status} />
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-1.5">
          <button
            onClick={onView}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            title="View"
          >
            <Eye className="w-4 h-4" />
          </button>
          {payslip.status !== "PAID" && (
            <button
              disabled={isMarkingPaid}
              onClick={onMarkPaid}
              className="p-1.5 text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50"
              title="Mark as paid"
            >
              {isMarkingPaid ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
            </button>
          )}
          {payslip.status === "DRAFT" && (
            <button
              disabled={isDeleting}
              onClick={onDelete}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
              title="Delete"
            >
              {isDeleting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
