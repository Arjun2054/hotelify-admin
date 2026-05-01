import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { StaffRoleBadge } from "./StaffRoleBadge";
import { StaffActivityTimeline } from "./StaffActivityTimeline";
import {
  Mail,
  Calendar,
  ClipboardList,
  Package,
  ExternalLink,
  Pencil,
  KeyRound,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { StaffMember } from "@/types/staff-types";
import { useStaffStore } from "@/store/staff/useStaffStore";

interface Props {
  member: StaffMember | null;
  open: boolean;
  onClose: () => void;
  onEdit: (member: StaffMember) => void;
  onChangePassword: (member: StaffMember) => void;
}

export function StaffDetailSheet({
  member,
  open,
  onClose,
  onEdit,
  onChangePassword,
}: Props) {
  const { activities, fetchActivity } = useStaffStore();

  useEffect(() => {
    if (member && open) {
      fetchActivity(member.membershipId);
    }
  }, [member, open]);

  if (!member) return null;

  const initials = member.user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
              {initials}
            </div>
            <div>
              <SheetTitle className="text-xl">{member.user.name}</SheetTitle>
              <StaffRoleBadge role={member.role} className="mt-1" />
            </div>
          </div>
          <Link
            to={`/staff/${member.membershipId}`}
            className="text-sm text-primary hover:underline flex items-center gap-1 mt-2"
            onClick={onClose}
          >
            <ExternalLink className="h-3.5 w-3.5" /> Open full profile
          </Link>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onClose();
                onEdit(member);
              }}
              className="flex-1"
            >
              <Pencil className="mr-1 h-3.5 w-3.5" /> Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onClose();
                onChangePassword(member);
              }}
              className="flex-1"
            >
              <KeyRound className="mr-1 h-3.5 w-3.5" /> Reset Password
            </Button>
          </div>

          {/* Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{member.user.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Joined {formatDate(member.user.createdAt)}</span>
            </div>
          </div>

          {/* Activity counts */}
          <div className="grid grid-cols-2 gap-3">
            <Link
              to={`/housekeeping?userId=${member.userId}`}
              onClick={onClose}
              className="p-3 rounded-lg border hover:bg-muted/50 transition-colors text-center"
            >
              <ClipboardList className="h-5 w-5 text-amber-600 mx-auto mb-1" />
              <p className="text-xl font-bold">
                {member._count.housekeepingLogs}
              </p>
              <p className="text-xs text-muted-foreground">
                Housekeeping Tasks
              </p>
            </Link>
            <div className="p-3 rounded-lg border text-center">
              <Package className="h-5 w-5 text-blue-600 mx-auto mb-1" />
              <p className="text-xl font-bold">
                {member._count.stockMovements}
              </p>
              <p className="text-xs text-muted-foreground">Stock Movements</p>
            </div>
          </div>

          <Separator />

          {/* Activity Timeline */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Recent Activity</h4>
            <StaffActivityTimeline activities={activities} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
