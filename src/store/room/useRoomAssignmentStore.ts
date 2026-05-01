import { roomAssignmentService } from "@/services/room/roomAssignmentService";
import type { CheckInPayload, RoomAssignment } from "@/types/room-types";
import { create } from "zustand";

interface RoomAssignmentState {
  activeAssignments: (RoomAssignment & { room?: any })[];
  history: RoomAssignment[];
  historyMeta: { total: number; page: number; totalPages: number } | null;
  isLoading: boolean;
  error: string | null;

  fetchActive: () => Promise<void>;
  fetchHistory: (roomId: string, page?: number) => Promise<void>;
  checkIn: (roomId: string, data: CheckInPayload) => Promise<RoomAssignment>;
  checkOut: (assignmentId: string, notes?: string) => Promise<void>;
  clearError: () => void;
}

export const useRoomAssignmentStore = create<RoomAssignmentState>((set) => ({
  activeAssignments: [],
  history: [],
  historyMeta: null,
  isLoading: false,
  error: null,

  fetchActive: async () => {
    set({ isLoading: true });
    try {
      const data = await roomAssignmentService.getActive();
      set({ activeAssignments: data, isLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  fetchHistory: async (roomId, page = 1) => {
    set({ isLoading: true });
    try {
      const result = await roomAssignmentService.getHistory(roomId, page);
      set({
        history: result.data,
        historyMeta: result.meta as any,
        isLoading: false,
      });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  checkIn: async (roomId, data) => {
    set({ isLoading: true, error: null });
    try {
      const assignment = await roomAssignmentService.checkIn(roomId, data);
      set({ isLoading: false });
      return assignment;
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
      throw err;
    }
  },

  checkOut: async (assignmentId, notes) => {
    set({ isLoading: true, error: null });
    try {
      await roomAssignmentService.checkOut(assignmentId, notes);
      set((state) => ({
        activeAssignments: state.activeAssignments.filter(
          (a) => a.id !== assignmentId,
        ),
        isLoading: false,
      }));
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
