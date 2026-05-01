"use client";

import { useEffect, useState } from "react";
import {
  X,
  BedDouble,
  Users,
  Plus,
  Loader2,
  AlertCircle,
  Search,
  CheckCircle2,
  Clock,
  Wrench,
  AlertTriangle,
} from "lucide-react";

import { useAuthStore } from "@/store/useAuthStore";
import { organizationService } from "@/services/organizationService";
import type {
  BatchCreateTasksPayload,
  CreateHousekeepingTaskPayload,
} from "@/types/houseKeeping-types";
import type { Room } from "@/types/room-types";
import type { OrganizationMember } from "@/services/organizationService";
import { useHousekeepingStore } from "@/store/houseKeeping/useHousekeepingStore";
import { useRoomStore } from "@/store/room/useRoomStore";

// ── Types ──────────────────────────────────────────────────
interface CreateTaskModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

type Mode = "single" | "batch";

// ── Room Status Config ─────────────────────────────────────
const ROOM_STATUS_CONFIG: Record<
  string,
  {
    label: string;
    icon: React.ElementType;
    color: string;
    canAssign: boolean;
  }
> = {
  AVAILABLE: {
    label: "Available",
    icon: CheckCircle2,
    color: "text-green-600",
    canAssign: false,
  },
  CLEANING: {
    label: "Cleaning",
    icon: Clock,
    color: "text-blue-600",
    canAssign: true,
  },
  OCCUPIED: {
    label: "Occupied",
    icon: AlertTriangle,
    color: "text-yellow-600",
    canAssign: false,
  },
  MAINTENANCE: {
    label: "Maintenance",
    icon: Wrench,
    color: "text-orange-600",
    canAssign: true,
  },
  OUT_OF_ORDER: {
    label: "Out of Order",
    icon: AlertTriangle,
    color: "text-red-600",
    canAssign: false,
  },
};

export function CreateTaskModal({ onClose, onSuccess }: CreateTaskModalProps) {
  // ── Auth Store ────────────────────────────────────────────
  // user = { userId, name, email } — no role here
  // activeOrg = { id, name, role, department, ... } — role lives here
  const { user, getActiveOrganization } = useAuthStore();
  const activeOrg = getActiveOrganization();

  // ── Housekeeping Store ────────────────────────────────────
  const { createTask, batchCreateTasks, isLoading, error, clearError } =
    useHousekeepingStore();

  // ── Room Store ────────────────────────────────────────────
  const { rooms, isLoading: roomsLoading, fetchRooms } = useRoomStore();

  // ── Local State ───────────────────────────────────────────
  const [mode, setMode] = useState<Mode>("single");

  // Staff members fetched from organizationService
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [membersError, setMembersError] = useState<string | null>(null);

  // Form fields
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [selectedRoomIds, setSelectedRoomIds] = useState<string[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [scheduledAt, setScheduledAt] = useState(
    new Date().toISOString().slice(0, 16),
  );
  const [notes, setNotes] = useState("");
  const [roomSearch, setRoomSearch] = useState("");
  const [staffSearch, setStaffSearch] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  // ── Effects ───────────────────────────────────────────────
  useEffect(() => {
    clearError();
    // Fetch rooms from room store
    fetchRooms();
    // Fetch org members from organizationService
    if (activeOrg?.id) {
      loadMembers(activeOrg.id);
    }
  }, [activeOrg?.id]);

  // ── Load Members via organizationService ──────────────────
  // We get all members and filter to HOUSEKEEPING department
  // member.user = { userId, name, email } — same shape as useAuthStore user
  const loadMembers = async (orgId: string) => {
    setMembersLoading(true);
    setMembersError(null);
    try {
      const res = await organizationService.getMembers(orgId);
      // Filter to only HOUSEKEEPING staff
      // OrganizationMember has: membershipId, role, department, user { userId, name, email }
      const housekeepingStaff = res.members.filter(
        (m) => m.department === "HOUSEKEEPING" && m.role === "STAFF",
      );
      setMembers(housekeepingStaff);
    } catch {
      setMembersError("Failed to load staff members.");
    } finally {
      setMembersLoading(false);
    }
  };

  // ── Derived Data ──────────────────────────────────────────
  // Rooms that can receive a cleaning task
  const assignableRooms = rooms.filter(
    (r) => ROOM_STATUS_CONFIG[r.status]?.canAssign ?? false,
  );

  // Filter rooms by search query
  const filteredRooms = roomSearch.trim()
    ? assignableRooms.filter(
        (r) =>
          r.roomNumber.toLowerCase().includes(roomSearch.toLowerCase()) ||
          r.roomType?.name?.toLowerCase().includes(roomSearch.toLowerCase()),
      )
    : assignableRooms;

  // Group rooms by floor for display
  const floorGroups = filteredRooms.reduce(
    (acc, room) => {
      const f = room.floor;
      if (!acc[f]) acc[f] = [];
      acc[f].push(room);
      return acc;
    },
    {} as Record<number, Room[]>,
  );

  // Filter staff by search query
  // member.user.name comes from the user object (same as useAuthStore user shape)
  const filteredMembers = staffSearch.trim()
    ? members.filter(
        (m) =>
          m.user.name.toLowerCase().includes(staffSearch.toLowerCase()) ||
          m.user.email.toLowerCase().includes(staffSearch.toLowerCase()),
      )
    : members;

  // Find selected objects for summary display
  const selectedMember = members.find((m) => m.user.userId === selectedUserId);
  const selectedRoom = rooms.find((r) => r.id === selectedRoomId);

  const isDataLoading = roomsLoading || membersLoading;

  // ── Handlers ──────────────────────────────────────────────
  const toggleRoom = (roomId: string) => {
    setSelectedRoomIds((prev) =>
      prev.includes(roomId)
        ? prev.filter((id) => id !== roomId)
        : [...prev, roomId],
    );
  };

  const handleSelectAllRooms = (checked: boolean) => {
    setSelectedRoomIds(checked ? filteredRooms.map((r) => r.id) : []);
  };

  const handleModeSwitch = (newMode: Mode) => {
    setMode(newMode);
    setSelectedRoomId("");
    setSelectedRoomIds([]);
    setRoomSearch("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validate
    if (!selectedUserId) {
      setFormError("Please select a staff member.");
      return;
    }
    if (!scheduledAt) {
      setFormError("Please set a scheduled date and time.");
      return;
    }
    if (mode === "single" && !selectedRoomId) {
      setFormError("Please select a room.");
      return;
    }
    if (mode === "batch" && selectedRoomIds.length === 0) {
      setFormError("Please select at least one room.");
      return;
    }

    const isoDate = new Date(scheduledAt).toISOString();

    try {
      if (mode === "single") {
        // userId comes from member.user.userId
        // which has the same shape as useAuthStore's user.userId
        const payload: CreateHousekeepingTaskPayload = {
          roomId: selectedRoomId,
          userId: selectedUserId, // member.user.userId
          scheduledAt: isoDate,
          notes: notes.trim() || undefined,
        };
        await createTask(payload);
      } else {
        const payload: BatchCreateTasksPayload = {
          roomIds: selectedRoomIds,
          userId: selectedUserId, // member.user.userId
          scheduledAt: isoDate,
          notes: notes.trim() || undefined,
        };
        await batchCreateTasks(payload);
      }
      onSuccess();
    } catch {
      // Error handled by store
    }
  };

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Assign Housekeeping Task
            </h2>
            {/* activeOrg.name from getActiveOrganization() */}
            <p className="text-sm text-gray-400">
              {activeOrg?.name} · Create cleaning assignments
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* ── Mode Toggle ── */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 shrink-0">
          <div className="flex rounded-lg border border-gray-200 overflow-hidden bg-white w-fit">
            {(["single", "batch"] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => handleModeSwitch(m)}
                className={`px-5 py-2 text-sm font-medium transition-colors ${
                  mode === m
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {m === "single" ? "Single Room" : "Multiple Rooms"}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-1.5">
            {mode === "single"
              ? "Assign one staff member to clean a single room"
              : "Assign one staff member to clean multiple rooms"}
          </p>
        </div>

        {/* ── Form Body ── */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isDataLoading ? (
            <div className="flex flex-col items-center justify-center h-52 gap-3">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-sm text-gray-400">
                Loading rooms and staff...
              </p>
            </div>
          ) : (
            <form
              id="createTaskForm"
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              {/* ── Error Banner ── */}
              {(formError || error || membersError) && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">
                    {formError || error || membersError}
                  </p>
                </div>
              )}

              {/* ── Room Selection ── */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                    <BedDouble className="w-4 h-4 text-gray-400" />
                    {mode === "single" ? "Select Room" : "Select Rooms"}
                    <span className="text-red-500">*</span>
                  </label>

                  {mode === "batch" && selectedRoomIds.length > 0 && (
                    <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                      {selectedRoomIds.length} room
                      {selectedRoomIds.length !== 1 ? "s" : ""} selected
                    </span>
                  )}
                </div>

                {assignableRooms.length === 0 ? (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="w-4 h-4 text-yellow-600" />
                      <p className="text-sm font-medium text-yellow-700">
                        No assignable rooms
                      </p>
                    </div>
                    <p className="text-xs text-yellow-600">
                      Rooms must be AVAILABLE or CLEANING to assign a task.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Room search */}
                    <div className="relative mb-2">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search by room number or type..."
                        value={roomSearch}
                        onChange={(e) => setRoomSearch(e.target.value)}
                        className="w-full pl-8 pr-8 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {roomSearch && (
                        <button
                          type="button"
                          onClick={() => setRoomSearch("")}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2"
                        >
                          <X className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600" />
                        </button>
                      )}
                    </div>

                    {/* ── Single Mode: Radio list ── */}
                    {mode === "single" ? (
                      <div className="border border-gray-200 rounded-xl overflow-hidden max-h-52 overflow-y-auto">
                        {filteredRooms.length === 0 ? (
                          <p className="text-sm text-gray-400 text-center py-8">
                            No rooms match your search
                          </p>
                        ) : (
                          Object.entries(floorGroups)
                            .sort(([a], [b]) => Number(a) - Number(b))
                            .map(([floor, floorRooms]) => (
                              <div key={floor}>
                                <div className="px-3 py-1.5 bg-gray-50 border-b border-gray-100 sticky top-0">
                                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                    Floor {floor}
                                  </span>
                                </div>

                                {floorRooms.map((room) => {
                                  const cfg = ROOM_STATUS_CONFIG[room.status];
                                  const StatusIcon = cfg?.icon;
                                  const isSelected = selectedRoomId === room.id;

                                  return (
                                    <button
                                      key={room.id}
                                      type="button"
                                      onClick={() => setSelectedRoomId(room.id)}
                                      className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors border-b border-gray-50 last:border-0 ${
                                        isSelected
                                          ? "bg-blue-50"
                                          : "hover:bg-gray-50"
                                      }`}
                                    >
                                      <div className="flex items-center gap-3">
                                        <div
                                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                                            isSelected
                                              ? "border-blue-600 bg-blue-600"
                                              : "border-gray-300"
                                          }`}
                                        >
                                          {isSelected && (
                                            <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                          )}
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium text-gray-800">
                                            Room {room.roomNumber}
                                          </p>
                                          <p className="text-xs text-gray-400">
                                            {room.roomType?.name} · Floor{" "}
                                            {room.floor}
                                          </p>
                                        </div>
                                      </div>
                                      {StatusIcon && cfg && (
                                        <div
                                          className={`flex items-center gap-1 text-xs font-medium ${cfg.color}`}
                                        >
                                          <StatusIcon className="w-3.5 h-3.5" />
                                          {cfg.label}
                                        </div>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            ))
                        )}
                      </div>
                    ) : (
                      // ── Batch Mode: Checkbox list ──
                      <div className="border border-gray-200 rounded-xl overflow-hidden max-h-52 overflow-y-auto">
                        {/* Select All */}
                        <label className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors sticky top-0">
                          <input
                            type="checkbox"
                            checked={
                              filteredRooms.length > 0 &&
                              selectedRoomIds.length === filteredRooms.length
                            }
                            onChange={(e) =>
                              handleSelectAllRooms(e.target.checked)
                            }
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                          <span className="text-xs font-semibold text-gray-600">
                            Select All ({filteredRooms.length} rooms)
                          </span>
                        </label>

                        {filteredRooms.length === 0 ? (
                          <p className="text-sm text-gray-400 text-center py-8">
                            No rooms match your search
                          </p>
                        ) : (
                          Object.entries(floorGroups)
                            .sort(([a], [b]) => Number(a) - Number(b))
                            .map(([floor, floorRooms]) => (
                              <div key={floor}>
                                <div className="px-3 py-1.5 bg-gray-50 border-y border-gray-100">
                                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                    Floor {floor}
                                  </span>
                                </div>

                                {floorRooms.map((room) => {
                                  const cfg = ROOM_STATUS_CONFIG[room.status];
                                  const StatusIcon = cfg?.icon;
                                  const isChecked = selectedRoomIds.includes(
                                    room.id,
                                  );

                                  return (
                                    <label
                                      key={room.id}
                                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-gray-50 last:border-0 ${
                                        isChecked
                                          ? "bg-blue-50"
                                          : "hover:bg-gray-50"
                                      }`}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => toggleRoom(room.id)}
                                        className="w-4 h-4 text-blue-600 rounded shrink-0"
                                      />
                                      <div className="flex-1 flex items-center justify-between min-w-0">
                                        <div className="min-w-0">
                                          <p className="text-sm font-medium text-gray-800 truncate">
                                            Room {room.roomNumber}
                                          </p>
                                          <p className="text-xs text-gray-400 truncate">
                                            {room.roomType?.name} · Floor{" "}
                                            {room.floor}
                                          </p>
                                        </div>
                                        {StatusIcon && cfg && (
                                          <div
                                            className={`flex items-center gap-1 text-xs font-medium ml-2 shrink-0 ${cfg.color}`}
                                          >
                                            <StatusIcon className="w-3.5 h-3.5" />
                                            {cfg.label}
                                          </div>
                                        )}
                                      </div>
                                    </label>
                                  );
                                })}
                              </div>
                            ))
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* ── Staff Selection ── */}
              <div>
                <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-gray-400" />
                  Assign To <span className="text-red-500">*</span>
                </label>

                {members.length === 0 ? (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="w-4 h-4 text-yellow-600" />
                      <p className="text-sm font-medium text-yellow-700">
                        No housekeeping staff found
                      </p>
                    </div>
                    <p className="text-xs text-yellow-600">
                      Add staff members with the HOUSEKEEPING department.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Staff search */}
                    <div className="relative mb-2">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search staff by name or email..."
                        value={staffSearch}
                        onChange={(e) => setStaffSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-0.5">
                      {filteredMembers.length === 0 ? (
                        <p className="text-sm text-gray-400 col-span-2 text-center py-6">
                          No staff match your search
                        </p>
                      ) : (
                        filteredMembers.map((member) => {
                          // member.user has { userId, name, email, createdAt }
                          // same shape as useAuthStore user object
                          const isSelected =
                            selectedUserId === member.user.userId;

                          // Highlight the currently logged-in user
                          const isCurrentUser =
                            user?.userId === member.user.userId;

                          return (
                            <label
                              key={member.membershipId}
                              className={`flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all ${
                                isSelected
                                  ? "border-blue-500 bg-blue-50 shadow-sm"
                                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              <input
                                type="radio"
                                name="staffMember"
                                // userId from member.user (same as useAuthStore user.userId)
                                value={member.user.userId}
                                checked={isSelected}
                                onChange={() =>
                                  setSelectedUserId(member.user.userId)
                                }
                                className="sr-only"
                              />

                              {/* Avatar — first letter of member.user.name */}
                              <div
                                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-sm font-bold ${
                                  isSelected
                                    ? "bg-blue-200 text-blue-700"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {member.user.name.charAt(0).toUpperCase()}
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {/* member.user.name */}
                                  <p className="text-sm font-medium text-gray-800 truncate">
                                    {member.user.name}
                                  </p>
                                  {/* Badge if this is the currently logged-in user */}
                                  {isCurrentUser && (
                                    <span className="text-xs bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full font-medium shrink-0">
                                      You
                                    </span>
                                  )}
                                </div>

                                {/* Role badge from member.role (not user.role) */}
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span
                                    className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                                      member.role === "OWNER"
                                        ? "bg-purple-100 text-purple-600"
                                        : member.role === "ADMIN"
                                          ? "bg-blue-100 text-blue-600"
                                          : "bg-gray-100 text-gray-500"
                                    }`}
                                  >
                                    {member.role}
                                  </span>
                                  {member.department && (
                                    <span className="text-xs text-gray-400">
                                      {member.department}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {isSelected && (
                                <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
                                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                </div>
                              )}
                            </label>
                          );
                        })
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* ── Schedule ── */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scheduled Date & Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  required
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* ── Notes ── */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes{" "}
                  <span className="text-xs text-gray-400 font-normal">
                    (optional)
                  </span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Special instructions, priority items, guest requests..."
                  rows={3}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </form>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between shrink-0">
          {/* Assignment summary */}
          <div className="text-sm text-gray-500 min-w-0 mr-4 truncate">
            {selectedMember && (
              <div className="flex items-center gap-1.5 truncate">
                <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-blue-700">
                    {/* member.user.name initial */}
                    {selectedMember.user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="truncate text-xs">
                  <strong className="text-gray-700">
                    {selectedMember.user.name}
                  </strong>
                  {mode === "single" && selectedRoom && (
                    <>
                      {" → "}
                      <strong className="text-gray-700">
                        Room {selectedRoom.roomNumber}
                      </strong>
                    </>
                  )}
                  {mode === "batch" && selectedRoomIds.length > 0 && (
                    <>
                      {" → "}
                      <strong className="text-gray-700">
                        {selectedRoomIds.length} room
                        {selectedRoomIds.length !== 1 ? "s" : ""}
                      </strong>
                    </>
                  )}
                </span>
              </div>
            )}
          </div>

          <div className="flex gap-3 shrink-0">
            <button
              onClick={onClose}
              type="button"
              className="px-4 py-2 text-sm border border-gray-200 text-gray-600 rounded-xl hover:bg-white transition-colors"
            >
              Cancel
            </button>
            <button
              form="createTaskForm"
              type="submit"
              disabled={
                isLoading || isDataLoading || assignableRooms.length === 0
              }
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              {mode === "single"
                ? "Assign Task"
                : `Assign ${selectedRoomIds.length > 0 ? `${selectedRoomIds.length} ` : ""}Task${
                    selectedRoomIds.length !== 1 ? "s" : ""
                  }`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
