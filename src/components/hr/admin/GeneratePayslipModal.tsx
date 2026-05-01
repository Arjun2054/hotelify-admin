// src/components/hr/admin/GeneratePayslipModal.tsx

import { useEffect, useState } from "react";
import { useHrStore } from "@/store/hr/useHrStore";
import { hrService } from "@/services/hr/hrService";
import type { PayslipItem } from "@/types/hr-types";
import { X, Plus, Trash2, RefreshCw, DollarSign } from "lucide-react";
import { toast } from "sonner";

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

interface Props {
  onClose: () => void;
  onGenerated: () => void;
}

export default function GeneratePayslipModal({ onClose, onGenerated }: Props) {
  const { generatePayslip } = useHrStore();

  const [staff, setStaff] = useState<
    { userId: string; name: string; email: string; basicSalary?: number }[]
  >([]);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const [form, setForm] = useState({
    userId: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    basicSalary: 0,
    notes: "",
  });

  const [items, setItems] = useState<PayslipItem[]>([]);

  useEffect(() => {
    // Load staff from org members
    const loadStaff = async () => {
      try {
        // We'll use the getAllBalances to get users, or you can expose a staff endpoint
        // For now, assume we have an org members endpoint
        const res = await hrService.getAllBalances(new Date().getFullYear());
        // Extract unique users
        const seen = new Set<string>();
        const users: any[] = [];
        for (const b of res ?? []) {
          if (!seen.has(b.user.userId)) {
            seen.add(b.user.userId);
            users.push(b.user);
          }
        }
        setStaff(users);
      } catch {
        setStaff([]);
      } finally {
        setLoadingStaff(false);
      }
    };
    loadStaff();
  }, []);

  const addItem = (type: "ALLOWANCE" | "DEDUCTION") => {
    setItems((prev) => [...prev, { label: "", type, amount: 0 }]);
  };

  const updateItem = (idx: number, field: keyof PayslipItem, value: any) => {
    setItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)),
    );
  };

  const removeItem = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const totalAllowances = items
    .filter((i) => i.type === "ALLOWANCE")
    .reduce((s, i) => s + Number(i.amount), 0);

  const totalDeductions = items
    .filter((i) => i.type === "DEDUCTION")
    .reduce((s, i) => s + Number(i.amount), 0);

  const grossPay = form.basicSalary + totalAllowances;
  const netPay = grossPay - totalDeductions;

  const handleGenerate = async () => {
    if (!form.userId) return toast.error("Select a staff member");
    if (!form.basicSalary || form.basicSalary <= 0)
      return toast.error("Enter basic salary");

    const hasEmptyItem = items.some((i) => !i.label.trim());
    if (hasEmptyItem) return toast.error("Fill in all item labels");

    setIsGenerating(true);
    try {
      await generatePayslip({
        ...form,
        items,
      });
      toast.success("Payslip generated successfully");
      onGenerated();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to generate");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Generate Payslip
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">
              Create a payslip for a team member
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Staff & Period */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Staff Member *
              </label>
              {loadingStaff ? (
                <div className="flex items-center gap-2 py-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-400" />
                  <span className="text-sm text-slate-400">Loading staff…</span>
                </div>
              ) : (
                <select
                  value={form.userId}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, userId: e.target.value }))
                  }
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                >
                  <option value="">Select staff member</option>
                  {staff.map((s) => (
                    <option key={s.userId} value={s.userId}>
                      {s.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Month *
              </label>
              <select
                value={form.month}
                onChange={(e) =>
                  setForm((f) => ({ ...f, month: Number(e.target.value) }))
                }
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
              >
                {MONTHS.map((m, i) => (
                  <option key={i} value={i + 1}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Year *
              </label>
              <input
                type="number"
                value={form.year}
                onChange={(e) =>
                  setForm((f) => ({ ...f, year: Number(e.target.value) }))
                }
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Basic Salary (USD) *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="number"
                  min={0}
                  value={form.basicSalary || ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      basicSalary: Number(e.target.value),
                    }))
                  }
                  placeholder="0"
                  className="w-full border border-slate-200 rounded-xl pl-8 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                />
              </div>
            </div>
          </div>

          {/* Allowances & Deductions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-slate-700">
                Earnings & Deductions
              </h4>
              <div className="flex gap-2">
                <button
                  onClick={() => addItem("ALLOWANCE")}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Allowance
                </button>
                <button
                  onClick={() => addItem("DEDUCTION")}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Deduction
                </button>
              </div>
            </div>

            {items.length === 0 ? (
              <div className="border-2 border-dashed border-slate-200 rounded-xl py-6 text-center">
                <p className="text-sm text-slate-400">
                  No items yet — add allowances or deductions
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 p-3 rounded-xl border ${
                      item.type === "ALLOWANCE"
                        ? "bg-emerald-50/40 border-emerald-100"
                        : "bg-rose-50/40 border-rose-100"
                    }`}
                  >
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                        item.type === "ALLOWANCE"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {item.type === "ALLOWANCE" ? "+" : "-"}
                    </span>
                    <input
                      value={item.label}
                      onChange={(e) => updateItem(idx, "label", e.target.value)}
                      placeholder="e.g. Transport Allowance"
                      className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                    />
                    <div className="relative w-28 shrink-0">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                        $
                      </span>
                      <input
                        type="number"
                        min={0}
                        value={item.amount || ""}
                        onChange={(e) =>
                          updateItem(idx, "amount", Number(e.target.value))
                        }
                        className="w-full bg-white border border-slate-200 rounded-lg pl-5 pr-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                      />
                    </div>
                    <button
                      onClick={() => removeItem(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Notes (optional)
            </label>
            <textarea
              value={form.notes}
              onChange={(e) =>
                setForm((f) => ({ ...f, notes: e.target.value }))
              }
              placeholder="Any additional notes for this payslip..."
              rows={2}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-300"
            />
          </div>
        </div>

        {/* Footer — pay summary + actions */}
        <div className="px-6 py-5 border-t border-slate-100 bg-slate-50/60 rounded-b-2xl shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="text-xs text-slate-400">Gross Pay</p>
                <p className="text-base font-bold text-slate-800">
                  ${grossPay.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Deductions</p>
                <p className="text-base font-bold text-rose-500">
                  -${totalDeductions.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Net Pay</p>
                <p className="text-base font-bold text-emerald-600">
                  ${netPay.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={isGenerating}
              onClick={handleGenerate}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors disabled:opacity-50"
            >
              {isGenerating ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <DollarSign className="w-4 h-4" />
              )}
              {isGenerating ? "Generating…" : "Generate Payslip"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
