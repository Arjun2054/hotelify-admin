import { CreateStaffDialog } from "@/components/staff/CreateStaffDialog";
import { EditStaffDialog } from "@/components/staff/EditStaffDialog";
import { StaffDetailSheet } from "@/components/staff/StaffDetailSheet";
import { StaffFilters } from "@/components/staff/StaffFilters";
import { StaffStatsCards } from "@/components/staff/StaffStatsCards";
import { StaffTable } from "@/components/staff/StaffTable";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStaffStore } from "@/store/staff/useStaffStore";
import type {
  CreateStaffPayload,
  StaffMember,
  UpdateStaffPayload,
} from "@/types/staff-types";
import { Eye, EyeOff, Loader2, Plus } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

const StaffPage = () => {
  const {
    members,
    stats,
    filters,
    meta,
    isLoading,
    fetchMembers,
    fetchStats,
    createMember,
    updateMember,
    changePassword,
    removeMember,
    setFilters,
  } = useStaffStore();

  // Dialog states
  const [createOpen, setCreateOpen] = useState(false);
  const [editMember, setEditMember] = useState<StaffMember | null>(null);
  const [detailMember, setDetailMember] = useState<StaffMember | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<StaffMember | null>(null);
  const [passwordMember, setPasswordMember] = useState<StaffMember | null>(
    null,
  );
  const [newPassword, setNewPassword] = useState("");
  const [showNewPw, setShowNewPw] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [filters]);

  // ── Handlers ──────────────────────────────────────────

  const handleCreate = async (data: CreateStaffPayload) => {
    try {
      await createMember(data);
      toast.success(`${data.name} added as ${data.role}`);
    } catch (err) {
      toast.error((err as Error).message);
      throw err;
    }
  };

  const handleUpdate = async (id: string, data: UpdateStaffPayload) => {
    try {
      await updateMember(id, data);
      toast.success("Member updated");
    } catch (err) {
      toast.error((err as Error).message);
      throw err;
    }
  };

  const handleChangePassword = async () => {
    if (!passwordMember || !newPassword) return;
    try {
      await changePassword(passwordMember.membershipId, newPassword);
      toast.success(`Password reset for ${passwordMember.user.name}`);
      setPasswordMember(null);
      setNewPassword("");
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const handleRemove = async () => {
    if (!removeTarget) return;
    try {
      await removeMember(removeTarget.membershipId);
      toast.success(`${removeTarget.user.name} removed`);
    } catch (err) {
      toast.error((err as Error).message);
    }
    setRemoveTarget(null);
  };

  const clearFilters = () => {
    setFilters({ role: undefined, search: undefined });
  };
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Staff Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage team members, roles, and monitor activity.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Member
        </Button>
      </div>
      <StaffStatsCards stats={stats} />

      <StaffFilters
        filters={filters}
        onFilterChange={setFilters}
        onClear={clearFilters}
      />

      <StaffTable
        members={members}
        isLoading={isLoading}
        onEdit={setEditMember}
        onRemove={setRemoveTarget}
        onChangePassword={setPasswordMember}
      />

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {members.length} of {meta.total} members
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={meta.page <= 1}
              onClick={() => fetchMembers(meta.page - 1)}
            >
              Previous
            </Button>
            <span className="flex items-center px-2">
              Page {meta.page} of {meta.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={meta.page >= meta.totalPages}
              onClick={() => fetchMembers(meta.page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* ── Dialogs ──────────────────────────────────── */}

      <CreateStaffDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
        isLoading={isLoading}
      />

      <EditStaffDialog
        open={!!editMember}
        member={editMember}
        onClose={() => setEditMember(null)}
        onSubmit={handleUpdate}
        isLoading={isLoading}
      />

      <StaffDetailSheet
        member={detailMember}
        open={detailOpen}
        onClose={() => {
          setDetailOpen(false);
          setDetailMember(null);
        }}
        onEdit={(m) => {
          setDetailOpen(false);
          setEditMember(m);
        }}
        onChangePassword={(m) => {
          setDetailOpen(false);
          setPasswordMember(m);
        }}
      />

      {/* Password Reset */}
      <Dialog
        open={!!passwordMember}
        onOpenChange={() => {
          setPasswordMember(null);
          setNewPassword("");
        }}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>
              Reset Password — {passwordMember?.user.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPw">New Password</Label>
              <div className="relative">
                <Input
                  id="newPw"
                  type={showNewPw ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setShowNewPw(!showNewPw)}
                >
                  {showNewPw ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setPasswordMember(null);
                setNewPassword("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleChangePassword}
              disabled={isLoading || newPassword.length < 6}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reset Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StaffPage;
