// src/components/staff/CreateStaffDialog.tsx

import { useState } from "react";
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
import { Eye, EyeOff, Loader2 } from "lucide-react";
import type {
  CreateStaffPayload,
  MemberRole,
  StaffDepartment,
} from "@/types/staff-types";
import { ALL_DEPARTMENTS, DEPARTMENT_LABELS } from "@/types/staff-types";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateStaffPayload) => Promise<void>;
  isLoading: boolean;
}

const JOB_TITLE_SUGGESTIONS: Record<StaffDepartment, string[]> = {
  HOUSEKEEPING: [
    "Housekeeper",
    "Head Housekeeper",
    "Room Attendant",
    "Laundry Attendant",
  ],
  FRONT_DESK: [
    "Receptionist",
    "Front Desk Manager",
    "Concierge",
    "Night Auditor",
  ],
  KITCHEN: ["Chef", "Sous Chef", "Kitchen Helper", "Pastry Chef", "Line Cook"],
  MAINTENANCE: ["Maintenance Technician", "Engineer", "Groundskeeper"],
  GENERAL: ["Staff Member", "Assistant"],
};

export function CreateStaffDialog({
  open,
  onClose,
  onSubmit,
  isLoading,
}: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [role, setRole] = useState<MemberRole>("STAFF");
  const [department, setDepartment] = useState<StaffDepartment>("GENERAL");
  const [jobTitle, setJobTitle] = useState("");

  const isStaffRole = role === "STAFF";

  const reset = () => {
    setName("");
    setEmail("");
    setPassword("");
    setRole("STAFF");
    setDepartment("GENERAL");
    setJobTitle("");
    setShowPw(false);
  };

  const handleSubmit = async () => {
    const payload: CreateStaffPayload = {
      name,
      email,
      password,
      role,
    };

    if (isStaffRole) {
      payload.department = department;
      if (jobTitle.trim()) payload.jobTitle = jobTitle.trim();
    }

    try {
      await onSubmit(payload);
      reset();
      onClose();
    } catch {
      // error handled upstream
    }
  };

  const canSubmit =
    name.trim() &&
    email.trim() &&
    password.length >= 6 &&
    role &&
    (!isStaffRole || department);

  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        reset();
        onClose();
      }}
    >
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Add New Team Member</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="staff-name">Full Name</Label>
            <Input
              id="staff-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="staff-email">Email</Label>
            <Input
              id="staff-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label htmlFor="staff-pw">Password</Label>
            <div className="relative">
              <Input
                id="staff-pw"
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
                onClick={() => setShowPw(!showPw)}
              >
                {showPw ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Role */}
          <div className="space-y-1.5">
            <Label>Role</Label>
            <Select
              value={role}
              onValueChange={(v) => {
                setRole(v as MemberRole);
                // Reset department when switching away from STAFF
                if (v !== "STAFF") {
                  setDepartment("GENERAL");
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

          {/* ── Department (only when role = STAFF) ───── */}
          {isStaffRole && (
            <>
              <div className="space-y-1.5">
                <Label>Department</Label>
                <Select
                  value={department}
                  onValueChange={(v) => {
                    setDepartment(v as StaffDepartment);
                    setJobTitle(""); // reset job title on dept change
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
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

              {/* Job Title */}
              <div className="space-y-1.5">
                <Label>
                  Job Title{" "}
                  <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Select value={jobTitle} onValueChange={setJobTitle}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select or type a title" />
                  </SelectTrigger>
                  <SelectContent>
                    {(JOB_TITLE_SUGGESTIONS[department] ?? []).map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {/* Also allow free-text input */}
                <Input
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="Or type a custom title"
                  className="mt-1"
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              reset();
              onClose();
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || !canSubmit}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add Member
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
