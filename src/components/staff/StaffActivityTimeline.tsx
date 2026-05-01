import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ClipboardList,
  ArrowUpCircle,
  ArrowDownCircle,
  AlertTriangle,
  ArrowRightLeft,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { StaffActivity } from "@/types/staff-types";

interface Props {
  activities: StaffActivity[];
  isLoading?: boolean;
}

const movementIcons: Record<string, React.ReactNode> = {
  STOCK_IN: <ArrowUpCircle className="h-4 w-4 text-emerald-600" />,
  STOCK_OUT: <ArrowDownCircle className="h-4 w-4 text-blue-600" />,
  DAMAGE: <AlertTriangle className="h-4 w-4 text-red-600" />,
  TRANSFER: <ArrowRightLeft className="h-4 w-4 text-purple-600" />,
};

export function StaffActivityTimeline({ activities, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No activity recorded yet.
      </p>
    );
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />

      <div className="space-y-4">
        {activities.map((activity, idx) => {
          const isHK = activity.type === "HOUSEKEEPING";
          const movementType = activity.meta?.movementType as string;

          const roomId = activity.meta?.roomId as string;
          const itemId = activity.meta?.itemId as string;

          const linkTo = isHK
            ? `/housekeeping/tasks?highlight=${activity.id}`
            : itemId
              ? `/hotel-items/${itemId}`
              : "#";

          return (
            <Link
              key={`${activity.type}-${activity.id}-${idx}`}
              to={linkTo}
              className="relative flex items-start gap-4 pl-2 group"
            >
              {/* Dot */}
              <div
                className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 bg-background group-hover:shadow-md transition-shadow ${
                  isHK ? "border-amber-300" : "border-blue-300"
                }`}
              >
                {isHK ? (
                  <ClipboardList className="h-4 w-4 text-amber-600" />
                ) : (
                  movementIcons[movementType] || (
                    <ArrowRightLeft className="h-4 w-4 text-gray-500" />
                  )
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pb-4">
                <div className="flex items-center gap-2 mb-0.5">
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${
                      isHK
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-blue-50 text-blue-700 border-blue-200"
                    }`}
                  >
                    {isHK ? "Housekeeping" : "Stock"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(activity.timestamp)}
                  </span>
                </div>
                <p className="text-sm text-foreground group-hover:text-primary transition-colors">
                  {activity.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
