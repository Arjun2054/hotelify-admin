import { Badge } from "@/components/ui/badge";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  name: string;
  className?: string;
}

export function LinkedUserBadge({ name, className }: Props) {
  return (
    <Badge variant="outline" className={cn("gap-1 text-xs", className)}>
      <User className="h-3 w-3" />
      {name}
    </Badge>
  );
}
