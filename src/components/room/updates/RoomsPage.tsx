// src/pages/hotel/RoomsPage.tsx
import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { EmptyState } from "@/components/ui/empty-state";
import { RoomCardSkeleton } from "@/components/ui/page-loader";
import { Separator } from "@/components/ui/separator";
import type {
  Room,
  RoomFilters,
  RoomStatus,
  CreateRoomPayload,
  CheckInPayload,
} from "@/types/room-types";
import { BedDouble, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { useRoomStore } from "@/store/room/useRoomStore";
import { useRoomTypeStore } from "@/store/room/roomTypeStore";
import { useRoomAssignmentStore } from "@/store/room/useRoomAssignmentStore";
import { Button } from "@/components/ui/button";
import { RoomFiltersBar } from "./RoomFiltersBar";
import { Card, CardContent } from "@/components/ui/card";
import { RoomCard } from "./RoomCard";
import { CheckInModal } from "./CheckInModal";
import { CheckOutModal } from "./CheckOutModal";
import { RoomStatusModal } from "./RoomStatusModal";
import { CreateRoomModal } from "./CreateRoomModal";

const PAGE_SIZE = 12;

export function RoomsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

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
    toast.success("Guest checked in");
    fetchRooms();
    fetchStats();
  };

  const handleCheckOut = async (assignmentId: string, notes?: string) => {
    await checkOut(assignmentId, notes);
    toast.success("Guest checked out");
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

  return (
    <div className="space-y-5 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Rooms</h1>
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Loading..." : `${meta?.total ?? 0} rooms total`}
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-2 w-fit">
          <Plus className="h-4 w-4" />
          Add Room
        </Button>
      </div>

      <Separator />

      {/* Filters bar */}
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

      {/* Rooms grid / list */}
      {isLoading && rooms.length === 0 ? (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              : "space-y-2"
          }
        >
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <RoomCardSkeleton key={i} />
          ))}
        </div>
      ) : rooms.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <EmptyState
              icon={BedDouble}
              title="No rooms found"
              description={
                Object.values(filters).some(Boolean)
                  ? "Try adjusting or clearing your filters"
                  : "Start by adding your first room"
              }
              action={
                Object.values(filters).some(Boolean) ? (
                  <Button variant="outline" onClick={handleReset}>
                    Clear Filters
                  </Button>
                ) : (
                  <Button onClick={() => setCreateOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Room
                  </Button>
                )
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              : "space-y-2"
          }
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t pt-4">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages} ·{" "}
            <span className="font-medium text-foreground">{meta?.total}</span>{" "}
            total rooms
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || isLoading}
              className="gap-1.5"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || isLoading}
              className="gap-1.5"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
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
