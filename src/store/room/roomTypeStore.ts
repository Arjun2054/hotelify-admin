import { roomTypeService } from "@/services/room/roomTypeService";
import type { CreateRoomTypePayload, RoomType } from "@/types/room-types";
import { create } from "zustand";
interface RoomTypeState {
  roomTypes: RoomType[];
  selectedRoomType: RoomType | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchRoomTypes: () => Promise<void>;
  createRoomType: (data: CreateRoomTypePayload) => Promise<RoomType>;
  updateRoomType: (
    id: string,
    data: Partial<CreateRoomTypePayload>,
  ) => Promise<RoomType>;
  deleteRoomType: (id: string) => Promise<void>;
  setSelectedRoomType: (roomType: RoomType | null) => void;
  clearError: () => void;
}

export const useRoomTypeStore = create<RoomTypeState>((set, get) => ({
  roomTypes: [],
  selectedRoomType: null,
  isLoading: false,
  error: null,

  fetchRoomTypes: async () => {
    set({ isLoading: true, error: null });
    try {
      const roomTypes = await roomTypeService.getAll();
      set({ roomTypes, isLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  createRoomType: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const newType = await roomTypeService.create(data);
      set((state) => ({
        roomTypes: [...state.roomTypes, newType],
        isLoading: false,
      }));
      return newType;
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
      throw err;
    }
  },

  updateRoomType: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await roomTypeService.update(id, data);
      set((state) => ({
        roomTypes: state.roomTypes.map((rt) => (rt.id === id ? updated : rt)),
        selectedRoomType:
          state.selectedRoomType?.id === id ? updated : state.selectedRoomType,
        isLoading: false,
      }));
      return updated;
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
      throw err;
    }
  },

  deleteRoomType: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await roomTypeService.delete(id);
      set((state) => ({
        roomTypes: state.roomTypes.filter((rt) => rt.id !== id),
        selectedRoomType:
          state.selectedRoomType?.id === id ? null : state.selectedRoomType,
        isLoading: false,
      }));
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
      throw err;
    }
  },

  setSelectedRoomType: (roomType) => set({ selectedRoomType: roomType }),
  clearError: () => set({ error: null }),
}));
