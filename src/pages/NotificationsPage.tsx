import { useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Notification } from "@/types/notification-types";
import { NOTIFICATION_CONFIG } from "@/types/notification-types";
import { useNotificationStore } from "@/store/notification/useNotificationStore";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

function getNavigationPath(notification: Notification): string | null {
  if (!notification.referenceId) return null;
  switch (notification.referenceType) {
    case "HOUSEKEEPING":
      return `/housekeeping/tasks?highlight=${notification.referenceId}`;
    default:
      return null;
  }
}

const NotificationsPage = () => {
  const navigate = useNavigate();

  const {
    notifications,
    unreadCount,
    meta,
    filters,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    removeNotification,
    setFilters,
  } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
  }, [filters, fetchNotifications]);

  const handleClick = (notification: Notification) => {
    if (!notification.isRead) markAsRead(notification.id);
    const path = getNavigationPath(notification);
    if (path) navigate(path);
  };
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6 sm:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
            <p className="text-sm text-muted-foreground">
              {unreadCount > 0
                ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
                : "All caught up!"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={filters.type ?? "ALL"}
            onValueChange={(v) =>
              setFilters({
                type: v === "ALL" ? undefined : (v as any),
              })
            }
          >
            <SelectTrigger className="h-9 w-[160px]">
              <SelectValue placeholder="All types" />
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
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={markAllAsRead}
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </Button>
          )}
        </div>
      </div>
      {/* List */}
      {isLoading && notifications.length === 0 ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <Bell className="h-6 w-6 text-muted-foreground/50" />
            </div>
            <h3 className="text-base font-semibold">No notifications</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              You'll be notified about task assignments and updates.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const config =
              NOTIFICATION_CONFIG[n.type] ?? NOTIFICATION_CONFIG.SYSTEM;
            const navPath = getNavigationPath(n);

            return (
              <Card
                key={n.id}
                className={cn(
                  "group cursor-pointer transition-all hover:shadow-sm",
                  !n.isRead && "border-primary/20 bg-primary/2",
                  navPath && "hover:border-primary/30",
                )}
                onClick={() => handleClick(n)}
              >
                <CardContent className="flex items-start gap-4 p-4">
                  {/* Type icon */}
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg",
                      config.bgColor,
                    )}
                  >
                    {config.emoji}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={cn(
                          "text-sm leading-snug",
                          !n.isRead
                            ? "font-semibold"
                            : "font-medium text-foreground/80",
                        )}
                      >
                        {n.title}
                      </p>
                      {!n.isRead && (
                        <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                      )}
                    </div>

                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                      {n.message}
                    </p>

                    <div className="mt-2 flex items-center gap-3">
                      <span className="text-xs text-muted-foreground/60">
                        {formatDistanceToNow(new Date(n.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                      <Badge
                        variant="secondary"
                        className="h-5 px-2 text-[10px]"
                      >
                        {n.type.replace(/_/g, " ")}
                      </Badge>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    {!n.isRead && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="Mark as read"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(n.id);
                        }}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      title="Delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNotification(n.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 text-sm text-muted-foreground">
              <span>
                Showing {notifications.length} of {meta.total}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={meta.page <= 1}
                  onClick={() => fetchNotifications(meta.page - 1)}
                >
                  Previous
                </Button>
                <span className="flex items-center px-2">
                  Page {meta.page} of {meta.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={meta.page >= meta.totalPages}
                  onClick={() => fetchNotifications(meta.page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
