// src/lib/autoAssignEngine.ts
import type {
  StaffWorkload,
  AutoAssignSuggestion,
  RoomHousekeepingStatus,
  TaskPriority,
  CleaningType,
} from "@/types/room-housekeeping.types";
import type { HousekeepingTask } from "@/types/houseKeeping-types";
import type { OrganizationMember } from "@/services/organizationService";

// ── Priority weights ───────────────────────────────────────
const PRIORITY_ORDER: Record<TaskPriority, number> = {
  URGENT: 0,
  VIP: 1,
  HIGH: 2,
  NORMAL: 3,
  LOW: 4,
};

// ── Determine priority from room context ───────────────────
export function determinePriority(
  roomStatus: string,
  hasActiveGuest: boolean,
  guestName?: string | null,
): TaskPriority {
  if (guestName?.toLowerCase().includes("vip")) return "VIP";
  if (roomStatus === "OCCUPIED") return "HIGH";
  if (roomStatus === "CLEANING") return "NORMAL";
  return "LOW";
}

// ── Determine cleaning type from context ───────────────────
export function determineCleaningType(
  roomStatus: string,
  hasActiveGuest: boolean,
  isCheckout: boolean,
): CleaningType {
  if (isCheckout) return "DEPARTURE";
  if (roomStatus === "OCCUPIED") return "STANDARD";
  if (roomStatus === "CLEANING") return "STANDARD";
  return "STANDARD";
}

// ── Calculate staff workload score ─────────────────────────
// Lower score = better candidate for assignment
export function calculateStaffScore(
  member: OrganizationMember,
  tasks: HousekeepingTask[],
  targetFloor: number,
): StaffWorkload {
  const userId = member.user.userId;

  const activeTasks = tasks.filter(
    (t) =>
      t.userId === userId &&
      (t.status === "PENDING" || t.status === "IN_PROGRESS"),
  ).length;

  const completedToday = tasks.filter(
    (t) =>
      t.userId === userId &&
      (t.status === "COMPLETED" || t.status === "INSPECTED") &&
      t.completedAt &&
      new Date(t.completedAt).toDateString() === new Date().toDateString(),
  ).length;

  // Find what floor the staff is currently on
  const currentTask = tasks.find(
    (t) => t.userId === userId && t.status === "IN_PROGRESS",
  );
  const currentFloor = currentTask?.room?.floor ?? null;

  // Floor distance penalty (same floor = 0, different floor = distance)
  const floorDistance =
    currentFloor !== null ? Math.abs(currentFloor - targetFloor) : 3;

  // Score formula:
  // activeTasks * 10 (workload penalty)
  // + floorDistance * 5 (travel penalty)
  // - completedToday * 2 (experience bonus, staff doing well get more)
  const score = activeTasks * 10 + floorDistance * 5 - completedToday * 2;

  return {
    userId,
    name: member.user.name,
    department: member.department ?? null,
    jobTitle: member.jobTitle ?? null,
    activeTasks,
    completedToday,
    currentFloor,
    isAvailable: activeTasks < 5, // max 5 concurrent tasks
    score: Math.max(0, score),
  };
}

// ── Auto-assign rooms to staff ─────────────────────────────
export function autoAssignRooms(
  rooms: RoomHousekeepingStatus[],
  members: OrganizationMember[],
  existingTasks: HousekeepingTask[],
  scheduledAt: string,
): AutoAssignSuggestion[] {
  // Only rooms that need cleaning and don't have active tasks
  const roomsToAssign = rooms
    .filter((r) => r.needsCleaning && !r.hasActiveTask)
    .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);

  if (roomsToAssign.length === 0 || members.length === 0) return [];

  const suggestions: AutoAssignSuggestion[] = [];

  // Track task count per staff during assignment
  // so we don't over-assign during this batch
  const batchTaskCount: Record<string, number> = {};
  members.forEach((m) => (batchTaskCount[m.user.userId] = 0));

  for (const room of roomsToAssign) {
    // Calculate workload scores for all staff for this room's floor
    const staffScores = members
      .map((member) => {
        const workload = calculateStaffScore(member, existingTasks, room.floor);
        // Add batch penalty so we don't assign all to one person
        const batchPenalty = (batchTaskCount[member.user.userId] ?? 0) * 8;
        return { ...workload, score: workload.score + batchPenalty, member };
      })
      .filter((s) => s.isAvailable)
      .sort((a, b) => a.score - b.score);

    if (staffScores.length === 0) continue;

    const best = staffScores[0];

    // Generate human-readable reason
    const reason = generateAssignmentReason(best, room);

    suggestions.push({
      roomId: room.roomId,
      roomNumber: room.roomNumber,
      floor: room.floor,
      priority: room.priority,
      cleaningType: room.cleaningType,
      reason,
      suggestedUserId: best.userId,
      suggestedUserName: best.name,
      scheduledAt,
    });

    batchTaskCount[best.userId] = (batchTaskCount[best.userId] ?? 0) + 1;
  }

  return suggestions;
}

function generateAssignmentReason(
  staff: StaffWorkload,
  room: RoomHousekeepingStatus,
): string {
  const parts: string[] = [];

  if (staff.activeTasks === 0) {
    parts.push("Available (no active tasks)");
  } else {
    parts.push(
      `${staff.activeTasks} active task${staff.activeTasks !== 1 ? "s" : ""}`,
    );
  }

  if (staff.currentFloor === room.floor) {
    parts.push("already on this floor");
  } else if (
    staff.currentFloor !== null &&
    Math.abs(staff.currentFloor - room.floor) <= 1
  ) {
    parts.push("nearby floor");
  }

  if (staff.completedToday > 0) {
    parts.push(`${staff.completedToday} done today`);
  }

  return parts.join(" · ");
}
