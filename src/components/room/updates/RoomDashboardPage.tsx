// src/pages/hotel/RoomDashboardPage.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import {
  StatCardSkeleton,
  RoomCardSkeleton,
} from "@/components/ui/page-loader";
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

export function RoomDashboardPage() {
  const navigate = useNavigate();
  const { rooms, stats, isLoading, fetchRooms, fetchStats } = useRoomStore();
  const { activeAssignments, fetchActive, checkIn, checkOut } =
    useRoomAssignmentStore();

  const [checkInRoom, setCheckInRoom] = useState<Room | null>(null);
  const [checkOutRoom, setCheckOutRoom] = useState<Room | null>(null);
  const [statusRoom, setStatusRoom] = useState<Room | null>(null);
  const { updateRoomStatus } = useRoomStore();

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

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Hotel Overview</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {new Date().toLocaleDateString(undefined, {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchRooms();
              fetchStats();
              fetchActive();
            }}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw
              className={cn("h-4 w-4", isRefreshing && "animate-spin")}
            />
            Refresh
          </Button>
          <Button size="sm" onClick={() => navigate("/room")} className="gap-2">
            <Plus className="h-4 w-4" />
            Manage Rooms
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {isLoading && !stats ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
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
              iconClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
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
              iconClassName="bg-amber-500/10 text-amber-600 dark:text-amber-400"
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
              iconClassName="bg-red-500/10 text-red-600 dark:text-red-400"
              accentColor="bg-red-500"
            />
          </>
        ) : null}
      </div>

      {/* Middle section: Occupancy + Status Pipeline */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Occupancy Donut */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Occupancy Breakdown</CardTitle>
            <CardDescription>Live room status distribution</CardDescription>
          </CardHeader>
          <CardContent>
            {stats ? (
              <OccupancyDonut stats={stats} />
            ) : (
              <div className="flex justify-center py-6">
                <div className="h-30 w-30 animate-pulse rounded-full bg-muted" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Pipeline */}
        <Card className="xl:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Room Status</CardTitle>
                <CardDescription>
                  Click to filter rooms by status
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/room")}
                className="gap-1.5 text-muted-foreground"
              >
                View All
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
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
                  <div
                    key={i}
                    className="h-24 animate-pulse rounded-xl bg-muted"
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom section: Active Guests + Urgent Rooms */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Active Guests */}
        <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base">Active Guests</CardTitle>
                <Badge variant="secondary" className="rounded-full px-2">
                  {activeAssignments.length}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/hotel/guests")}
                className="gap-1.5 text-muted-foreground"
              >
                View All
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            {activeAssignments.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No active guests"
                description="Check-in a guest to see them here"
                size="sm"
              />
            ) : (
              <ScrollArea className="h-64">
                <div className="divide-y">
                  {activeAssignments.slice(0, 8).map((assignment) => {
                    const stayDays = Math.ceil(
                      (Date.now() - new Date(assignment.checkIn).getTime()) /
                        (1000 * 60 * 60 * 24),
                    );
                    const room = (assignment as any).room;
                    return (
                      <div
                        key={assignment.id}
                        className="flex items-center gap-3 px-6 py-3 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br  from-primary/20 to-primary/5 border border-primary/20">
                          <span className="text-sm font-bold text-primary">
                            {assignment.guestName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {assignment.guestName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Room {room?.roomNumber ?? "—"} ·{" "}
                            {room?.roomType?.name ?? ""}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                          <Clock className="h-3 w-3" />
                          <span>{stayDays}d</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Rooms Needing Attention */}
        <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base">Needs Attention</CardTitle>
                {urgentRooms.length > 0 && (
                  <Badge
                    variant="outline"
                    className="rounded-full px-2 border-amber-300 text-amber-700 dark:text-amber-400"
                  >
                    {urgentRooms.length}
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/room")}
                className="gap-1.5 text-muted-foreground"
              >
                Manage
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            {urgentRooms.length === 0 ? (
              <EmptyState
                icon={Sparkles}
                title="All rooms are in good shape"
                description="No rooms require immediate attention"
                size="sm"
              />
            ) : (
              <ScrollArea className="h-64">
                <div className="divide-y">
                  {urgentRooms.slice(0, 6).map((room) => (
                    <div
                      key={room.id}
                      onClick={() => navigate(`/hotel/rooms/${room.id}`)}
                      className="flex items-center gap-3 px-6 py-3 cursor-pointer hover:bg-muted/30 transition-colors"
                    >
                      <div
                        className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold",
                          room.status === "CLEANING"
                            ? "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400"
                            : "bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-400",
                        )}
                      >
                        {room.roomNumber}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">
                          Room {room.roomNumber}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Floor {room.floor} · {room.roomType.name}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs",
                            room.status === "CLEANING"
                              ? "border-amber-300 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50"
                              : "border-orange-300 text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/50",
                          )}
                        >
                          {room.status === "CLEANING"
                            ? "Cleaning"
                            : "Maintenance"}
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            setStatusRoom(room);
                          }}
                        >
                          Update
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent rooms */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold">Recent Rooms</h2>
            <p className="text-sm text-muted-foreground">
              Quick access to your rooms
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/room")}
            className="gap-1.5"
          >
            View All Rooms
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>

        {isLoading && rooms.length === 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <RoomCardSkeleton key={i} />
            ))}
          </div>
        ) : recentRooms.length === 0 ? (
          <EmptyState
            icon={BedDouble}
            title="No rooms added yet"
            description="Start by adding your first room to the property"
            action={
              <Button onClick={() => navigate("/room")} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Room
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
    </div>
  );
}

function cn(...args: any[]) {
  return args.filter(Boolean).join(" ");
}
