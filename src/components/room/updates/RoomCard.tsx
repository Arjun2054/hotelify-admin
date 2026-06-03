import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RoomStatusBadge } from "@/components/room/RoomStatusBadge";
import type { Room } from "@/types/room-types";
import {
  BedDouble,
  User,
  Layers,
  Eye,
  Accessibility,
  LogIn,
  LogOut,
  Settings2,
  ChevronRight,
  AlertTriangle,
  Wrench,
  Sparkles,
  CalendarDays,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

interface RoomCardProps {
  room: Room;
  onView: (room: Room) => void;
  onCheckIn?: (room: Room) => void;
  onCheckOut?: (room: Room) => void;
  onStatusChange?: (room: Room) => void;
  viewMode?: "grid" | "list";
  className?: string;
}

const STATUS_ICON_MAP = {
  AVAILABLE: Sparkles,
  OCCUPIED: User,
  CLEANING: Sparkles,
  MAINTENANCE: Wrench,
  OUT_OF_ORDER: AlertTriangle,
} as const;

/**
 * Minimal palette: a single subtle accent dot color per status.
 * No card rings, no gradient bars — color is reserved for the badge
 * and a tiny left indicator so the UI reads as a calm neutral grid.
 */
const STATUS_ACCENT = {
  AVAILABLE: "bg-emerald-500",
  OCCUPIED: "bg-blue-500",
  CLEANING: "bg-amber-500",
  MAINTENANCE: "bg-orange-500",
  OUT_OF_ORDER: "bg-red-500",
} as const;

const STATUS_ICON_TONE = {
  AVAILABLE: "text-emerald-600 dark:text-emerald-400",
  OCCUPIED: "text-blue-600 dark:text-blue-400",
  CLEANING: "text-amber-600 dark:text-amber-400",
  MAINTENANCE: "text-orange-600 dark:text-orange-400",
  OUT_OF_ORDER: "text-red-600 dark:text-red-400",
} as const;

export function RoomCard({
  room,
  onView,
  onCheckIn,
  onCheckOut,
  onStatusChange,
  viewMode = "grid",
  className,
}: RoomCardProps) {
  const StatusIcon = STATUS_ICON_MAP[room.status];
  const accent = STATUS_ACCENT[room.status];
  const iconTone = STATUS_ICON_TONE[room.status];

  /* ─────────────────────────── LIST VIEW ─────────────────────────── */
  if (viewMode === "list") {
    return (
      <Card
        className={cn(
          "group relative cursor-pointer overflow-hidden border-border/60 bg-card",
          "shadow-none transition-colors duration-150",
          "hover:bg-muted/30 hover:border-border",
          className,
        )}
        onClick={() => onView(room)}
      >
        {/* Tiny left status indicator */}
        <span
          aria-hidden
          className={cn(
            "absolute inset-y-3 left-0 w-0.5 rounded-r-full opacity-70",
            accent,
          )}
        />

        <CardContent className="flex items-center gap-4 py-3 pl-5 pr-3">
          {/* Room number — primary anchor */}
          <div className="flex w-20 shrink-0 flex-col">
            <span className="text-base font-semibold tracking-tight tabular-nums leading-none">
              {room.roomNumber}
            </span>
            <span className="mt-1.5 flex items-center gap-1 text-[11px] text-muted-foreground">
              <Layers className="h-3 w-3" />
              Floor {room.floor}
            </span>
          </div>

          {/* Type + price */}
          <div className="hidden sm:flex min-w-0 flex-1 items-center gap-6">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {room.roomType.name}
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground tabular-nums">
                {formatCurrency(room.roomType.basePrice)}
                <span className="text-muted-foreground/70"> / night</span>
              </p>
            </div>

            {/* Guest pill — only when occupied */}
            {room.currentGuest && (
              <div className="hidden md:flex min-w-0 items-center gap-2 rounded-full bg-muted/60 px-2.5 py-1">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-background text-[10px] font-semibold text-foreground/80">
                  {room.currentGuest.guestName.charAt(0).toUpperCase()}
                </span>
                <span className="truncate text-xs font-medium text-foreground/80">
                  {room.currentGuest.guestName}
                </span>
              </div>
            )}
          </div>

          {/* Status */}
          <div className="hidden sm:block">
            <RoomStatusBadge status={room.status} showDot />
          </div>

          {/* Actions */}
          <div
            className="flex shrink-0 items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            {room.status === "AVAILABLE" && onCheckIn && (
              <Button
                size="sm"
                variant="outline"
                className="h-8 gap-1.5 text-xs font-medium"
                onClick={() => onCheckIn(room)}
              >
                <LogIn className="h-3.5 w-3.5" />
                Check In
              </Button>
            )}
            {room.status === "OCCUPIED" && room.currentGuest && onCheckOut && (
              <Button
                size="sm"
                variant="outline"
                className="h-8 gap-1.5 text-xs font-medium"
                onClick={() => onCheckOut(room)}
              >
                <LogOut className="h-3.5 w-3.5" />
                Check Out
              </Button>
            )}
            {onStatusChange && room.status !== "OCCUPIED" && (
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                onClick={() => onStatusChange(room)}
                aria-label="Change status"
              >
                <Settings2 className="h-3.5 w-3.5" />
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground"
              onClick={() => onView(room)}
              aria-label="View room"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  /* ─────────────────────────── GRID VIEW ─────────────────────────── */
  return (
    <Card
      className={cn(
        "group relative flex flex-col overflow-hidden border-border/60 bg-card",
        "shadow-none transition-all duration-200",
        "hover:border-border hover:shadow-sm",
        className,
      )}
    >
      <CardContent className="flex-1 p-5">
        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <StatusIcon className={cn("h-3.5 w-3.5 shrink-0", iconTone)} />
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Room
              </span>
            </div>
            <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums leading-none">
              {room.roomNumber}
            </p>
            <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
              <Layers className="h-3 w-3" />
              Floor {room.floor}
            </p>
          </div>

          <RoomStatusBadge status={room.status} showDot />
        </div>

        {/* ── Details ── */}
        <dl className="mt-5 space-y-2.5 text-xs">
          <div className="flex items-center justify-between gap-3">
            <dt className="flex items-center gap-1.5 text-muted-foreground">
              <BedDouble className="h-3.5 w-3.5 shrink-0" />
              Type
            </dt>
            <dd className="truncate font-medium text-foreground">
              {room.roomType.name}
            </dd>
          </div>

          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">Rate</dt>
            <dd className="font-semibold tabular-nums text-foreground">
              {formatCurrency(room.roomType.basePrice)}
              <span className="ml-0.5 font-normal text-muted-foreground">
                /night
              </span>
            </dd>
          </div>

          {room.viewType && (
            <div className="flex items-center justify-between gap-3">
              <dt className="flex items-center gap-1.5 text-muted-foreground">
                <Eye className="h-3.5 w-3.5 shrink-0" />
                View
              </dt>
              <dd className="font-medium text-foreground">{room.viewType}</dd>
            </div>
          )}

          {room.isAccessible && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Accessibility className="h-3.5 w-3.5 shrink-0" />
              Accessible room
            </div>
          )}
        </dl>

        {/* ── Guest (only when occupied) ── */}
        {room.currentGuest && (
          <div className="mt-4 flex items-center gap-2.5 rounded-md border border-border/60 bg-muted/30 px-3 py-2.5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-background text-[11px] font-semibold text-foreground/80 ring-1 ring-border/60">
              {room.currentGuest.guestName.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-foreground leading-tight">
                {room.currentGuest.guestName}
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                <CalendarDays className="h-3 w-3" />
                Since{" "}
                {new Date(room.currentGuest.checkIn).toLocaleDateString(
                  undefined,
                  { month: "short", day: "numeric" },
                )}
              </p>
            </div>
          </div>
        )}
      </CardContent>

      {/* ── Footer actions ── */}
      <CardFooter className="gap-2 border-t border-border/60 bg-muted/20 px-5 py-3">
        {room.status === "AVAILABLE" && onCheckIn && (
          <Button
            size="sm"
            className="h-8 flex-1 gap-1.5 text-xs font-medium"
            onClick={() => onCheckIn(room)}
          >
            <LogIn className="h-3.5 w-3.5" />
            Check In
          </Button>
        )}

        {room.status === "OCCUPIED" && room.currentGuest && onCheckOut && (
          <Button
            size="sm"
            variant="outline"
            className="h-8 flex-1 gap-1.5 text-xs font-medium"
            onClick={() => onCheckOut(room)}
          >
            <LogOut className="h-3.5 w-3.5" />
            Check Out
          </Button>
        )}

        {onStatusChange && !["OCCUPIED", "AVAILABLE"].includes(room.status) && (
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1.5 text-xs font-medium"
            onClick={() => onStatusChange(room)}
          >
            <Settings2 className="h-3.5 w-3.5" />
            Status
          </Button>
        )}

        <Button
          size="sm"
          variant="ghost"
          className="ml-auto h-8 gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
          onClick={() => onView(room)}
        >
          Details
          <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Button>
      </CardFooter>
    </Card>
  );
}
