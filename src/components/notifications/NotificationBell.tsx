// src/components/notifications/NotificationBell.tsx

import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Bell, Check, CheckCheck, Trash2, Filter, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useNotificationStore } from "@/store/notification/useNotificationStore";
import { useAuthStore } from "@/store/useAuthStore";
import type {
  Notification,
  NotificationType,
} from "@/types/notification-types";
import { NOTIFICATION_CONFIG } from "@/types/notification-types";

// ─── Navigation map based on referenceType ──────────
function getNavigationPath(notification: Notification): string | null {
  if (!notification.referenceId) return null;

  switch (notification.referenceType) {
    case "HOUSEKEEPING":
      return `/housekeeping/tasks?highlight=${notification.referenceId}`;
    default:
      return null;
  }
}

// ─── Notification item component ────────────────────
function NotificationItem({
  notification,
  onRead,
  onRemove,
  onNavigate,
}: {
  notification: Notification;
  onRead: (id: string) => void;
  onRemove: (id: string) => void;
  onNavigate: (notification: Notification) => void;
}) {
  const config =
    NOTIFICATION_CONFIG[notification.type] ?? NOTIFICATION_CONFIG.SYSTEM;

  return (
    <div
      className={cn(
        "group flex cursor-pointer items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/50",
        !notification.isRead && "bg-primary/[0.03]",
      )}
      onClick={() => onNavigate(notification)}
    >
      {/* Unread indicator + type icon */}
      <div className="mt-0.5 flex flex-col items-center gap-1.5">
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm",
            config.bgColor,
          )}
        >
          {config.emoji}
        </div>
        {!notification.isRead && (
          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-sm leading-snug",
            !notification.isRead ? "font-semibold" : "font-medium",
          )}
        >
          {notification.title}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {notification.message}
        </p>
        <p className="mt-1 text-[11px] text-muted-foreground/60">
          {formatDistanceToNow(new Date(notification.createdAt), {
            addSuffix: true,
          })}
        </p>
      </div>

      {/* Hover actions */}
      <div className="flex shrink-0 flex-col gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        {!notification.isRead && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            title="Mark as read"
            onClick={(e) => {
              e.stopPropagation();
              onRead(notification.id);
            }}
          >
            <Check className="h-3 w-3" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-destructive hover:text-destructive"
          title="Delete"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(notification.id);
          }}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

// ─── Main component ─────────────────────────────────
export function NotificationBell() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>("ALL");

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const activeOrgId = useAuthStore((s) => s.activeOrganizationId);

  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    startPolling,
    stopPolling,
  } = useNotificationStore();

  // Start polling when authenticated and org is selected
  useEffect(() => {
    if (isAuthenticated && activeOrgId) {
      startPolling(30_000);
    }
    return () => stopPolling();
  }, [isAuthenticated, activeOrgId, startPolling, stopPolling]);

  // Re-fetch when org changes
  useEffect(() => {
    if (isAuthenticated && activeOrgId) {
      fetchUnreadCount();
    }
  }, [activeOrgId, isAuthenticated, fetchUnreadCount]);

  // Fetch full list when popover opens
  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open, fetchNotifications]);

  const handleNavigate = useCallback(
    (notification: Notification) => {
      if (!notification.isRead) {
        markAsRead(notification.id);
      }

      const path = getNavigationPath(notification);
      if (path) {
        navigate(path);
        setOpen(false);
      }
    },
    [markAsRead, navigate],
  );

  const handleMarkAllRead = useCallback(() => {
    markAllAsRead();
  }, [markAllAsRead]);

  // Client-side type filter
  const filteredNotifications =
    filterType === "ALL"
      ? notifications
      : notifications.filter((n) => n.type === filterType);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full p-0 text-[10px] font-bold"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-[400px] p-0" sideOffset={8}>
        {/* ── Header ──────────────────────────────── */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold">Notifications</h4>
            {unreadCount > 0 && (
              <Badge
                variant="secondary"
                className="h-5 rounded-full px-2 text-[10px]"
              >
                {unreadCount} new
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1 text-xs"
                onClick={handleMarkAllRead}
              >
                <CheckCheck className="h-3 w-3" />
                Read all
              </Button>
            )}
          </div>
        </div>

        {/* ── Filter bar ──────────────────────────── */}
        <div className="flex items-center gap-2 border-b px-4 py-2">
          <Filter className="h-3 w-3 text-muted-foreground" />
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="h-7 w-auto min-w-[120px] border-0 bg-transparent px-2 text-xs shadow-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value="TASK_ASSIGNED">🆕 Assigned</SelectItem>
              <SelectItem value="TASK_REASSIGNED">🔄 Reassigned</SelectItem>
              <SelectItem value="TASK_COMPLETED">✅ Completed</SelectItem>
              <SelectItem value="TASK_INSPECTED">🏅 Inspected</SelectItem>
              <SelectItem value="TASK_REJECTED">❌ Rejected</SelectItem>
              <SelectItem value="SYSTEM">📌 System</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* ── List ─────────────────────────────────── */}
        <ScrollArea className="max-h-[400px]">
          {isLoading && notifications.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Bell className="h-5 w-5 text-muted-foreground/50" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                {filterType === "ALL"
                  ? "No notifications yet"
                  : "No notifications of this type"}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground/60">
                {filterType === "ALL"
                  ? "You'll be notified about task assignments and updates."
                  : "Try selecting a different filter."}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredNotifications.map((n) => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  onRead={markAsRead}
                  onRemove={removeNotification}
                  onNavigate={handleNavigate}
                />
              ))}
            </div>
          )}
        </ScrollArea>

        {/* ── Footer ───────────────────────────────── */}
        {notifications.length > 0 && (
          <>
            <Separator />
            <div className="p-2">
              <Button
                variant="ghost"
                className="h-8 w-full text-xs text-muted-foreground"
                onClick={() => {
                  navigate("/notifications");
                  setOpen(false);
                }}
              >
                View all notifications
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
