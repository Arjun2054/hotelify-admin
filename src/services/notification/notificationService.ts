// src/services/notification/notificationService.ts

import adminApi from "@/lib/config";
import { authService } from "../authService";
import type {
  Notification,
  NotificationMeta,
  NotificationFilters,
} from "@/types/notification-types";

class NotificationApiService {
  private baseUrl = "/notifications";

  private getHeaders() {
    const orgId = authService.getActiveOrganizationId();
    if (!orgId) throw new Error("No active organization");
    return { "X-Organization-Id": orgId };
  }

  async getAll(
    page = 1,
    pageSize = 20,
    filters: NotificationFilters = {},
  ): Promise<{ data: Notification[]; meta: NotificationMeta }> {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
    });

    if (filters.unreadOnly) params.set("unreadOnly", "true");
    if (filters.type) params.set("type", filters.type);

    const res = await adminApi.get(`${this.baseUrl}?${params.toString()}`, {
      headers: this.getHeaders(),
    });

    return { data: res.data.data, meta: res.data.meta };
  }

  async getUnreadCount(): Promise<number> {
    const res = await adminApi.get(`${this.baseUrl}/unread-count`, {
      headers: this.getHeaders(),
    });
    return res.data.data.count;
  }

  async markAsRead(id: string): Promise<void> {
    await adminApi.patch(
      `${this.baseUrl}/${id}/read`,
      {},
      { headers: this.getHeaders() },
    );
  }

  async markAllAsRead(): Promise<void> {
    await adminApi.patch(
      `${this.baseUrl}/read-all`,
      {},
      { headers: this.getHeaders() },
    );
  }

  async remove(id: string): Promise<void> {
    await adminApi.delete(`${this.baseUrl}/${id}`, {
      headers: this.getHeaders(),
    });
  }
}

export const notificationApiService = new NotificationApiService();
