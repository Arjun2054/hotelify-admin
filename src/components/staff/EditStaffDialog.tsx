// src/components/staff/EditStaffDialog.tsx

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import type {
  MemberRole,
  StaffDepartment,
  StaffMember,
  UpdateStaffPayload,
} from "@/types/staff-types";
import { ALL_DEPARTMENTS, DEPARTMENT_LABELS } from "@/types/staff-types";

interface Props {
  open: boolean;
  member: StaffMember | null;
  onClose: () => void;
  onSubmit: (id: string, data: UpdateStaffPayload) => Promise<void>;
  isLoading: boolean;
}

export function EditStaffDialog({
  open,
  member,
  onClose,
  onSubmit,
  isLoading,
}: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<MemberRole>("STAFF");
  const [department, setDepartment] = useState<StaffDepartment | null>(null);
  const [jobTitle, setJobTitle] = useState("");

  useEffect(() => {
    if (member) {
      setName(member.user.name);
      setEmail(member.user.email);
      setRole(member.role);
      setDepartment(member.department || null);
      setJobTitle(member.jobTitle ?? "");
    }
  }, [member]);

  const isStaffRole = role === "STAFF";

  const handleSubmit = async () => {
    if (!member) return;

    const payload: UpdateStaffPayload = {};

    if (name !== member.user.name) payload.name = name;
    if (email !== member.user.email) payload.email = email;
    if (role !== member.role) payload.role = role;

    if (isStaffRole) {
      if (department !== member.department) payload.department = department;
      const trimmedTitle = jobTitle.trim() || null;
      if (trimmedTitle !== member.jobTitle) payload.jobTitle = trimmedTitle;
    } else {
      // Switching away from STAFF → clear department
      // if (member.role === "STAFF" && role !== "STAFF" ) {
      //   payload.department = null;
      //   payload.jobTitle = null;
      // }
    }

    try {
      await onSubmit(member.membershipId, payload);
      onClose();
    } catch {
      // handled upstream
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Edit Team Member</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Full Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Role</Label>
            <Select
              value={role}
              onValueChange={(v) => {
                setRole(v as MemberRole);
                if (v !== "STAFF") {
                  setDepartment(null);
                  setJobTitle("");
                }
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OWNER">Owner</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="STAFF">Staff</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isStaffRole && (
            <>
              <div className="space-y-1.5">
                <Label>Department</Label>
                <Select
                  value={department ?? ""}
                  onValueChange={(v) =>
                    setDepartment((v as StaffDepartment) || null)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="No department" />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_DEPARTMENTS.map((d) => (
                      <SelectItem key={d} value={d}>
                        {DEPARTMENT_LABELS[d]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>
                  Job Title{" "}
                  <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Head Housekeeper, Chef"
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !name.trim() || !email.trim()}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
