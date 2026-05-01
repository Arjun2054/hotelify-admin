import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HousekeepingStatus } from "@/types/houseKeeping-types";

const statusColors: Record<HousekeepingStatus, string> = {
  PENDING: "hover:bg-slate-50 hover:border-slate-300",
  IN_PROGRESS: "hover:bg-blue-50 hover:border-blue-300",
  COMPLETED: "hover:bg-amber-50 hover:border-amber-300",
  INSPECTED: "hover:bg-emerald-50 hover:border-emerald-300",
};

interface Props {
  taskId: string;
  roomNumber: string;
  status: HousekeepingStatus;
  className?: string;
}

export function LinkedTaskBadge({
  taskId,
  roomNumber,
  status,
  className,
}: Props) {
  return (
    <Link
      to={`/housekeeping?highlight=${taskId}`}
      onClick={(e) => e.stopPropagation()}
      className="inline-flex"
    >
      <Badge
        variant="outline"
        className={cn(
          "transition-colors cursor-pointer gap-1",
          statusColors[status],
          className,
        )}
      >
        <ClipboardList className="h-3 w-3" />
        Room {roomNumber} · {status.replace("_", " ")}
      </Badge>
    </Link>
  );
}
