// src/pages/hotel/RoomDashboardPage.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Room, RoomStatus, CheckInPayload } from "@/types/room-types";
import {
  BedDouble,
  Users,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Plus,
  ArrowRight,
  Clock,
  Hotel,
  LogIn,
  LogOut,
  Wrench,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { useRoomStore } from "@/store/room/useRoomStore";
import { useRoomAssignmentStore } from "@/store/room/useRoomAssignmentStore";
import { StatCard } from "./stat-card";
import { OccupancyDonut } from "./OccupancyDonut";
import { RoomStatusPipeline } from "./RoomStatusPipeline";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RoomCard } from "./RoomCard";
import { CheckInModal } from "./CheckInModal";
import { CheckOutModal } from "./CheckOutModal";
import { RoomStatusModal } from "./RoomStatusModal";
import { cn } from "@/lib/utils";

// ── Stat skeleton ─────────────────────────────────────────────────────────────
function StatSkeleton() {
  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-24 rounded-full" />
        <Skeleton className="h-8 w-8 rounded-xl" />
      </div>
      <Skeleton className="h-8 w-16 rounded-lg" />
      <Skeleton className="h-3 w-32 rounded-full" />
    </div>
  );
}

// ── Room card skeleton ────────────────────────────────────────────────────────
function DashRoomSkeleton() {
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
      </div>
    </div>
  );
}

// ── Card shell ────────────────────────────────────────────────────────────────
function DashCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col",
        className,
      )}
    >
      {children}
    </div>
  );
}

function DashCardHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-100 bg-gray-50/60 shrink-0">
      {children}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export function RoomDashboardPage() {
  const navigate = useNavigate();
  const { rooms, stats, isLoading, fetchRooms, fetchStats, updateRoomStatus } =
    useRoomStore();
  const { activeAssignments, fetchActive, checkIn, checkOut } =
    useRoomAssignmentStore();

  const [checkInRoom, setCheckInRoom] = useState<Room | null>(null);
  const [checkOutRoom, setCheckOutRoom] = useState<Room | null>(null);
  const [statusRoom, setStatusRoom] = useState<Room | null>(null);

  useEffect(() => {
    fetchRooms();
    fetchStats();
    fetchActive();
  }, []);

  const handleCheckIn = async (roomId: string, data: CheckInPayload) => {
    await checkIn(roomId, data);
    toast.success("Guest checked in successfully");
    fetchRooms();
    fetchStats();
    fetchActive();
  };

  const handleCheckOut = async (assignmentId: string, notes?: string) => {
    await checkOut(assignmentId, notes);
    toast.success("Guest checked out successfully");
    fetchRooms();
    fetchStats();
    fetchActive();
  };

  const handleStatusChange = async (roomId: string, status: RoomStatus) => {
    await updateRoomStatus(roomId, status);
    toast.success("Room status updated");
    fetchStats();
    fetchRooms();
  };

  const urgentRooms = rooms.filter(
    (r) => r.status === "CLEANING" || r.status === "MAINTENANCE",
  );
  const recentRooms = rooms.slice(0, 6);
  const isRefreshing = isLoading && rooms.length > 0;

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen">
      {/* ── Hero header ───────────────────────────────────────────────────── */}
      <div className="relative shrink-0 bg-linear-to-r from-primary via-primary/90 to-primary/75 px-10 py-7 text-primary-foreground overflow-hidden">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-10 -right-10 h-48 w-48 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-8 right-24 h-32 w-32 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute top-4 right-64 h-16 w-16 rounded-full bg-white/5" />

        <div className="relative flex items-start justify-between gap-6 flex-wrap">
          {/* Left */}
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm shrink-0">
              <Hotel className="w-6 h-6 text-white" />
            </div>
            <div>
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
                  Dashboard
                </p>
              </div>
              <h1
                className="font-bold text-white leading-tight tracking-tight"
                style={{ fontSize: "22px" }}
              >
                Hotel Overview
              </h1>
              <p className="text-stone-300 mt-1" style={{ fontSize: "13px" }}>
                {today}
              </p>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                fetchRooms();
                fetchStats();
                fetchActive();
              }}
              disabled={isRefreshing}
              className="h-9 px-4 rounded-xl gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/15"
              style={{ fontSize: "13px" }}
            >
              <RefreshCw
                className={cn("w-3.5 h-3.5", isRefreshing && "animate-spin")}
              />
              Refresh
            </Button>
            <Button
              size="sm"
              onClick={() => navigate("/room")}
              className="h-9 px-5 rounded-xl gap-2 bg-white text-stone-800 hover:bg-stone-50 font-semibold shadow-md"
              style={{ fontSize: "13px" }}
            >
              <Plus className="w-3.5 h-3.5" />
              Manage Rooms
            </Button>
          </div>
        </div>

        {/* ── Stat strip ────────────────────────────────────────────────── */}
        <div className="relative mt-7 flex items-center gap-3 flex-wrap">
          {[
            {
              label: "Total Rooms",
              value: stats?.total,
              icon: BedDouble,
            },
            {
              label: "Available",
              value: stats?.available,
              icon: LogIn,
            },
            {
              label: "Occupied",
              value: stats?.occupied,
              icon: LogOut,
            },
            {
              label: "Needs Attention",
              value: (stats?.cleaning ?? 0) + (stats?.maintenance ?? 0),
              icon: Wrench,
            },
            {
              label: "Active Guests",
              value: activeAssignments.length,
              icon: Users,
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
                {isLoading ? "—" : (stat.value ?? "—")}
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
      <div className="px-8 py-6 space-y-6">
        {/* ── KPI cards ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {isLoading && !stats ? (
            Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
          ) : stats ? (
            <>
              <StatCard
                title="Total Rooms"
                value={stats.total}
                subtitle={`${stats.available} available`}
                icon={BedDouble}
                iconClassName="bg-primary/10 text-primary"
                accentColor="bg-primary"
              />
              <StatCard
                title="Occupied"
                value={stats.occupied}
                subtitle={`${stats.occupancyRate}% occupancy`}
                icon={Users}
                iconClassName="bg-emerald-500/10 text-emerald-600"
                accentColor="bg-emerald-500"
                trend={{
                  value: stats.occupancyRate,
                  direction:
                    stats.occupancyRate >= 70
                      ? "up"
                      : stats.occupancyRate >= 40
                        ? "neutral"
                        : "down",
                  label: "occupancy rate",
                }}
              />
              <StatCard
                title="Needs Attention"
                value={stats.cleaning + stats.maintenance}
                subtitle={`${stats.cleaning} cleaning · ${stats.maintenance} maintenance`}
                icon={Sparkles}
                iconClassName="bg-amber-500/10 text-amber-600"
                accentColor="bg-amber-500"
                onClick={() => navigate("/room?status=CLEANING")}
              />
              <StatCard
                title="Out of Order"
                value={stats.outOfOrder}
                subtitle={
                  stats.outOfOrder > 0
                    ? "Requires immediate attention"
                    : "All systems operational"
                }
                icon={AlertCircle}
                iconClassName="bg-red-500/10 text-red-600"
                accentColor="bg-red-500"
              />
            </>
          ) : null}
        </div>

        {/* ── Occupancy + Pipeline ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          {/* Occupancy donut */}
          <DashCard>
            <DashCardHeader>
              <div>
                <p
                  className="font-semibold text-gray-800"
                  style={{ fontSize: "14px" }}
                >
                  Occupancy Breakdown
                </p>
                <p
                  className="text-gray-400 mt-0.5"
                  style={{ fontSize: "12px" }}
                >
                  Live room status distribution
                </p>
              </div>
            </DashCardHeader>
            <div className="flex-1 p-5">
              {stats ? (
                <OccupancyDonut stats={stats} />
              ) : (
                <div className="flex justify-center py-8">
                  <Skeleton className="h-32 w-32 rounded-full" />
                </div>
              )}
            </div>
          </DashCard>

          {/* Status pipeline */}
          <DashCard className="xl:col-span-2">
            <DashCardHeader>
              <div>
                <p
                  className="font-semibold text-gray-800"
                  style={{ fontSize: "14px" }}
                >
                  Room Status
                </p>
                <p
                  className="text-gray-400 mt-0.5"
                  style={{ fontSize: "12px" }}
                >
                  Click to filter rooms by status
                </p>
              </div>
              <button
                onClick={() => navigate("/room")}
                className="inline-flex items-center gap-1 text-stone-500 hover:text-stone-800 transition-colors"
                style={{ fontSize: "12px" }}
              >
                View All
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </DashCardHeader>
            <div className="flex-1 p-5">
              {stats ? (
                <RoomStatusPipeline
                  stats={stats}
                  onStatusFilter={(status) => {
                    if (status) navigate(`/room?status=${status}`);
                    else navigate("/room");
                  }}
                />
              ) : (
                <div className="grid grid-cols-5 gap-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-24 rounded-xl" />
                  ))}
                </div>
              )}
            </div>
          </DashCard>
        </div>

        {/* ── Active Guests + Needs Attention ───────────────────────────── */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Active Guests */}
          <DashCard>
            <DashCardHeader>
              <div className="flex items-center gap-2">
                <p
                  className="font-semibold text-gray-800"
                  style={{ fontSize: "14px" }}
                >
                  Active Guests
                </p>
                <span
                  className="px-2 py-0.5 rounded-full bg-stone-100 border border-stone-200 text-stone-600 font-medium leading-none"
                  style={{ fontSize: "10px" }}
                >
                  {activeAssignments.length}
                </span>
              </div>
              <button
                onClick={() => navigate("/hotel/guests")}
                className="inline-flex items-center gap-1 text-stone-500 hover:text-stone-800 transition-colors"
                style={{ fontSize: "12px" }}
              >
                View All
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </DashCardHeader>

            <div className="flex-1">
              {activeAssignments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-stone-100 mb-3">
                    <Users className="w-5 h-5 text-stone-400" />
                  </div>
                  <p
                    className="font-medium text-gray-700"
                    style={{ fontSize: "13px" }}
                  >
                    No active guests
                  </p>
                  <p
                    className="text-gray-400 mt-0.5"
                    style={{ fontSize: "11px" }}
                  >
                    Check-in a guest to see them here
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-64">
                  <div className="divide-y divide-gray-50">
                    {activeAssignments.slice(0, 8).map((assignment) => {
                      const stayDays = Math.ceil(
                        (Date.now() - new Date(assignment.checkIn).getTime()) /
                          (1000 * 60 * 60 * 24),
                      );
                      const room = (assignment as any).room;
                      return (
                        <div
                          key={assignment.id}
                          className="flex items-center gap-3 px-5 py-3 hover:bg-stone-50/60 transition-colors"
                        >
                          {/* Avatar */}
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-stone-100 border border-stone-200">
                            <span
                              className="font-bold text-stone-600"
                              style={{ fontSize: "13px" }}
                            >
                              {assignment.guestName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className="font-medium text-gray-800 truncate"
                              style={{ fontSize: "13px" }}
                            >
                              {assignment.guestName}
                            </p>
                            <p
                              className="text-gray-400 truncate"
                              style={{ fontSize: "11px" }}
                            >
                              Room {room?.roomNumber ?? "—"} ·{" "}
                              {room?.roomType?.name ?? ""}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 text-gray-400 shrink-0">
                            <Clock className="w-3 h-3" />
                            <span style={{ fontSize: "11px" }}>
                              {stayDays}d
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </div>
          </DashCard>

          {/* Needs Attention */}
          <DashCard>
            <DashCardHeader>
              <div className="flex items-center gap-2">
                <p
                  className="font-semibold text-gray-800"
                  style={{ fontSize: "14px" }}
                >
                  Needs Attention
                </p>
                {urgentRooms.length > 0 && (
                  <span
                    className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-medium leading-none"
                    style={{ fontSize: "10px" }}
                  >
                    {urgentRooms.length}
                  </span>
                )}
              </div>
              <button
                onClick={() => navigate("/room")}
                className="inline-flex items-center gap-1 text-stone-500 hover:text-stone-800 transition-colors"
                style={{ fontSize: "12px" }}
              >
                Manage
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </DashCardHeader>

            <div className="flex-1">
              {urgentRooms.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 mb-3">
                    <Sparkles className="w-5 h-5 text-emerald-500" />
                  </div>
                  <p
                    className="font-medium text-gray-700"
                    style={{ fontSize: "13px" }}
                  >
                    All rooms in good shape
                  </p>
                  <p
                    className="text-gray-400 mt-0.5"
                    style={{ fontSize: "11px" }}
                  >
                    No rooms require immediate attention
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-64">
                  <div className="divide-y divide-gray-50">
                    {urgentRooms.slice(0, 6).map((room) => (
                      <div
                        key={room.id}
                        onClick={() => navigate(`/hotel/rooms/${room.id}`)}
                        className="group flex items-center gap-3 px-5 py-3 cursor-pointer hover:bg-stone-50/60 transition-colors"
                      >
                        {/* Room number badge */}
                        <div
                          className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-bold",
                            room.status === "CLEANING"
                              ? "bg-amber-50 border border-amber-200 text-amber-700"
                              : "bg-orange-50 border border-orange-200 text-orange-700",
                          )}
                          style={{ fontSize: "11px" }}
                        >
                          {room.roomNumber}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p
                            className="font-medium text-gray-800"
                            style={{ fontSize: "13px" }}
                          >
                            Room {room.roomNumber}
                          </p>
                          <p
                            className="text-gray-400"
                            style={{ fontSize: "11px" }}
                          >
                            Floor {room.floor} · {room.roomType.name}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={cn(
                              "inline-flex items-center px-2 py-0.5 rounded-full border font-medium leading-none",
                              room.status === "CLEANING"
                                ? "bg-amber-50 border-amber-200 text-amber-700"
                                : "bg-orange-50 border-orange-200 text-orange-700",
                            )}
                            style={{ fontSize: "10px" }}
                          >
                            {room.status === "CLEANING"
                              ? "Cleaning"
                              : "Maintenance"}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setStatusRoom(room);
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-7 px-2.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600 font-medium"
                            style={{ fontSize: "11px" }}
                          >
                            Update
                          </button>
                          <ChevronRight className="w-3.5 h-3.5 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          </DashCard>
        </div>

        {/* ── Recent Rooms ──────────────────────────────────────────────── */}
        <div>
          {/* Section label */}
          <div className="flex items-center gap-2 mb-4">
            <p
              className="uppercase tracking-widest font-semibold text-gray-400"
              style={{ fontSize: "10px" }}
            >
              Recent Rooms
            </p>
            <div className="flex-1 h-px bg-gray-200" />
            <button
              onClick={() => navigate("/room")}
              className="inline-flex items-center gap-1 text-stone-500 hover:text-stone-800 transition-colors font-medium"
              style={{ fontSize: "12px" }}
            >
              View All
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {isLoading && rooms.length === 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <DashRoomSkeleton key={i} />
              ))}
            </div>
          ) : recentRooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-stone-100 border border-stone-200 mb-5">
                <BedDouble className="w-7 h-7 text-stone-400" />
              </div>
              <p
                className="font-semibold text-gray-800 mb-1"
                style={{ fontSize: "15px" }}
              >
                No rooms added yet
              </p>
              <p
                className="text-gray-400 max-w-xs leading-relaxed mb-5"
                style={{ fontSize: "12px" }}
              >
                Start by adding your first room to this property.
              </p>
              <Button
                onClick={() => navigate("/room")}
                className="h-9 px-5 rounded-xl bg-stone-800 hover:bg-stone-700 text-white gap-2 shadow-sm"
                style={{ fontSize: "13px" }}
              >
                <Plus className="w-3.5 h-3.5" />
                Add Room
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recentRooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
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
        </div>
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
    </div>
  );
}
