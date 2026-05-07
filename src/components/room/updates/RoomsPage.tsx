// src/pages/hotel/RoomsPage.tsx
import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type {
  Room,
  RoomFilters,
  RoomStatus,
  CreateRoomPayload,
  CheckInPayload,
} from "@/types/room-types";
import {
  BedDouble,
  Plus,
  ChevronLeft,
  ChevronRight,
  Building2,
  Search,
  LogIn,
  LogOut,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";
import { useRoomStore } from "@/store/room/useRoomStore";
import { useRoomTypeStore } from "@/store/room/roomTypeStore";
import { useRoomAssignmentStore } from "@/store/room/useRoomAssignmentStore";
import { Button } from "@/components/ui/button";
import { RoomFiltersBar } from "./RoomFiltersBar";
import { RoomCard } from "./RoomCard";
import { CheckInModal } from "./CheckInModal";
import { CheckOutModal } from "./CheckOutModal";
import { RoomStatusModal } from "./RoomStatusModal";
import { CreateRoomModal } from "./CreateRoomModal";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";

const PAGE_SIZE = 12;

// ── Room card skeleton ────────────────────────────────────────────────────────
function HotelRoomCardSkeleton({ viewMode }: { viewMode: "grid" | "list" }) {
  if (viewMode === "list") {
    return (
      <div className="flex gap-4 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
        <Skeleton className="w-20 h-20 rounded-xl shrink-0" />
        <div className="flex-1 space-y-2 py-1">
          <Skeleton className="h-4 w-1/4 rounded-lg" />
          <Skeleton className="h-3 w-1/3 rounded-lg" />
          <Skeleton className="h-3 w-1/2 rounded-lg" />
        </div>
        <Skeleton className="w-20 h-8 rounded-xl self-center" />
      </div>
    );
  }
  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
      <Skeleton className="h-28 w-full rounded-none" />
      <div className="p-4 space-y-2.5">
        <Skeleton className="h-4 w-1/2 rounded-lg" />
        <Skeleton className="h-3 w-3/4 rounded-lg" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <Skeleton className="h-8 w-full rounded-xl mt-2" />
      </div>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function RoomsEmptyState({
  hasFilters,
  onReset,
  onCreate,
}: {
  hasFilters: boolean;
  onReset: () => void;
  onCreate: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-stone-100 border border-stone-200 mb-5">
        {hasFilters ? (
          <Search className="w-7 h-7 text-stone-400" />
        ) : (
          <BedDouble className="w-7 h-7 text-stone-400" />
        )}
      </div>
      <h3
        className="font-semibold text-gray-800 mb-1"
        style={{ fontSize: "15px" }}
      >
        {hasFilters ? "No rooms match your filters" : "No rooms yet"}
      </h3>
      <p
        className="text-gray-400 max-w-xs leading-relaxed mb-5"
        style={{ fontSize: "12px" }}
      >
        {hasFilters
          ? "Try adjusting or clearing your filters to see more results."
          : "Start by adding your first room to this property."}
      </p>
      {hasFilters ? (
        <Button
          variant="outline"
          onClick={onReset}
          className="h-9 px-5 rounded-xl border-gray-200 bg-white"
          style={{ fontSize: "12px" }}
        >
          Clear Filters
        </Button>
      ) : (
        <Button
          onClick={onCreate}
          className="h-9 px-5 rounded-xl bg-stone-800 hover:bg-stone-700 text-white gap-2 shadow-sm"
          style={{ fontSize: "13px" }}
        >
          <Plus className="w-3.5 h-3.5" />
          Add First Room
        </Button>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export function RoomsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { canPerformAction } = useAuthStore();

  const isManager = canPerformAction(["OWNER", "ADMIN"]);

  const {
    rooms,
    meta,
    floors,
    isLoading,
    filters,
    fetchRooms,
    fetchFloors,
    fetchStats,
    createRoom,
    updateRoomStatus,
    setFilters,
  } = useRoomStore();

  const { roomTypes, fetchRoomTypes } = useRoomTypeStore();
  const { checkIn, checkOut } = useRoomAssignmentStore();

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);
  const [checkInRoom, setCheckInRoom] = useState<Room | null>(null);
  const [checkOutRoom, setCheckOutRoom] = useState<Room | null>(null);
  const [statusRoom, setStatusRoom] = useState<Room | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    const status = searchParams.get("status") as RoomStatus | null;
    if (status) setFilters({ status });
  }, []);

  useEffect(() => {
    fetchRooms();
    fetchFloors();
    fetchRoomTypes();
  }, [filters, page]);

  const handleFiltersChange = useCallback(
    (newFilters: Partial<RoomFilters>) => {
      setFilters(newFilters);
      setPage(1);
    },
    [],
  );

  const handleReset = () => {
    setFilters({
      status: undefined,
      roomTypeId: undefined,
      floor: undefined,
      search: undefined,
    });
    setPage(1);
  };

  const handleCheckIn = async (roomId: string, data: CheckInPayload) => {
    await checkIn(roomId, data);
    toast.success("Guest checked in successfully");
    fetchRooms();
    fetchStats();
  };

  const handleCheckOut = async (assignmentId: string, notes?: string) => {
    await checkOut(assignmentId, notes);
    toast.success("Guest checked out successfully");
    fetchRooms();
    fetchStats();
  };

  const handleStatusChange = async (roomId: string, status: RoomStatus) => {
    await updateRoomStatus(roomId, status);
    toast.success("Room status updated");
    fetchStats();
  };

  const handleCreate = async (data: CreateRoomPayload) => {
    await createRoom(data);
    toast.success("Room created successfully");
    fetchStats();
  };

  const totalPages = meta?.totalPages ?? 1;
  const totalRooms = meta?.total ?? 0;
  const hasFilters = Object.values(filters).some(Boolean);

  // Derived counts from rooms for stat strip
  const availableCount = rooms.filter((r) => r.status === "AVAILABLE").length;
  const occupiedCount = rooms.filter((r) => r.status === "OCCUPIED").length;
  const maintenanceCount = rooms.filter(
    (r) => r.status === "MAINTENANCE",
  ).length;

  return (
    <div className="min-h-screen">
      {/* ── Hero header ───────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-linear-to-br from-stone-800 via-stone-700 to-stone-900 px-8 py-10">
        {/* Decorative blobs */}
        <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-20 -left-8 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute top-6 right-52 w-20 h-20 rounded-full bg-white/3 pointer-events-none" />

        <div className="relative flex items-start justify-between gap-6 flex-wrap">
          {/* Left: icon + title */}
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm shrink-0">
              <Building2 className="w-6 h-6 text-white" />
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
                  Rooms
                </p>
              </div>

              <h1
                className="font-bold text-white leading-tight tracking-tight"
                style={{ fontSize: "22px" }}
              >
                Room Management
              </h1>

              <p
                className="text-stone-300 mt-1 leading-snug"
                style={{ fontSize: "13px" }}
              >
                {isLoading
                  ? "Loading rooms…"
                  : `${totalRooms} room${totalRooms !== 1 ? "s" : ""} configured across this property`}
              </p>
            </div>
          </div>

          {/* Right: CTA */}
          {isManager && (
            <Button
              onClick={() => setCreateOpen(true)}
              className="h-9 px-5 rounded-xl gap-2 bg-white text-stone-800 hover:bg-stone-50 font-semibold shadow-md shrink-0"
              style={{ fontSize: "13px" }}
            >
              <Plus className="w-3.5 h-3.5" />
              Add Room
            </Button>
          )}
        </div>

        {/* ── Stat strip ────────────────────────────────────────────────── */}
        <div className="relative mt-7 flex items-center gap-3 flex-wrap">
          {[
            {
              label: "Total Rooms",
              value: totalRooms,
              icon: BedDouble,
            },
            {
              label: "Available",
              value: availableCount,
              icon: LogIn,
            },
            {
              label: "Occupied",
              value: occupiedCount,
              icon: LogOut,
            },
            {
              label: "Maintenance",
              value: maintenanceCount,
              icon: Wrench,
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
        {/* Filters bar */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm px-4 py-3">
          <RoomFiltersBar
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onReset={handleReset}
            roomTypes={roomTypes}
            floors={floors}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            totalCount={meta?.total}
          />
        </div>

        {/* Section label + result count */}
        {!isLoading && rooms.length > 0 && (
          <div className="flex items-center gap-2">
            <p
              className="uppercase tracking-widest font-semibold text-gray-400"
              style={{ fontSize: "10px" }}
            >
              {hasFilters ? "Filtered Results" : "All Rooms"}
            </p>
            <div className="flex-1 h-px bg-gray-200" />
            <span
              className="px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-400 font-medium shadow-sm"
              style={{ fontSize: "10px" }}
            >
              {rooms.length} shown
            </span>
          </div>
        )}

        {/* ── Rooms grid / list ──────────────────────────────────────────── */}
        {isLoading && rooms.length === 0 ? (
          <div
            className={cn(
              viewMode === "grid"
                ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "space-y-3",
            )}
          >
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <HotelRoomCardSkeleton key={i} viewMode={viewMode} />
            ))}
          </div>
        ) : rooms.length === 0 ? (
          <RoomsEmptyState
            hasFilters={hasFilters}
            onReset={handleReset}
            onCreate={() => setCreateOpen(true)}
          />
        ) : (
          <div
            className={cn(
              viewMode === "grid"
                ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "space-y-3",
            )}
          >
            {rooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                viewMode={viewMode}
                onView={(r) => navigate(`/hotel/rooms/${r.id}`)}
                onCheckIn={
                  room.status === "AVAILABLE" ? setCheckInRoom : undefined
                }
                onCheckOut={
                  room.status === "OCCUPIED" && room.currentGuest
                    ? setCheckOutRoom
                    : undefined
                }
                onStatusChange={
                  room.status !== "OCCUPIED" ? setStatusRoom : undefined
                }
              />
            ))}
          </div>
        )}

        {/* ── Pagination ──────────────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2 flex-wrap gap-3">
            {/* Info */}
            <p className="text-gray-400" style={{ fontSize: "12px" }}>
              Page <span className="font-semibold text-gray-600">{page}</span>{" "}
              of{" "}
              <span className="font-semibold text-gray-600">{totalPages}</span>
              {" · "}
              <span className="font-semibold text-gray-600">
                {totalRooms}
              </span>{" "}
              total rooms
            </p>

            {/* Controls */}
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || isLoading}
                className="h-8 px-3 rounded-xl border-gray-200 bg-white shadow-sm text-gray-600 hover:bg-stone-50 gap-1"
                style={{ fontSize: "12px" }}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Previous
              </Button>

              {/* Page number pills */}
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (p) =>
                      p === 1 || p === totalPages || Math.abs(p - page) <= 1,
                  )
                  .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                    if (idx > 0 && p - (arr[idx - 1] as number) > 1)
                      acc.push("…");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, idx) =>
                    p === "…" ? (
                      <span
                        key={`ellipsis-${idx}`}
                        className="w-8 text-center text-gray-400"
                        style={{ fontSize: "12px" }}
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p as number)}
                        className={cn(
                          "w-8 h-8 rounded-lg font-medium transition-all",
                          page === p
                            ? "bg-stone-800 text-white shadow-sm"
                            : "text-gray-500 hover:bg-stone-100",
                        )}
                        style={{ fontSize: "12px" }}
                      >
                        {p}
                      </button>
                    ),
                  )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || isLoading}
                className="h-8 px-3 rounded-xl border-gray-200 bg-white shadow-sm text-gray-600 hover:bg-stone-50 gap-1"
                style={{ fontSize: "12px" }}
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ── Modals ──────────────────────────────────────────────────────────── */}
      <CheckInModal
        isOpen={!!checkInRoom}
        onClose={() => setCheckInRoom(null)}
        room={checkInRoom}
        onConfirm={handleCheckIn}
      />
      <CheckOutModal
        isOpen={!!checkOutRoom}
        onClose={() => setCheckOutRoom(null)}
        room={checkOutRoom}
        onConfirm={handleCheckOut}
      />
      <RoomStatusModal
        isOpen={!!statusRoom}
        onClose={() => setStatusRoom(null)}
        room={statusRoom}
        onConfirm={handleStatusChange}
      />
      <CreateRoomModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        roomTypes={roomTypes}
        onConfirm={handleCreate}
      />
    </div>
  );
}
