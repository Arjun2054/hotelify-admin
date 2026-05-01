// src/components/staff/StaffTable.tsx

import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
  KeyRound,
  ClipboardList,
  Package,
  Mail,
  Building2,
  Briefcase,
} from "lucide-react";
import { StaffRoleBadge } from "./StaffRoleBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import type { StaffMember } from "@/types/staff-types";
import { DEPARTMENT_LABELS } from "@/types/staff-types";

interface Props {
  members: StaffMember[];
  isLoading: boolean;
  onEdit: (member: StaffMember) => void;
  onRemove: (member: StaffMember) => void;
  onChangePassword: (member: StaffMember) => void;
}

// ── Department badge color map ───────────────────────
const DEPARTMENT_COLORS: Record<string, string> = {
  HOUSEKEEPING:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  FRONT_DESK:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  KITCHEN:
    "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  MAINTENANCE:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  GENERAL: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
};

export function StaffTable({
  members,
  isLoading,
  onEdit,
  onRemove,
  onChangePassword,
}: Props) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="rounded-full bg-muted p-6 mb-4">
          <svg
            className="h-10 w-10 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold">No staff members found</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Add your first team member to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Member</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Job Title</TableHead>
            <TableHead className="text-center">Tasks</TableHead>
            <TableHead className="text-center">Stock Movements</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="w-[60px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow
              key={member.membershipId}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => navigate(`/staff/${member.membershipId}`)}
            >
              {/* Avatar + Name + Email */}
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {member.user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">
                      {member.user.name}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                      <Mail className="h-3 w-3 shrink-0" />
                      {member.user.email}
                    </p>
                  </div>
                </div>
              </TableCell>

              {/* Role */}
              <TableCell>
                <StaffRoleBadge role={member.role} />
              </TableCell>

              {/* Department */}
              <TableCell>
                {member.department ? (
                  <Badge
                    variant="secondary"
                    className={`gap-1 text-xs font-medium ${
                      DEPARTMENT_COLORS[member.department] ?? ""
                    }`}
                  >
                    <Building2 className="h-3 w-3" />
                    {DEPARTMENT_LABELS[member.department] ?? member.department}
                  </Badge>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </TableCell>

              {/* Job Title */}
              <TableCell>
                {member.jobTitle ? (
                  <div className="flex items-center gap-1.5 text-sm">
                    <Briefcase className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="truncate max-w-[160px]">
                      {member.jobTitle}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </TableCell>

              {/* Housekeeping Tasks */}
              <TableCell className="text-center">
                <Badge variant="outline" className="gap-1">
                  <ClipboardList className="h-3 w-3" />
                  {member._count.housekeepingLogs}
                </Badge>
              </TableCell>

              {/* Stock Movements */}
              <TableCell className="text-center">
                <Badge variant="outline" className="gap-1">
                  <Package className="h-3 w-3" />
                  {member._count.stockMovements}
                </Badge>
              </TableCell>

              {/* Joined Date */}
              <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                {formatDate(member.user.createdAt)}
              </TableCell>

              {/* Actions */}
              <TableCell onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/staff/${member.membershipId}`);
                      }}
                    >
                      <Eye className="mr-2 h-4 w-4" /> View Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(member);
                      }}
                    >
                      <Pencil className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onChangePassword(member);
                      }}
                    >
                      <KeyRound className="mr-2 h-4 w-4" /> Reset Password
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />

                    {/* Show housekeeping link only for relevant staff */}
                    {(!member.department ||
                      member.department === "HOUSEKEEPING") && (
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/housekeeping?userId=${member.userId}`);
                        }}
                      >
                        <ClipboardList className="mr-2 h-4 w-4" /> Housekeeping
                        Tasks
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove(member);
                      }}
                      disabled={member.role === "OWNER"}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
