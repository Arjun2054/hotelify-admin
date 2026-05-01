// src/store/notification/useNotificationStore.ts

import { create } from "zustand";
import { notificationApiService } from "@/services/notification/notificationService";
import type {
  Notification,
  NotificationFilters,
  NotificationMeta,
} from "@/types/notification-types";

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  meta: NotificationMeta | null;
  filters: NotificationFilters;
  isLoading: boolean;
  error: string | null;
  pollingInterval: ReturnType<typeof setInterval> | null;

  // Actions
  fetchNotifications: (page?: number) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  removeNotification: (id: string) => Promise<void>;
  setFilters: (filters: Partial<NotificationFilters>) => void;
  startPolling: (intervalMs?: number) => void;
  stopPolling: () => void;
  clearError: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  meta: null,
  filters: {},
  isLoading: false,
  error: null,
  pollingInterval: null,

  fetchNotifications: async (page = 1) => {
    set({ isLoading: true, error: null });
    try {
      const { filters } = get();
      const result = await notificationApiService.getAll(page, 20, filters);
      set({
        notifications: result.data,
        meta: result.meta,
        unreadCount: result.meta.unreadCount,
        isLoading: false,
      });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const count = await notificationApiService.getUnreadCount();
      set({ unreadCount: count });
    } catch {
      // Silent — polling failure is not critical
    }
  },

  markAsRead: async (id) => {
    try {
      await notificationApiService.markAsRead(id);
      set((s) => ({
        notifications: s.notifications.map((n) =>
          n.id === id ? { ...n, isRead: true } : n,
        ),
        unreadCount: Math.max(0, s.unreadCount - 1),
      }));
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  markAllAsRead: async () => {
    try {
      await notificationApiService.markAllAsRead();
      set((s) => ({
        notifications: s.notifications.map((n) => ({
          ...n,
          isRead: true,
        })),
        unreadCount: 0,
      }));
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  removeNotification: async (id) => {
    try {
      const notification = get().notifications.find((n) => n.id === id);
      await notificationApiService.remove(id);
      set((s) => ({
        notifications: s.notifications.filter((n) => n.id !== id),
        unreadCount:
          notification && !notification.isRead
            ? Math.max(0, s.unreadCount - 1)
            : s.unreadCount,
      }));
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  setFilters: (newFilters) => {
    set((s) => ({
      filters: { ...s.filters, ...newFilters },
    }));
  },

  startPolling: (intervalMs = 30_000) => {
    const existing = get().pollingInterval;
    if (existing) clearInterval(existing);

    // Fetch immediately
    get().fetchUnreadCount();

    const id = setInterval(() => {
      get().fetchUnreadCount();
    }, intervalMs);

    set({ pollingInterval: id });
  },

  stopPolling: () => {
    const id = get().pollingInterval;
    if (id) clearInterval(id);
    set({ pollingInterval: null });
  },

  clearError: () => set({ error: null }),
}));
