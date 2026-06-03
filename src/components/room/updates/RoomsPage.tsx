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
      <div className="flex items-center gap-4 rounded-md border border-border/60 bg-card px-5 py-3">
        <Skeleton className="h-5 w-12 shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3.5 w-1/3" />
          <Skeleton className="h-3 w-1/4" />
        </div>
        <Skeleton className="h-8 w-24" />
      </div>
    );
  }
  return (
    <div className="flex flex-col overflow-hidden rounded-md border border-border/60 bg-card">
      <div className="space-y-3 p-5">
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-7 w-20" />
        <Skeleton className="h-3 w-16" />
        <div className="space-y-2 pt-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </div>
      <div className="border-t border-border/60 bg-muted/20 px-5 py-3">
        <Skeleton className="h-8 w-full" />
      </div>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function RoomsEmptyState({
  hasFilters,
  onReset,
  onCreate,
  canCreate,
}: {
  hasFilters: boolean;
  onReset: () => void;
  onCreate: () => void;
  canCreate: boolean;
}) {
  const Icon = hasFilters ? Search : BedDouble;
  return (
    <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-border/60 bg-muted/10 px-6 py-20 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted/60 text-muted-foreground">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-sm font-semibold text-foreground">
        {hasFilters ? "No rooms match your filters" : "No rooms yet"}
      </h3>
      <p className="mt-1 max-w-xs text-xs text-muted-foreground">
        {hasFilters
          ? "Try adjusting or clearing your filters to see more results."
          : "Start by adding your first room to this property."}
      </p>
      <div className="mt-5">
        {hasFilters ? (
          <Button variant="outline" size="sm" onClick={onReset}>
            Clear filters
          </Button>
        ) : (
          canCreate && (
            <Button size="sm" onClick={onCreate} className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Add first room
            </Button>
          )
        )}
      </div>
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

  /* ─────────────────────────── Pagination helper ─────────────────────────── */
  const pageItems = (() => {
    const items: (number | "…")[] = [];
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
      (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
    );
    pages.forEach((p, idx) => {
      if (idx > 0 && p - (pages[idx - 1] as number) > 1) items.push("…");
      items.push(p);
    });
    return items;
  })();

  return (
    <div className="min-h-screen">
      {/* ── Hero header ───────────────────────────────────────────────────── */}
      <div className="relative shrink-0 bg-linear-to-r from-primary via-primary/90 to-primary/75 px-10 py-7 text-primary-foreground overflow-hidden">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-10 -right-10 h-48 w-48 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-8 right-24 h-32 w-32 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute top-4 right-64 h-16 w-16 rounded-full bg-white/5" />
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
        <div className="brounded-md border border-border/60 bg-card px-4 py-3">
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
          <div className="flex items-center gap-3">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {hasFilters ? "Filtered results" : "All rooms"}
            </p>
            <span
              aria-hidden
              className="h-px flex-1 bg-linear-to-r from-border to-transparent"
            />
            <span className="text-[11px] tabular-nums text-muted-foreground">
              {rooms.length} of {totalRooms}
            </span>
          </div>
        )}

        {/* ── Rooms grid / list ──────────────────────────────────────────── */}
        {isLoading && rooms.length === 0 ? (
          <div
            className={cn(
              viewMode === "grid"
                ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "space-y-2",
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
            canCreate={isManager}
          />
        ) : (
          <div
            className={cn(
              viewMode === "grid"
                ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "space-y-2",
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
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4">
            {/* Info */}
            <p className="text-xs text-muted-foreground">
              Page{" "}
              <span className="font-medium text-foreground tabular-nums">
                {page}
              </span>{" "}
              of{" "}
              <span className="font-medium text-foreground tabular-nums">
                {totalPages}
              </span>
              <span className="mx-1.5 text-border">·</span>
              <span className="font-medium text-foreground tabular-nums">
                {totalRooms}
              </span>{" "}
              total
            </p>

            {/* Controls */}
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || isLoading}
                className="h-8 gap-1 px-2.5 text-xs"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Previous
              </Button>

              {/* Page number pills */}
              <div className="mx-1 flex items-center gap-0.5">
                {pageItems.map((p, idx) =>
                  p === "…" ? (
                    <span
                      key={`ellipsis-${idx}`}
                      className="w-8 text-center text-xs text-muted-foreground"
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p as number)}
                      aria-current={page === p ? "page" : undefined}
                      className={cn(
                        "h-8 w-8 rounded-md text-xs font-medium tabular-nums transition-colors",
                        page === p
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
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
                className="h-8 gap-1 px-2.5 text-xs"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5" />
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
