import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { BedDouble } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  roomId: string;
  roomNumber: string;
  floor?: number;
  className?: string;
  showIcon?: boolean;
}

export function LinkedRoomBadge({
  roomId,
  roomNumber,
  floor,
  className,
  showIcon = true,
}: Props) {
  return (
    <Link
      to={`/rooms/${roomId}`}
      onClick={(e) => e.stopPropagation()}
      className="inline-flex"
    >
      <Badge
        variant="outline"
        className={cn(
          "hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors cursor-pointer gap-1",
          className,
        )}
      >
        {showIcon && <BedDouble className="h-3 w-3" />}
        Room {roomNumber}
        {floor !== undefined && (
          <span className="text-muted-foreground ml-0.5">· F{floor}</span>
        )}
      </Badge>
    </Link>
  );
}
