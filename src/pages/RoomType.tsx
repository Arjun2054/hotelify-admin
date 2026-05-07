import { RoomTypeTable } from "@/components/room_types/RoomTypeTable";
import { Button } from "@/components/ui/button";
import { useRoomTypeStore } from "@/store/room/roomTypeStore";
import { Plus, LayoutGrid, BedDouble, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
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
import type { RoomType, CreateRoomTypePayload } from "@/types/room-types";
import { toast } from "sonner";
import { RoomTypeFormDialog } from "@/components/room_types/RoomTypeFormDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";

// ── Loading skeleton ──────────────────────────────────────────────────────────
function RoomTypeTableSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Table header */}
      <div className="flex items-center gap-4 px-6 py-3 border-b border-gray-100 bg-gray-50/60">
        {[120, 80, 100, 80, 60].map((w, i) => (
          <Skeleton key={i} className="h-3 rounded-full" style={{ width: w }} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-6 py-4 border-b border-gray-50 last:border-0"
        >
          <Skeleton className="h-4 w-28 rounded-lg" />
          <Skeleton className="h-4 w-16 rounded-lg" />
          <Skeleton className="h-4 w-20 rounded-lg" />
          <Skeleton className="h-4 w-16 rounded-lg" />
          <Skeleton className="h-7 w-16 rounded-lg ml-auto" />
        </div>
      ))}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
const RoomTypePage = () => {
  const {
    roomTypes,
    isLoading,
    fetchRoomTypes,
    createRoomType,
    updateRoomType,
    deleteRoomType,
  } = useRoomTypeStore();

  const { canPerformAction } = useAuthStore();

  const isManager = canPerformAction(["OWNER", "ADMIN"]);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<RoomType | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RoomType | null>(null);

  useEffect(() => {
    fetchRoomTypes();
  }, []);

  const handleCreate = async (data: CreateRoomTypePayload) => {
    await createRoomType(data);
    toast.success("Room type created");
  };

  const handleUpdate = async (data: CreateRoomTypePayload) => {
    if (!editing) return;
    await updateRoomType(editing.id, data);
    toast.success("Room type updated");
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteRoomType(deleteTarget.id);
      toast.success("Room type deleted");
    } catch (err) {
      toast.error((err as Error).message);
    }
    setDeleteTarget(null);
  };

  const totalTypes = roomTypes.length;

  return (
    <div className="min-h-screen">
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
              <LayoutGrid className="w-6 h-6 text-white" />
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
                  Room Types
                </p>
              </div>

              <h1
                className="font-bold text-white leading-tight tracking-tight"
                style={{ fontSize: "22px" }}
              >
                Room Types
              </h1>

              <p
                className="text-stone-300 mt-1 leading-snug"
                style={{ fontSize: "13px" }}
              >
                Configure room categories, pricing, and amenities for your
                property
              </p>
            </div>
          </div>

          {/* CTA */}
          {isManager && (
            <Button
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
              className="h-9 px-5 rounded-xl gap-2 bg-white text-stone-800 hover:bg-stone-50 font-semibold shadow-md shrink-0"
              style={{ fontSize: "13px" }}
            >
              <Plus className="w-3.5 h-3.5" />
              Add Room Type
            </Button>
          )}
        </div>

        {/* ── Stat strip ────────────────────────────────────────────────── */}
        <div className="relative mt-7 flex items-center gap-3 flex-wrap">
          {[
            {
              label: "Room Types",
              value: totalTypes,
              icon: LayoutGrid,
            },
            {
              label: "Categories",
              value: new Set(roomTypes.map((rt) => rt.name?.[0])).size,
              icon: BedDouble,
            },
            {
              label: "With Amenities",
              value: roomTypes.filter((rt) => (rt.amenities?.length ?? 0) > 0)
                .length,
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
        {!isLoading && roomTypes.length > 0 && (
          <div className="flex items-center gap-2">
            <p
              className="uppercase tracking-widest font-semibold text-gray-400"
              style={{ fontSize: "10px" }}
            >
              All Room Types
            </p>
            <div className="flex-1 h-px bg-gray-200" />
            <span
              className="px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-400 font-medium shadow-sm"
              style={{ fontSize: "10px" }}
            >
              {totalTypes} {totalTypes === 1 ? "type" : "types"}
            </span>
          </div>
        )}

        {/* Table */}
        {isLoading && roomTypes.length === 0 ? (
          <RoomTypeTableSkeleton />
        ) : roomTypes.length === 0 ? (
          /* ── Empty state ──────────────────────────────────────────────── */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-stone-100 border border-stone-200 mb-5">
              <BedDouble className="w-7 h-7 text-stone-400" />
            </div>
            <h3
              className="font-semibold text-gray-800 mb-1"
              style={{ fontSize: "15px" }}
            >
              No room types yet
            </h3>
            <p
              className="text-gray-400 max-w-xs leading-relaxed mb-5"
              style={{ fontSize: "12px" }}
            >
              Define your room categories — Standard, Deluxe, Suite — to start
              configuring pricing and amenities.
            </p>
            <Button
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
              className="h-9 px-5 rounded-xl bg-stone-800 hover:bg-stone-700 text-white gap-2 shadow-sm"
              style={{ fontSize: "13px" }}
            >
              <Plus className="w-3.5 h-3.5" />
              Add First Room Type
            </Button>
          </div>
        ) : (
          /* ── Table wrapped in styled card ─────────────────────────────── */
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <RoomTypeTable
              roomTypes={roomTypes}
              onEdit={(rt) => {
                setEditing(rt);
                setFormOpen(true);
              }}
              onDelete={setDeleteTarget}
              isManager={isManager}
            />
          </div>
        )}

        {/* Informational footer note */}
        {roomTypes.length > 0 && (
          <div
            className={cn(
              "flex items-start gap-3 px-4 py-3 rounded-xl",
              "bg-white border border-gray-100 shadow-sm",
            )}
          >
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-stone-100 shrink-0 mt-0.5">
              <BedDouble className="w-3.5 h-3.5 text-stone-500" />
            </div>
            <div>
              <p
                className="font-semibold text-gray-700"
                style={{ fontSize: "12px" }}
              >
                Assigning Room Types
              </p>
              <p className="text-gray-400 mt-0.5" style={{ fontSize: "11px" }}>
                Navigate to{" "}
                <span className="font-medium text-gray-500">
                  Rooms → Add Room
                </span>{" "}
                and select a room type to apply its pricing and amenity
                configuration automatically.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Form Dialog ─────────────────────────────────────────────────────── */}
      <RoomTypeFormDialog
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={editing ? handleUpdate : handleCreate}
        editingType={editing}
        isLoading={isLoading}
      />

      {/* ── Delete Confirmation ──────────────────────────────────────────────── */}
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
                This will remove the room type permanently. Rooms assigned to
                this type must be reassigned first.
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
              Delete Room Type
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RoomTypePage;
