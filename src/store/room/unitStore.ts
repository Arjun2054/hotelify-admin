import { unitService } from "@/services/room/unitService";
import type { CreateUnitPayload, Unit } from "@/types/hotelItem-types";
import { create } from "zustand";

interface UnitState {
  units: Unit[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;

  fetchUnits: () => Promise<void>;
  createUnit: (data: CreateUnitPayload) => Promise<Unit>;
  updateUnit: (id: string, data: Partial<CreateUnitPayload>) => Promise<Unit>;
  deleteUnit: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useUnitStore = create<UnitState>()((set, get) => ({
  units: [],
  isLoading: false,
  isSubmitting: false,
  error: null,

  fetchUnits: async () => {
    set({ isLoading: true, error: null });
    try {
      const units = await unitService.getAll();
      set({ units, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
    }
  },

  createUnit: async (data) => {
    set({ isSubmitting: true, error: null });
    try {
      const unit = await unitService.create(data);
      set((state) => ({
        units: [...state.units, unit],
        isSubmitting: false,
        isLoading: false,
      }));
      return unit;
    } catch (error: any) {
      set({ isSubmitting: false, error: error.message, isLoading: false });
      throw error;
    }
  },

  updateUnit: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await unitService.update(id, data);

      set((s) => ({
        units: s.units.map((u) => (u.id === id ? updated : u)),
        isLoading: false,
      }));
      await get().fetchUnits();
      return updated;
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
      throw err;
    }
  },

  deleteUnit: async (id: string) => {
    set({ isSubmitting: true, error: null });
    try {
      await unitService.delete(id);
      set((state) => ({
        units: state.units.filter((unit) => unit.id !== id),
        isSubmitting: false,
      }));
    } catch (error: any) {
      set({ isSubmitting: false, error: error.message });
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
