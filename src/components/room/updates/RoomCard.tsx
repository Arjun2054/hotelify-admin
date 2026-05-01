import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
  DollarSign,
  AlertTriangle,
  Wrench,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

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

const STATUS_CONFIG = {
  AVAILABLE: {
    iconClass:
      "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 ring-1 ring-emerald-200 dark:ring-emerald-800",
    accentClass: "from-emerald-500 to-teal-500",
    cardRing: "ring-1 ring-emerald-100 dark:ring-emerald-900/40",
  },
  OCCUPIED: {
    iconClass:
      "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 ring-1 ring-blue-200 dark:ring-blue-800",
    accentClass: "from-blue-500 to-indigo-500",
    cardRing: "ring-1 ring-blue-100 dark:ring-blue-900/40",
  },
  CLEANING: {
    iconClass:
      "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 ring-1 ring-amber-200 dark:ring-amber-800",
    accentClass: "from-amber-500 to-yellow-500",
    cardRing: "ring-1 ring-amber-100 dark:ring-amber-900/40",
  },
  MAINTENANCE: {
    iconClass:
      "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/60 ring-1 ring-orange-200 dark:ring-orange-800",
    accentClass: "from-orange-500 to-red-400",
    cardRing: "ring-1 ring-orange-100 dark:ring-orange-900/40",
  },
  OUT_OF_ORDER: {
    iconClass:
      "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60 ring-1 ring-red-200 dark:ring-red-800",
    accentClass: "from-red-500 to-rose-500",
    cardRing: "ring-1 ring-red-100 dark:ring-red-900/40",
  },
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
  const config = STATUS_CONFIG[room.status];

  /* ─────────────────────────── LIST VIEW ─────────────────────────── */
  if (viewMode === "list") {
    return (
      <Card
        className={cn(
          "group transition-all duration-200 hover:shadow-md cursor-pointer border-border/60",
          "hover:border-border",
          config.cardRing,
          className,
        )}
        onClick={() => onView(room)}
      >
        <CardContent className="flex items-center gap-4 p-3.5">
          {/* Status icon */}
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
              config.iconClass,
            )}
          >
            <StatusIcon className="h-4.5 w-4.5" />
          </div>

          {/* Main info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold tracking-tight">
                Room {room.roomNumber}
              </span>
              <RoomStatusBadge status={room.status} showDot />
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Layers className="h-3 w-3" />
                Floor {room.floor}
              </span>
              <span className="text-xs text-muted-foreground">
                {room.roomType.name}
              </span>
              <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                <DollarSign className="h-3 w-3" />
                <span className="font-medium text-foreground">
                  {Number(room.roomType.basePrice).toFixed(0)}
                </span>
                /night
              </span>
              {room.currentGuest && (
                <span className="flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400">
                  <User className="h-3 w-3" />
                  {room.currentGuest.guestName}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div
            className="flex shrink-0 items-center gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            {room.status === "AVAILABLE" && onCheckIn && (
              <Button
                size="sm"
                className={cn(
                  "h-8 gap-1.5 text-xs font-medium",
                  "bg-emerald-600 hover:bg-emerald-700 text-white",
                  "shadow-sm shadow-emerald-200 dark:shadow-emerald-900/30",
                )}
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
              >
                <Settings2 className="h-3.5 w-3.5" />
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
              onClick={() => onView(room)}
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
        "group relative overflow-hidden transition-all duration-200",
        "hover:shadow-lg hover:-translate-y-0.5",
        "border-border/60 hover:border-border",
        config.cardRing,
        className,
      )}
    >
      {/* Gradient accent bar */}
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-[3px] bg-linear-to-r",
          config.accentClass,
        )}
      />

      <CardContent className="pt-5 pb-3 px-4">
        {/* ── Header ── */}
        <div className="flex items-start justify-between mb-3.5">
          <div className="flex items-center gap-2.5">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl shrink-0",
                config.iconClass,
              )}
            >
              <StatusIcon className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight leading-none">
                Room {room.roomNumber}
              </p>
              <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
                <Layers className="h-3 w-3" />
                Floor {room.floor}
              </p>
            </div>
          </div>
          <RoomStatusBadge status={room.status} showDot />
        </div>

        <Separator className="mb-3.5" />

        {/* ── Details ── */}
        <div className="space-y-2">
          {/* Room type + price */}
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <BedDouble className="h-3.5 w-3.5 shrink-0" />
              {room.roomType.name}
            </span>
            <span className="text-xs font-semibold tabular-nums">
              ${Number(room.roomType.basePrice).toFixed(0)}
              <span className="font-normal text-muted-foreground">/night</span>
            </span>
          </div>

          {/* View type */}
          {room.viewType && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Eye className="h-3.5 w-3.5 shrink-0" />
              {room.viewType} View
            </div>
          )}

          {/* Accessible */}
          {room.isAccessible && (
            <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-medium">
              <Accessibility className="h-3.5 w-3.5 shrink-0" />
              Accessible Room
            </div>
          )}

          {/* Current guest card */}
          {room.currentGuest && (
            <div className="mt-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 px-3 py-2.5">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-200 dark:bg-blue-800 shrink-0 ring-2 ring-blue-100 dark:ring-blue-900">
                  <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300">
                    {room.currentGuest.guestName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 truncate leading-none">
                    {room.currentGuest.guestName}
                  </p>
                  <p className="mt-0.5 text-[11px] text-blue-500 dark:text-blue-400">
                    Since{" "}
                    {new Date(room.currentGuest.checkIn).toLocaleDateString(
                      undefined,
                      { month: "short", day: "numeric" },
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>

      {/* ── Footer actions ── */}
      <CardFooter className="px-4 pb-4 pt-1 gap-2">
        {room.status === "AVAILABLE" && onCheckIn && (
          <Button
            size="sm"
            className={cn(
              "flex-1 h-8 gap-1.5 text-xs font-medium",
              "bg-emerald-600 hover:bg-emerald-700 text-white",
              "shadow-sm shadow-emerald-200 dark:shadow-emerald-900/30",
            )}
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
            className="flex-1 h-8 gap-1.5 text-xs font-medium"
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
          className="h-8 gap-1 text-xs font-medium ml-auto text-muted-foreground hover:text-foreground"
          onClick={() => onView(room)}
        >
          Details
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </CardFooter>
    </Card>
  );
}
