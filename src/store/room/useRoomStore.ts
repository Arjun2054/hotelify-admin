import { roomService } from "@/services/room/roomService";
import type { AddRoomItemPayload, RoomItem } from "@/types/hotelItem-types";
import type {
  CreateRoomPayload,
  Room,
  RoomFilters,
  RoomStats,
  RoomStatus,
} from "@/types/room-types";
import { create } from "zustand";

interface RoomState {
  rooms: Room[];
  selectedRoom: Room | null;
  stats: RoomStats | null;
  floors: number[];
  filters: RoomFilters;
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  } | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchRooms: () => Promise<void>;
  fetchRoomById: (id: string) => Promise<void>;
  fetchStats: () => Promise<void>;
  fetchFloors: () => Promise<void>;
  createRoom: (data: CreateRoomPayload) => Promise<Room>;
  updateRoom: (id: string, data: Partial<CreateRoomPayload>) => Promise<Room>;
  updateRoomStatus: (id: string, status: RoomStatus) => Promise<Room>;

  addRoomItem: (roomId: string, data: AddRoomItemPayload) => Promise<RoomItem>;
  removeRoomItem: (roomItemId: string) => Promise<void>;
  deleteRoom: (id: string) => Promise<void>;
  setFilters: (filters: Partial<RoomFilters>) => void;
  setSelectedRoom: (room: Room | null) => void;
  clearError: () => void;
}

export const useRoomStore = create<RoomState>((set, get) => ({
  rooms: [],
  selectedRoom: null,
  stats: null,
  floors: [],
  filters: {},
  meta: null,
  isLoading: false,
  error: null,

  fetchRooms: async () => {
    set({ isLoading: true, error: null });
    try {
      const { filters } = get();
      const result = await roomService.getAll(filters);
      set({ rooms: result.data, meta: result.meta, isLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  fetchRoomById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const room = await roomService.getById(id);
      set({ selectedRoom: room, isLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  fetchStats: async () => {
    try {
      const stats = await roomService.getStats();
      set({ stats });
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  },

  fetchFloors: async () => {
    try {
      const floors = await roomService.getFloors();
      set({ floors });
    } catch (err) {
      console.error("Failed to fetch floors:", err);
    }
  },

  createRoom: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const newRoom = await roomService.create(data);
      set((state) => ({
        rooms: [...state.rooms, newRoom],
        isLoading: false,
      }));
      // Refresh stats
      get().fetchStats();
      return newRoom;
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
      throw err;
    }
  },

  updateRoom: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await roomService.update(id, data);
      set((state) => ({
        rooms: state.rooms.map((r) => (r.id === id ? updated : r)),
        selectedRoom:
          state.selectedRoom?.id === id ? updated : state.selectedRoom,
        isLoading: false,
      }));
      return updated;
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
      throw err;
    }
  },

  updateRoomStatus: async (id, status) => {
    try {
      const updated = await roomService.updateStatus(id, status);
      set((state) => ({
        rooms: state.rooms.map((r) => (r.id === id ? updated : r)),
        selectedRoom:
          state.selectedRoom?.id === id ? updated : state.selectedRoom,
      }));
      get().fetchStats();
      return updated;
    } catch (err) {
      set({ error: (err as Error).message });
      throw err;
    }
  },

  deleteRoom: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await roomService.delete(id);
      set((state) => ({
        rooms: state.rooms.filter((r) => r.id !== id),
        selectedRoom: state.selectedRoom?.id === id ? null : state.selectedRoom,
        isLoading: false,
      }));
      get().fetchStats();
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
      throw err;
    }
  },

  addRoomItem: async (roomId, data) => {
    set({ isLoading: true, error: null });
    try {
      const item = await roomService.addRoomItem(roomId, data);
      // Refresh the selected room to get updated items list
      if (get().selectedRoom?.id === roomId) {
        await get().fetchRoomById(roomId);
      }
      get().fetchStats();
      set({ isLoading: false });
      return item;
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
      throw err;
    }
  },

  removeRoomItem: async (roomItemId) => {
    set({ isLoading: true, error: null });
    try {
      await roomService.removeRoomItem(roomItemId);
      // Update selectedRoom by removing the item locally
      set((state) => ({
        selectedRoom: state.selectedRoom
          ? {
              ...state.selectedRoom,
              roomItems: (state.selectedRoom as any).roomItems?.filter(
                (i: any) => i.id !== roomItemId,
              ),
            }
          : null,
        isLoading: false,
      }));
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
      throw err;
    }
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
  },

  setSelectedRoom: (room) => set({ selectedRoom: room }),
  clearError: () => set({ error: null }),
}));
