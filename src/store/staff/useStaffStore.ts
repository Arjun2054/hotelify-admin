// src/store/staff/useStaffStore.ts

import { create } from "zustand";
import type {
  StaffMember,
  CreateStaffPayload,
  UpdateStaffPayload,
  StaffStats,
  StaffActivity,
  StaffFilters,
} from "@/types/staff-types";
import { staffService } from "@/services/staff/staffService";

interface StaffState {
  members: StaffMember[];
  selectedMember: StaffMember | null;
  stats: StaffStats | null;
  activities: StaffActivity[];
  filters: StaffFilters;
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  } | null;
  isLoading: boolean;
  error: string | null;

  fetchMembers: (page?: number) => Promise<void>;
  fetchMemberById: (id: string) => Promise<void>;
  fetchStats: () => Promise<void>;
  fetchActivity: (memberId: string, page?: number) => Promise<void>;
  createMember: (data: CreateStaffPayload) => Promise<StaffMember>;
  updateMember: (id: string, data: UpdateStaffPayload) => Promise<StaffMember>;
  changePassword: (id: string, newPassword: string) => Promise<void>;
  removeMember: (id: string) => Promise<void>;
  setFilters: (filters: Partial<StaffFilters>) => void;
  setSelectedMember: (member: StaffMember | null) => void;
  clearError: () => void;
}

export const useStaffStore = create<StaffState>((set, get) => ({
  members: [],
  selectedMember: null,
  stats: null,
  activities: [],
  filters: {},
  meta: null,
  isLoading: false,
  error: null,

  fetchMembers: async (page = 1) => {
    set({ isLoading: true, error: null });
    try {
      const { filters } = get();
      const result = await staffService.getAll(filters, page);
      set({
        members: result.data,
        meta: result.meta,
        isLoading: false,
      });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  fetchMemberById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const member = await staffService.getById(id);
      set({ selectedMember: member, isLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  fetchStats: async () => {
    try {
      const stats = await staffService.getStats();
      set({ stats });
    } catch (err) {
      console.error("Failed to fetch staff stats:", err);
    }
  },

  fetchActivity: async (memberId, page = 1) => {
    try {
      const result = await staffService.getActivity(memberId, page);
      set({ activities: result.data });
    } catch (err) {
      console.error("Failed to fetch activity:", err);
    }
  },

  createMember: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const member = await staffService.create(data);
      set((s) => ({
        members: [...s.members, member],
        isLoading: false,
      }));
      get().fetchStats();
      return member;
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
      throw err;
    }
  },

  updateMember: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await staffService.update(id, data);
      set((s) => ({
        members: s.members.map((m) => (m.membershipId === id ? updated : m)),
        selectedMember:
          s.selectedMember?.membershipId === id ? updated : s.selectedMember,
        isLoading: false,
      }));
      get().fetchStats();
      return updated;
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
      throw err;
    }
  },

  changePassword: async (id, newPassword) => {
    set({ isLoading: true, error: null });
    try {
      await staffService.changePassword(id, newPassword);
      set({ isLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
      throw err;
    }
  },

  removeMember: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await staffService.remove(id);
      set((s) => ({
        members: s.members.filter((m) => m.membershipId !== id),
        selectedMember:
          s.selectedMember?.membershipId === id ? null : s.selectedMember,
        isLoading: false,
      }));
      get().fetchStats();
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
      throw err;
    }
  },

  setFilters: (newFilters) => {
    set((s) => {
      const merged = { ...s.filters };
      for (const [key, value] of Object.entries(newFilters)) {
        if (value === undefined || value === "") {
          delete (merged as any)[key];
        } else {
          (merged as any)[key] = value;
        }
      }
      return { filters: merged };
    });
  },

  setSelectedMember: (member) => set({ selectedMember: member }),
  clearError: () => set({ error: null }),
}));
