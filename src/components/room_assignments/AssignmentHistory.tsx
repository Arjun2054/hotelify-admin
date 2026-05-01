import { useEffect } from "react";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useRoomAssignmentStore } from "@/store/room/useRoomAssignmentStore";

interface Props {
  roomId: string;
}

export function AssignmentHistory({ roomId }: Props) {
  const { history, isLoading, fetchHistory } = useRoomAssignmentStore();

  useEffect(() => {
    fetchHistory(roomId);
  }, [roomId, fetchHistory]);

  if (isLoading) {
    return (
      <div className="space-y-3 py-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No guest history for this room.
      </p>
    );
  }

  return (
    <div className="space-y-3 py-2">
      {history.map((assignment) => (
        <div
          key={assignment.id}
          className="flex items-start justify-between p-3 rounded-lg border bg-card"
        >
          <div>
            <p className="font-medium text-sm">{assignment.guestName}</p>
            {assignment.guestEmail && (
              <p className="text-xs text-muted-foreground">
                {assignment.guestEmail}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {formatDate(assignment.checkIn)}
              {assignment.checkOut && ` → ${formatDate(assignment.checkOut)}`}
            </p>
          </div>
          <Badge variant={assignment.checkOut ? "secondary" : "default"}>
            {assignment.checkOut ? "Completed" : "Active"}
          </Badge>
        </div>
      ))}
    </div>
  );
}
