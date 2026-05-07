// src/components/hr/admin/AllBalancesTable.tsx

import { useEffect, useState } from "react";
import { hrService } from "@/services/hr/hrService";
import SectionCard from "@/components/hr/shared/SectionCard";
import EmptyState from "@/components/hr/shared/EmptyState";
import type { BalanceRecord, UserBalanceGroup } from "@/types/hr-types";
import { Users, RefreshCw, Pencil, Check, X } from "lucide-react";
import { toast } from "sonner";

export default function AllBalancesTable() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [rawBalances, setRawBalances] = useState<BalanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingBalanceId, setEditingBalanceId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);
  const [savingId, setSavingId] = useState<string | null>(null);

  const loadBalances = async () => {
    setIsLoading(true);
    try {
      const data = await hrService.getAllBalances(year);
      setRawBalances(
        (data ?? []).map((b: any) => ({
          ...b,
          totalDays: Number(b.totalDays),
          usedDays: Number(b.usedDays),
        })),
      );
    } catch {
      toast.error("Failed to load balances");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBalances();
  }, [year]);

  // Group by user
  const grouped: UserBalanceGroup[] = Object.values(
    rawBalances.reduce<Record<string, UserBalanceGroup>>((acc, b) => {
      const uid = b.user.userId;
      if (!acc[uid]) acc[uid] = { user: b.user, balances: [] };
      acc[uid].balances.push(b);
      return acc;
    }, {}),
  );

  const handleAdjust = async (balanceId: string) => {
    setSavingId(balanceId);
    try {
      await hrService.adjustBalance(balanceId, editValue);
      toast.success("Balance updated");
      setEditingBalanceId(null);
      await loadBalances();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to adjust");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <SectionCard
      title="Staff Leave Balances"
      subtitle={`${year} — all active staff`}
      actions={
        <div className="flex items-center gap-2">
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 outline-none"
          >
            {[2024, 2025, 2026].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <button
            onClick={loadBalances}
            className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      }
      noPadding
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <RefreshCw className="w-5 h-5 text-slate-400 animate-spin" />
        </div>
      ) : grouped.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No balances found"
          description="Balances are auto-created when staff submit leave requests"
        />
      ) : (
        <div className="divide-y divide-slate-100">
          {grouped.map(({ user, balances }) => (
            <div key={user.userId} className="px-5 py-4">
              {/* User header */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-linear-to-br from-stone-200 to-stone-300 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-slate-600">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {user.name}
                  </p>
                  <p className="text-xs text-slate-400">{user.email}</p>
                </div>
              </div>

              {/* Balances grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pl-11">
                {balances.map((b) => {
                  const remaining = b.totalDays - b.usedDays;
                  const pct =
                    b.totalDays > 0
                      ? Math.min(
                          100,
                          Math.round((b.usedDays / b.totalDays) * 100),
                        )
                      : 0;
                  const isEditing = editingBalanceId === b.id;

                  return (
                    <div
                      key={b.id}
                      className="bg-slate-50 border border-slate-200 rounded-xl p-3"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          {b.leaveType.color && (
                            <div
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{
                                backgroundColor: b.leaveType.color,
                              }}
                            />
                          )}
                          <p className="text-xs font-semibold text-slate-700">
                            {b.leaveType.name}
                          </p>
                        </div>
                        {!isEditing && (
                          <button
                            onClick={() => {
                              setEditingBalanceId(b.id);
                              setEditValue(b.totalDays);
                            }}
                            className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      {isEditing ? (
                        <div className="flex items-center gap-2 mt-2">
                          <input
                            type="number"
                            min={0}
                            value={editValue}
                            onChange={(e) =>
                              setEditValue(Number(e.target.value))
                            }
                            className="w-20 border border-slate-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                          />
                          <button
                            disabled={savingId === b.id}
                            onClick={() => handleAdjust(b.id)}
                            className="p-1.5 text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors disabled:opacity-50"
                          >
                            {savingId === b.id ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : (
                              <Check className="w-3 h-3" />
                            )}
                          </button>
                          <button
                            onClick={() => setEditingBalanceId(null)}
                            className="p-1.5 text-slate-500 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-baseline gap-1 mb-1.5">
                            <span className="text-lg font-bold text-slate-800">
                              {remaining}
                            </span>
                            <span className="text-xs text-slate-400">
                              / {b.totalDays} days left
                            </span>
                          </div>
                          <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                pct > 80
                                  ? "bg-rose-400"
                                  : pct > 50
                                    ? "bg-amber-400"
                                    : "bg-emerald-400"
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <p className="text-xs text-slate-400 mt-1">
                            {b.usedDays} used
                          </p>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}
