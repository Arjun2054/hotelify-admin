// src/components/room/RoomStatusBadge.tsx
import { Badge } from "@/components/ui/badge";
import type { RoomStatus } from "@/types/room-types";
import { cn } from "@/lib/utils";

interface RoomStatusBadgeProps {
  status: RoomStatus;
  showDot?: boolean;
  className?: string;
}

const statusConfig: Record<
  RoomStatus,
  {
    label: string;
    className: string;
    dotColor: string;
  }
> = {
  AVAILABLE: {
    label: "Available",
    className:
      "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800",
    dotColor: "bg-emerald-500",
  },
  OCCUPIED: {
    label: "Occupied",
    className:
      "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800",
    dotColor: "bg-blue-500",
  },
  CLEANING: {
    label: "Cleaning",
    className:
      "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800",
    dotColor: "bg-amber-500",
  },
  MAINTENANCE: {
    label: "Maintenance",
    className:
      "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-50 dark:bg-orange-950/50 dark:text-orange-400 dark:border-orange-800",
    dotColor: "bg-orange-500",
  },
  OUT_OF_ORDER: {
    label: "Out of Order",
    className:
      "bg-red-50 text-red-700 border-red-200 hover:bg-red-50 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800",
    dotColor: "bg-red-500",
  },
};

export function RoomStatusBadge({
  status,
  showDot = false,
  className,
}: RoomStatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <Badge
      variant="outline"
      className={cn("gap-1.5 font-medium", config.className, className)}
    >
      {showDot && (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full animate-pulse",
            config.dotColor,
          )}
        />
      )}
      {config.label}
    </Badge>
  );
}
