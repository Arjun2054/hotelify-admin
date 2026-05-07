import { Button } from "@/components/ui/button";
import { UnitFormDialog } from "@/components/units/UnitFormDialog";
import { UnitTable } from "@/components/units/UnitTable";
import { useUnitStore } from "@/store/room/unitStore";
import type { CreateUnitPayload, Unit } from "@/types/hotelItem-types";
import { Plus, Ruler, Scale, FlaskConical, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";

// ── Table skeleton ────────────────────────────────────────────────────────────
function UnitTableSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header row */}
      <div className="flex items-center gap-6 px-6 py-3 border-b border-gray-100 bg-gray-50/60">
        {[100, 60, 80, 120, 60].map((w, i) => (
          <Skeleton key={i} className="h-3 rounded-full" style={{ width: w }} />
        ))}
      </div>
      {/* Body rows */}
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-6 px-6 py-4 border-b border-gray-50 last:border-0"
        >
          <Skeleton className="h-4 w-24 rounded-lg" />
          <Skeleton className="h-4 w-12 rounded-lg" />
          <Skeleton className="h-4 w-16 rounded-lg" />
          <Skeleton className="h-4 w-28 rounded-lg" />
          <Skeleton className="h-7 w-16 rounded-lg ml-auto" />
        </div>
      ))}
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function UnitsEmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-stone-100 border border-stone-200 mb-5">
        <Ruler className="w-7 h-7 text-stone-400" />
      </div>
      <h3
        className="font-semibold text-gray-800 mb-1"
        style={{ fontSize: "15px" }}
      >
        No units defined yet
      </h3>
      <p
        className="text-gray-400 max-w-xs leading-relaxed mb-5"
        style={{ fontSize: "12px" }}
      >
        Define measurement units — kg, litres, pieces — to standardise your
        hotel inventory items.
      </p>
      <Button
        onClick={onCreate}
        className="h-9 px-5 rounded-xl bg-stone-800 hover:bg-stone-700 text-white gap-2 shadow-sm"
        style={{ fontSize: "13px" }}
      >
        <Plus className="w-3.5 h-3.5" />
        Add First Unit
      </Button>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
const UnitPage = () => {
  const { units, isLoading, fetchUnits, createUnit, updateUnit, deleteUnit } =
    useUnitStore();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Unit | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Unit | null>(null);

  useEffect(() => {
    fetchUnits();
  }, []);

  const handleCreate = async (data: CreateUnitPayload) => {
    await createUnit(data);
    toast.success("Unit created");
  };

  const handleUpdate = async (data: CreateUnitPayload) => {
    if (!editing) return;
    await updateUnit(editing.id, data);
    toast.success("Unit updated");
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteUnit(deleteTarget.id);
      toast.success("Unit deleted");
    } catch (err) {
      toast.error((err as Error).message);
    }
    setDeleteTarget(null);
  };

  const totalUnits = units.length;

  return (
    <div className="min-h-screen bg-[#f9f7f4]">
      {/* ── Hero header ─────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-linear-to-br from-stone-800 via-stone-700 to-stone-900 px-8 py-10">
        {/* Decorative blobs */}
        <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-20 -left-8 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute top-6 right-52 w-20 h-20 rounded-full bg-white/3 pointer-events-none" />

        <div className="relative flex items-start justify-between gap-6 flex-wrap">
          {/* Left: icon + title */}
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm shrink-0">
              <Ruler className="w-6 h-6 text-white" />
            </div>

            <div>
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 mb-1">
                <p
                  className="uppercase tracking-widest font-semibold text-stone-400"
                  style={{ fontSize: "10px" }}
                >
                  Hotel Management
                </p>
                <span className="w-1 h-1 rounded-full bg-stone-500" />
                <p
                  className="uppercase tracking-widest font-semibold text-stone-400"
                  style={{ fontSize: "10px" }}
                >
                  Inventory
                </p>
                <span className="w-1 h-1 rounded-full bg-stone-500" />
                <p
                  className="uppercase tracking-widest font-semibold text-stone-400"
                  style={{ fontSize: "10px" }}
                >
                  Units of Measure
                </p>
              </div>

              <h1
                className="font-bold text-white leading-tight tracking-tight"
                style={{ fontSize: "22px" }}
              >
                Units of Measure
              </h1>
              <p
                className="text-stone-300 mt-1 leading-snug"
                style={{ fontSize: "13px" }}
              >
                Define measurement units for your hotel inventory items
              </p>
            </div>
          </div>

          {/* CTA */}
          <Button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
            className="h-9 px-5 rounded-xl gap-2 bg-white text-stone-800 hover:bg-stone-50 font-semibold shadow-md shrink-0"
            style={{ fontSize: "13px" }}
          >
            <Plus className="w-3.5 h-3.5" />
            Add Unit
          </Button>
        </div>

        {/* ── Stat strip ────────────────────────────────────────────────── */}
        <div className="relative mt-7 flex items-center gap-3 flex-wrap">
          {[
            { label: "Total Units", value: totalUnits, icon: Ruler },
            {
              label: "Weight",
              value: units.filter((u) =>
                ["kg", "g", "lb", "oz"].includes(
                  u.abbreviation?.toLowerCase() ?? "",
                ),
              ).length,
              icon: Scale,
            },
            {
              label: "Volume",
              value: units.filter((u) =>
                ["l", "ml", "litre"].includes(
                  u.abbreviation?.toLowerCase() ?? "",
                ),
              ).length,
              icon: FlaskConical,
            },
            {
              label: "Other",
              value: units.filter(
                (u) =>
                  !["kg", "g", "lb", "oz", "l", "ml", "litre"].includes(
                    u.abbreviation?.toLowerCase() ?? "",
                  ),
              ).length,
              icon: Sparkles,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white/10 border border-white/15 backdrop-blur-sm"
            >
              <stat.icon className="w-3.5 h-3.5 text-stone-300 shrink-0" />
              <span
                className="font-bold text-white leading-none"
                style={{ fontSize: "15px" }}
              >
                {isLoading ? "—" : stat.value}
              </span>
              <span
                className="text-stone-300 leading-none"
                style={{ fontSize: "11px" }}
              >
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────────────────── */}
      <div className="px-8 py-6 space-y-5">
        {/* Section label */}
        {!isLoading && units.length > 0 && (
          <div className="flex items-center gap-2">
            <p
              className="uppercase tracking-widest font-semibold text-gray-400"
              style={{ fontSize: "10px" }}
            >
              All Units
            </p>
            <div className="flex-1 h-px bg-gray-200" />
            <span
              className="px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-400 font-medium shadow-sm"
              style={{ fontSize: "10px" }}
            >
              {totalUnits} {totalUnits === 1 ? "unit" : "units"}
            </span>
          </div>
        )}

        {/* Table */}
        {isLoading && units.length === 0 ? (
          <UnitTableSkeleton />
        ) : units.length === 0 ? (
          <UnitsEmptyState
            onCreate={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          />
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <UnitTable
              units={units}
              onEdit={(u) => {
                setEditing(u);
                setFormOpen(true);
              }}
              onDelete={setDeleteTarget}
            />
          </div>
        )}

        {/* Informational footer note */}
        {units.length > 0 && (
          <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-white border border-gray-100 shadow-sm">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-stone-100 shrink-0 mt-0.5">
              <Ruler className="w-3.5 h-3.5 text-stone-500" />
            </div>
            <div>
              <p
                className="font-semibold text-gray-700"
                style={{ fontSize: "12px" }}
              >
                Using Units
              </p>
              <p className="text-gray-400 mt-0.5" style={{ fontSize: "11px" }}>
                Navigate to{" "}
                <span className="font-medium text-gray-500">
                  Inventory → Items → Add Item
                </span>{" "}
                and select a unit of measure to standardise quantities across
                your hotel inventory.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Dialogs ─────────────────────────────────────────────────────────── */}

      {/* Create / Edit */}
      <UnitFormDialog
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={editing ? handleUpdate : handleCreate}
        editingUnit={editing}
        isLoading={isLoading}
      />

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <AlertDialogContent className="rounded-2xl border-gray-100 shadow-xl p-0 overflow-hidden gap-0">
          {/* Red gradient header */}
          <div className="bg-linear-to-br from-red-600 to-red-700 px-6 py-5">
            <AlertDialogHeader>
              <AlertDialogTitle
                className="text-white font-semibold"
                style={{ fontSize: "15px" }}
              >
                Delete "{deleteTarget?.name}"?
              </AlertDialogTitle>
              <AlertDialogDescription
                className="text-red-200"
                style={{ fontSize: "12px" }}
              >
                This will remove the unit. Units assigned to inventory items
                cannot be deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
          </div>

          {/* Footer */}
          <AlertDialogFooter className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-2">
            <AlertDialogCancel
              className="flex-1 h-9 rounded-xl border-gray-200 text-gray-600"
              style={{ fontSize: "13px" }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="flex-1 h-9 rounded-xl bg-red-600 hover:bg-red-700 text-white"
              style={{ fontSize: "13px" }}
            >
              Delete Unit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UnitPage;
