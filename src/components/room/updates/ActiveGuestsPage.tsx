// src/pages/hotel/ActiveGuestsPage.tsx
import { useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/ui/empty-state";
import { PageLoader } from "@/components/ui/page-loader";
import type { Room } from "@/types/room-types";
import {
  Users,
  Clock,
  Calendar,
  DollarSign,
  LogOut,
  RefreshCw,
  Mail,
  Search,
  X,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRoomAssignmentStore } from "@/store/room/useRoomAssignmentStore";
import { StatCard } from "./stat-card";
import { CheckOutModal } from "./CheckOutModal";

export function ActiveGuestsPage() {
  const { activeAssignments, isLoading, fetchActive, checkOut } =
    useRoomAssignmentStore();
  const [search, setSearch] = useState("");
  const [checkOutData, setCheckOutData] = useState<{
    assignment: any;
    room: Room;
  } | null>(null);

  useEffect(() => {
    fetchActive();
  }, []);

  const handleCheckOut = async (assignmentId: string, notes?: string) => {
    await checkOut(assignmentId, notes);
    toast.success("Guest checked out successfully");
    fetchActive();
    setCheckOutData(null);
  };

  const filtered = activeAssignments.filter(
    (a) =>
      a.guestName.toLowerCase().includes(search.toLowerCase()) ||
      (a.guestEmail ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (a as any).room?.roomNumber?.toLowerCase().includes(search.toLowerCase()),
  );

  const totalRevenue = activeAssignments.reduce((acc, a) => {
    const days = Math.max(
      1,
      Math.ceil(
        (Date.now() - new Date(a.checkIn).getTime()) / (1000 * 60 * 60 * 24),
      ),
    );
    return acc + days * Number((a as any).room?.roomType?.basePrice ?? 0);
  }, 0);

  const avgStay =
    activeAssignments.length > 0
      ? activeAssignments.reduce((acc, a) => {
          return (
            acc +
            Math.ceil(
              (Date.now() - new Date(a.checkIn).getTime()) /
                (1000 * 60 * 60 * 24),
            )
          );
        }, 0) / activeAssignments.length
      : 0;

  if (isLoading && activeAssignments.length === 0) {
    return <PageLoader label="Loading active guests..." />;
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Active Guests</h1>
          <p className="text-sm text-muted-foreground">
            {activeAssignments.length} currently checked in
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchActive}
          disabled={isLoading}
          className="gap-2 w-fit"
        >
          <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          title="Active Guests"
          value={activeAssignments.length}
          subtitle="Currently staying"
          icon={Users}
          iconClassName="bg-blue-500/10 text-blue-600 dark:text-blue-400"
          accentColor="bg-blue-500"
        />
        <StatCard
          title="Average Stay"
          value={`${avgStay.toFixed(1)} nights`}
          subtitle="Current guests"
          icon={Clock}
          iconClassName="bg-amber-500/10 text-amber-600 dark:text-amber-400"
          accentColor="bg-amber-500"
        />
        <StatCard
          title="Estimated Revenue"
          value={`$${totalRevenue.toFixed(0)}`}
          subtitle="From active stays"
          icon={DollarSign}
          iconClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          accentColor="bg-emerald-500"
          trend={{
            value: activeAssignments.length,
            direction: "up",
            label: "guests active",
          }}
        />
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search guests by name, email, or room..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 pr-9"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Guest cards */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <EmptyState
              icon={Users}
              title={
                search ? "No guests match your search" : "No active guests"
              }
              description={
                search
                  ? "Try a different search term"
                  : "Check-in a guest from the Rooms page"
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((assignment) => {
            const stayNights = Math.max(
              1,
              Math.ceil(
                (Date.now() - new Date(assignment.checkIn).getTime()) /
                  (1000 * 60 * 60 * 24),
              ),
            );
            const room = (assignment as any).room;
            const revenue = stayNights * Number(room?.roomType?.basePrice ?? 0);

            return (
              <Card
                key={assignment.id}
                className="overflow-hidden transition-all duration-200 hover:shadow-md"
              >
                {/* Card header with gradient */}
                <div className="bg-gradient-to-r from-primary/5 to-primary/0 border-b px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/50 text-primary-foreground shadow-sm">
                      <span className="text-base font-bold">
                        {assignment.guestName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">
                        {assignment.guestName}
                      </p>
                      {assignment.guestEmail ? (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                          <Mail className="h-3 w-3" />
                          <span className="truncate">
                            {assignment.guestEmail}
                          </span>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          No email provided
                        </p>
                      )}
                    </div>
                    <Badge
                      variant="outline"
                      className="border-blue-200 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 flex-shrink-0"
                    >
                      Active
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-5 space-y-4">
                  {/* Room info */}
                  {room && (
                    <div className="grid grid-cols-2 gap-3 rounded-xl bg-muted/50 border p-3 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Room</p>
                        <p className="font-semibold mt-0.5">
                          {room.roomNumber} · Fl.{room.floor}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Type</p>
                        <p className="font-semibold mt-0.5 truncate">
                          {room.roomType?.name}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Stay details */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        Check-in
                      </div>
                      <p className="text-sm font-semibold mt-1">
                        {new Date(assignment.checkIn).toLocaleDateString(
                          undefined,
                          { month: "short", day: "numeric", year: "numeric" },
                        )}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        Duration
                      </div>
                      <p className="text-sm font-semibold mt-1">
                        {stayNights} {stayNights === 1 ? "night" : "nights"}
                      </p>
                    </div>
                  </div>

                  {/* Revenue */}
                  <div className="flex items-center justify-between rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900 px-3 py-2.5">
                    <div className="flex items-center gap-1.5 text-sm text-emerald-700 dark:text-emerald-400">
                      <DollarSign className="h-3.5 w-3.5" />
                      Estimated revenue
                    </div>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">
                      ${revenue.toFixed(2)}
                    </span>
                  </div>

                  <Separator />

                  {/* Action */}
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() =>
                      setCheckOutData({ assignment, room: room as Room })
                    }
                  >
                    <LogOut className="h-4 w-4" />
                    Check Out
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Checkout Modal */}
      {checkOutData && (
        <CheckOutModal
          isOpen={!!checkOutData}
          onClose={() => setCheckOutData(null)}
          room={
            {
              ...checkOutData.room,
              currentGuest: checkOutData.assignment,
            } as any
          }
          onConfirm={handleCheckOut}
        />
      )}
    </div>
  );
}
