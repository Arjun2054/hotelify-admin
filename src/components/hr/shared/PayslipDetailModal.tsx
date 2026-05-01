// src/components/hr/shared/PayslipDetailModal.tsx

import type { Payslip } from "@/types/hr-types";
import { PayslipStatusBadge } from "./StatusBadge";
import { X, Printer } from "lucide-react";

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
  payslip: Payslip;
  onClose: () => void;
}

export default function PayslipDetailModal({ payslip, onClose }: Props) {
  const allowances = payslip.items.filter((i) => i.type === "ALLOWANCE");
  const deductions = payslip.items.filter((i) => i.type === "DEDUCTION");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Payslip</h2>
            <p className="text-sm text-slate-400">
              {MONTHS[payslip.month - 1]} {payslip.year} · {payslip.user.name}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <PayslipStatusBadge status={payslip.status} />
            <button
              onClick={() => window.print()}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <Printer className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Employee info */}
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center shrink-0">
              <span className="text-lg font-bold text-emerald-700">
                {payslip.user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-base font-bold text-slate-900">
                {payslip.user.name}
              </p>
              <p className="text-sm text-slate-400">{payslip.user.email}</p>
            </div>
          </div>

          {/* Attendance summary */}
          <div>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Attendance Summary
            </h4>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Working Days", value: payslip.workingDays },
                { label: "Present", value: payslip.presentDays },
                { label: "Absent", value: payslip.absentDays },
                {
                  label: "Leave Days",
                  value: Number(payslip.leaveDays).toFixed(1),
                },
                {
                  label: "Overtime Hrs",
                  value: Number(payslip.overtimeHours).toFixed(1),
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="bg-slate-50 rounded-xl p-3 text-center"
                >
                  <p className="text-xs text-slate-400">{item.label}</p>
                  <p className="text-lg font-bold text-slate-800 mt-0.5">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Earnings */}
          <div>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Earnings
            </h4>
            <div className="bg-slate-50 rounded-xl overflow-hidden">
              <div className="flex justify-between px-4 py-3 border-b border-slate-100">
                <span className="text-sm text-slate-700">Basic Salary</span>
                <span className="text-sm font-semibold text-slate-800">
                  ${Number(payslip.basicSalary).toLocaleString()}
                </span>
              </div>
              {allowances.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between px-4 py-3 border-b border-slate-100 last:border-0"
                >
                  <span className="text-sm text-slate-600">{item.label}</span>
                  <span className="text-sm font-medium text-emerald-600">
                    +${Number(item.amount).toLocaleString()}
                  </span>
                </div>
              ))}
              <div className="flex justify-between px-4 py-3 bg-emerald-50">
                <span className="text-sm font-semibold text-slate-800">
                  Gross Pay
                </span>
                <span className="text-sm font-bold text-slate-900">
                  ${Number(payslip.grossPay).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Deductions */}
          {deductions.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Deductions
              </h4>
              <div className="bg-slate-50 rounded-xl overflow-hidden">
                {deductions.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between px-4 py-3 border-b border-slate-100 last:border-0"
                  >
                    <span className="text-sm text-slate-600">{item.label}</span>
                    <span className="text-sm font-medium text-rose-500">
                      -${Number(item.amount).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer — net pay */}
        <div className="px-6 py-5 border-t border-slate-100 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-b-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Net Pay</p>
              {payslip.paidAt && (
                <p className="text-xs text-slate-400 mt-0.5">
                  Paid on{" "}
                  {new Date(payslip.paidAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              )}
            </div>
            <p className="text-3xl font-black text-emerald-700">
              ${Number(payslip.netPay).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
