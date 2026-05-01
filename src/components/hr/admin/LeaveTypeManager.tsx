// src/components/hr/admin/LeaveTypeManager.tsx

import { useEffect, useState } from "react";
import { useHrStore } from "@/store/hr/useHrStore";
import SectionCard from "@/components/hr/shared/SectionCard";
import EmptyState from "@/components/hr/shared/EmptyState";
import type { LeaveType } from "@/types/hr-types";
import { Plus, Pencil, Trash2, Tags, RefreshCw, Check, X } from "lucide-react";
import { toast } from "sonner";

const COLOR_OPTIONS = [
  "#10b981", // emerald
  "#3b82f6", // blue
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
  "#06b6d4", // cyan
  "#ec4899", // pink
  "#84cc16", // lime
];

interface FormData {
  name: string;
  description: string;
  daysPerYear: number;
  isPaid: boolean;
  color: string;
}

const EMPTY_FORM: FormData = {
  name: "",
  description: "",
  daysPerYear: 12,
  isPaid: true,
  color: "#10b981",
};

export default function LeaveTypeManager() {
  const {
    leaveTypes,
    isLoading,
    fetchLeaveTypes,
    createLeaveType,
    updateLeaveType,
    deleteLeaveType,
  } = useHrStore();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaveTypes();
  }, []);

  const startEdit = (type: LeaveType) => {
    setEditingId(type.id);
    setForm({
      name: type.name,
      description: type.description ?? "",
      daysPerYear: type.daysPerYear,
      isPaid: type.isPaid,
      color: type.color ?? "#10b981",
    });
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    try {
      if (editingId) {
        await updateLeaveType(editingId, form);
        toast.success("Leave type updated");
      } else {
        await createLeaveType(form);
        toast.success("Leave type created");
      }
      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to save");
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteLeaveType(id);
      toast.success("Leave type deleted");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Cannot delete");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <SectionCard
        title="Leave Types"
        subtitle="Configure available leave categories"
        actions={
          <button
            onClick={() => {
              setShowForm(true);
              setEditingId(null);
              setForm(EMPTY_FORM);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Type
          </button>
        }
        noPadding
      >
        {/* Inline Form */}
        {showForm && (
          <div className="px-5 py-4 bg-emerald-50/40 border-b border-emerald-100">
            <h4 className="text-sm font-semibold text-slate-800 mb-4">
              {editingId ? "Edit Leave Type" : "New Leave Type"}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Name *
                </label>
                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="e.g. Annual Leave"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Days Per Year
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.daysPerYear}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      daysPerYear: Number(e.target.value),
                    }))
                  }
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Description
                </label>
                <input
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Optional description"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-2">
                  Color
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setForm((f) => ({ ...f, color: c }))}
                      className="w-7 h-7 rounded-full border-2 transition-all"
                      style={{
                        backgroundColor: c,
                        borderColor:
                          form.color === c ? "#1e293b" : "transparent",
                        transform:
                          form.color === c ? "scale(1.15)" : "scale(1)",
                      }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setForm((f) => ({ ...f, isPaid: !f.isPaid }))}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    form.isPaid ? "bg-emerald-500" : "bg-slate-200"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      form.isPaid ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
                <label className="text-sm text-slate-700 font-medium">
                  Paid Leave
                </label>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                {editingId ? "Save Changes" : "Create"}
              </button>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setForm(EMPTY_FORM);
                }}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* List */}
        {leaveTypes.length === 0 ? (
          <EmptyState
            icon={Tags}
            title="No leave types yet"
            description="Add leave types like Annual Leave, Sick Leave, etc."
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {leaveTypes.map((type) => (
              <div
                key={type.id}
                className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/50 transition-colors"
              >
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: type.color ?? "#cbd5e1" }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-800">
                      {type.name}
                    </p>
                    {!type.isActive && (
                      <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">
                        Inactive
                      </span>
                    )}
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        type.isPaid
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {type.isPaid ? "Paid" : "Unpaid"}
                    </span>
                  </div>
                  {type.description && (
                    <p className="text-xs text-slate-400 mt-0.5 truncate">
                      {type.description}
                    </p>
                  )}
                </div>
                <div className="text-sm font-semibold text-slate-700 shrink-0">
                  {type.daysPerYear}d/yr
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => startEdit(type)}
                    className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(type.id)}
                    disabled={deletingId === type.id}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {deletingId === type.id ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
