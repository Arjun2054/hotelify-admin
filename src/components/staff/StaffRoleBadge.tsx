import { Badge } from "@/components/ui/badge";
import { Shield, ShieldCheck, UserCog } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MemberRole } from "@/types/staff-types";

const roleConfig: Record<
  MemberRole,
  { label: string; icon: React.ElementType; className: string }
> = {
  OWNER: {
    label: "Owner",
    icon: ShieldCheck,
    className: "bg-purple-100 text-purple-800 border-purple-200",
  },
  ADMIN: {
    label: "Admin",
    icon: Shield,
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
  STAFF: {
    label: "Staff",
    icon: UserCog,
    className: "bg-slate-100 text-slate-700 border-slate-200",
  },
};

interface Props {
  role: MemberRole;
  className?: string;
  showIcon?: boolean;
}

export function StaffRoleBadge({ role, className, showIcon = true }: Props) {
  const config = roleConfig[role];
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn(config.className, "gap-1", className)}
    >
      {showIcon && <Icon className="h-3 w-3" />}
      {config.label}
    </Badge>
  );
}
