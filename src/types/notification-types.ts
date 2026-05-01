// src/types/notification-types.ts

export type NotificationType =
  | "TASK_ASSIGNED"
  | "TASK_REASSIGNED"
  | "TASK_REJECTED"
  | "TASK_COMPLETED"
  | "TASK_INSPECTED"
  | "SYSTEM";

export interface Notification {
  id: string;
  organizationId: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  referenceId?: string;
  referenceType?: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationMeta {
  total: number;
  unreadCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface NotificationFilters {
  unreadOnly?: boolean;
  type?: NotificationType;
}

// Icon and color config for each notification type
export const NOTIFICATION_CONFIG: Record<
  NotificationType,
  { emoji: string; color: string; bgColor: string }
> = {
  TASK_ASSIGNED: {
    emoji: "🆕",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/40",
  },
  TASK_REASSIGNED: {
    emoji: "🔄",
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-100 dark:bg-amber-900/40",
  },
  TASK_REJECTED: {
    emoji: "❌",
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-900/40",
  },
  TASK_COMPLETED: {
    emoji: "✅",
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/40",
  },
  TASK_INSPECTED: {
    emoji: "🏅",
    color: "text-violet-600 dark:text-violet-400",
    bgColor: "bg-violet-100 dark:bg-violet-900/40",
  },
  SYSTEM: {
    emoji: "📌",
    color: "text-slate-600 dark:text-slate-400",
    bgColor: "bg-slate-100 dark:bg-slate-900/40",
  },
};
