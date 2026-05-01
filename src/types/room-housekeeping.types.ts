// src/types/room-housekeeping.types.ts

export type TaskPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT" | "VIP";
export type CleaningType =
  | "STANDARD"
  | "DEPARTURE"
  | "DEEP_CLEAN"
  | "VIP_ARRIVAL"
  | "INSPECTION_ONLY";

export interface StaffWorkload {
  userId: string;
  name: string;
  department: string | null;
  jobTitle: string | null;
  activeTasks: number;
  completedToday: number;
  currentFloor: number | null;
  isAvailable: boolean;
  score: number; // lower = better candidate
}

export interface AutoAssignSuggestion {
  roomId: string;
  roomNumber: string;
  floor: number;
  priority: TaskPriority;
  cleaningType: CleaningType;
  reason: string;
  suggestedUserId: string;
  suggestedUserName: string;
  scheduledAt: string;
}

export interface RoomHousekeepingStatus {
  roomId: string;
  roomNumber: string;
  floor: number;
  roomStatus: string;
  roomType: string;
  hasActiveTask: boolean;
  activeTask: {
    id: string;
    status: string;
    assignedTo: string;
    scheduledAt: string;
    priority?: TaskPriority;
  } | null;
  lastCleaned: string | null;
  currentGuest: string | null;
  priority: TaskPriority;
  cleaningType: CleaningType;
  needsCleaning: boolean;
}
