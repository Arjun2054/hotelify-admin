import adminApi from "@/lib/config";
import type {
  DietaryTag,
  Menu,
  MenuCategory,
  MenuItem,
  MenuSection,
  PaginatedResponse,
} from "@/types/fnb.types";
import { authService } from "../authService";

export interface OrgFnbServiceEntry {
  // Static def fields
  type: string;
  defaultLabel: string;
  defaultIcon: string;
  defaultDescription: string;
  // Org-specific (null = not yet created by owner)
  orgService: {
    id: string;
    name: string;
    description: string | null;
    icon: string;
    status: "ACTIVE" | "INACTIVE" | "TEMPORARILY_CLOSED";
    isEnabled: boolean;
    config: Record<string, unknown> | null;
    enabledAt: string;
    disabledAt: string | null;
    menuCount: number;
    menus: { id: string; name: string; status: string }[];
  } | null;
  isCreated: boolean;
  isEnabled: boolean;
}

const base = "/fnb";
const orders = "/orders";
const kitchen1 = "/kitchen";

// ─── Module ──────────────────────────────────────────────────────────────────

export const fnbServiceApi = {
  getOrganizationId(): string {
    const orgId = authService.getActiveOrganizationId();
    if (!orgId) {
      throw new Error(
        "Organization context not found. Please select an organization.",
      );
    }
    return orgId;
  },

  getHeaders() {
    return {
      "X-Organization-Id": this.getOrganizationId(),
    };
  },

  list: () =>
    adminApi.get<{ data: OrgFnbServiceEntry[] }>(`${base}/services`, {
      headers: fnbServiceApi.getHeaders(),
    }),

  create: (data: { type: string; name?: string; description?: string }) =>
    adminApi.post<{ data: OrgFnbServiceEntry["orgService"] }>(
      `${base}/services`,
      data,
      { headers: fnbServiceApi.getHeaders() },
    ),

  bulkCreate: (services: { type: string; name?: string }[]) =>
    adminApi.post<{
      data: {
        created: OrgFnbServiceEntry["orgService"][];
        skipped: string[];
      };
    }>(
      `${base}/services/bulk`,
      { services },
      { headers: fnbServiceApi.getHeaders() },
    ),

  update: (
    serviceId: string,
    data: {
      name?: string;
      description?: string;
      isEnabled?: boolean;
      status?: string;
    },
  ) =>
    adminApi.patch<{ data: OrgFnbServiceEntry["orgService"] }>(
      `${base}/services/${serviceId}`,
      data,
      { headers: fnbServiceApi.getHeaders() },
    ),

  toggle: (serviceId: string) =>
    adminApi.post<{ data: OrgFnbServiceEntry["orgService"] }>(
      `${base}/services/${serviceId}/toggle`,
      {},
      { headers: fnbServiceApi.getHeaders() },
    ),

  remove: (serviceId: string) =>
    adminApi.delete(`${base}/services/${serviceId}`, {
      headers: fnbServiceApi.getHeaders(),
    }),
};

// ── Menus API ─────────────────────────────────────────────────────────────────

export const menuApi = {
  create: (data: Partial<Menu> & { fnbServiceIds?: string[] }) =>
    adminApi.post<{ data: Menu }>(`${base}/menus`, data, {
      headers: fnbServiceApi.getHeaders(),
    }),

  list: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }) =>
    adminApi.get<{ data: PaginatedResponse<Menu> }>(`${base}/menus`, {
      params,
      headers: fnbServiceApi.getHeaders(),
    }),

  getById: (menuId: string) =>
    adminApi.get<{ data: Menu }>(`${base}/menus/${menuId}`, {
      headers: fnbServiceApi.getHeaders(),
    }),

  update: (
    menuId: string,
    data: Partial<Menu> & { fnbServiceIds?: string[] },
  ) =>
    adminApi.patch<{ data: Menu }>(`${base}/menus/${menuId}`, data, {
      headers: fnbServiceApi.getHeaders(),
    }),

  delete: (menuId: string) =>
    adminApi.delete(`${base}/menus/${menuId}`, {
      headers: fnbServiceApi.getHeaders(),
    }),

  duplicate: (menuId: string) =>
    adminApi.post<{ data: Menu }>(
      `${base}/menus/${menuId}/duplicate`,
      {},
      { headers: fnbServiceApi.getHeaders() },
    ),
};

// ── Sections API ──────────────────────────────────────────────────────────────

export const sectionApi = {
  create: (
    menuId: string,
    data: { name: string; description?: string; displayOrder?: number },
  ) =>
    adminApi.post<{ data: MenuSection }>(
      `${base}/menus/${menuId}/sections`,
      data,
      { headers: fnbServiceApi.getHeaders() },
    ),

  list: (menuId: string) =>
    adminApi.get<{ data: MenuSection[] }>(`${base}/menus/${menuId}/sections`, {
      headers: fnbServiceApi.getHeaders(),
    }),

  update: (menuId: string, sectionId: string, data: Partial<MenuSection>) =>
    adminApi.patch<{ data: MenuSection }>(
      `${base}/menus/${menuId}/sections/${sectionId}`,
      data,
      { headers: fnbServiceApi.getHeaders() },
    ),

  delete: (menuId: string, sectionId: string) =>
    adminApi.delete(`${base}/menus/${menuId}/sections/${sectionId}`, {
      headers: fnbServiceApi.getHeaders(),
    }),
};

// ── Items API ─────────────────────────────────────────────────────────────────

export const menuItemApi = {
  create: (
    data: Partial<MenuItem> & { menuId: string; dietaryTagIds?: string[] },
  ) =>
    adminApi.post<{ data: MenuItem }>(`${base}/items`, data, {
      headers: fnbServiceApi.getHeaders(),
    }),

  /**
   * FIX: Use a union type for the response so normalisePaginatedResponse in
   * the store can detect the actual shape at runtime.
   *
   * The backend may return either:
   *   Shape A (double-nested): { data: { data: MenuItem[], pagination: {} } }
   *   Shape B (single-nested): { data: MenuItem[], pagination: {} }
   *
   * The store's normalisePaginatedResponse() handles both shapes correctly.
   */
  list: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    menuId?: string;
    categoryId?: string;
  }) =>
    adminApi.get<
      PaginatedResponse<MenuItem> | { data: PaginatedResponse<MenuItem> }
    >(`${base}/items`, { params, headers: fnbServiceApi.getHeaders() }),

  getById: (itemId: string) =>
    adminApi.get<{ data: MenuItem }>(`${base}/items/${itemId}`, {
      headers: fnbServiceApi.getHeaders(),
    }),

  update: (
    itemId: string,
    data: Partial<MenuItem> & { dietaryTagIds?: string[] },
  ) =>
    adminApi.patch<{ data: MenuItem }>(`${base}/items/${itemId}`, data, {
      headers: fnbServiceApi.getHeaders(),
    }),

  delete: (itemId: string) =>
    adminApi.delete(`${base}/items/${itemId}`, {
      headers: fnbServiceApi.getHeaders(),
    }),

  bulkUpdateStatus: (data: {
    itemIds: string[];
    status: "AVAILABLE" | "OUT_OF_STOCK" | "DISCONTINUED";
  }) =>
    adminApi.post(`${base}/items/bulk-status`, data, {
      headers: fnbServiceApi.getHeaders(),
    }),

  reorder: (items: { id: string; displayOrder: number }[]) =>
    adminApi.post(
      `${base}/items/reorder`,
      { items },
      { headers: fnbServiceApi.getHeaders() },
    ),
};

// ── Categories API ────────────────────────────────────────────────────────────

export const categoryApi = {
  create: (data: Partial<MenuCategory>) =>
    adminApi.post<{ data: MenuCategory }>(`${base}/categories`, data, {
      headers: fnbServiceApi.getHeaders(),
    }),

  list: (includeInactive?: boolean) =>
    adminApi.get<{ data: MenuCategory[] }>(`${base}/categories`, {
      params: { includeInactive },
      headers: fnbServiceApi.getHeaders(),
    }),

  update: (categoryId: string, data: Partial<MenuCategory>) =>
    adminApi.patch<{ data: MenuCategory }>(
      `${base}/categories/${categoryId}`,
      data,
      { headers: fnbServiceApi.getHeaders() },
    ),

  delete: (categoryId: string) =>
    adminApi.delete(`${base}/categories/${categoryId}`, {
      headers: fnbServiceApi.getHeaders(),
    }),
};

// ── Dietary Tags API ──────────────────────────────────────────────────────────

export const dietaryTagApi = {
  create: (data: Partial<DietaryTag>) =>
    adminApi.post<{ data: DietaryTag }>(`${base}/dietary-tags`, data, {
      headers: fnbServiceApi.getHeaders(),
    }),

  list: (includeInactive?: boolean) =>
    adminApi.get<{ data: DietaryTag[] }>(`${base}/dietary-tags`, {
      params: { includeInactive },
      headers: fnbServiceApi.getHeaders(),
    }),

  update: (tagId: string, data: Partial<DietaryTag>) =>
    adminApi.patch<{ data: DietaryTag }>(
      `${base}/dietary-tags/${tagId}`,
      data,
      { headers: fnbServiceApi.getHeaders() },
    ),

  delete: (tagId: string) =>
    adminApi.delete(`${base}/dietary-tags/${tagId}`, {
      headers: fnbServiceApi.getHeaders(),
    }),
};
// ---------- Order API ------------
export const orderApi = {
  getOrders: (params?: Record<string, unknown>) =>
    adminApi.get(`${orders}/orders`, {
      params,
      headers: fnbServiceApi.getHeaders(),
    }),

  getOrder: (id: string) =>
    adminApi.get(`${orders}/orders/${id}`, {
      headers: fnbServiceApi.getHeaders(),
    }),

  createOrder: (data: unknown) =>
    adminApi.post(`${orders}/orders/create`, data, {
      headers: fnbServiceApi.getHeaders(),
    }),

  updateOrderStatus: (id: string, data: unknown) =>
    adminApi.patch(`${orders}/orders/${id}/status`, data, {
      headers: fnbServiceApi.getHeaders(),
    }),

  sendToKitchen: (id: string) =>
    adminApi.post(`${orders}/orders/${id}/send-to-kitchen`, {
      headers: fnbServiceApi.getHeaders(),
    }),
  processPayment: (id: string, data: unknown) =>
    adminApi.post(`${orders}/orders/${id}/payment`, data, {
      headers: fnbServiceApi.getHeaders(),
    }),
  cancelOrder: (id: string, reason: string) =>
    adminApi.post(`${orders}/orders/${id}/cancel`, {
      reason,
      headers: fnbServiceApi.getHeaders(),
    }),

  getAnalytics: (params?: Record<string, unknown>) =>
    adminApi.get(`/${orders}/orders/analytics`, {
      params,
      headers: fnbServiceApi.getHeaders(),
    }),
};

// -----------------Kitchen API ------------------
export const kitchenApi = {
  getKDSDashboard: (stationId?: string) =>
    adminApi.get(`${kitchen1}/kitchen/dashboard`, {
      params: { stationId },
      headers: fnbServiceApi.getHeaders(),
    }),
  getTickets: (params?: Record<string, unknown>) =>
    adminApi.get(`${kitchen1}/kitchen/tickets`, {
      params,
      headers: fnbServiceApi.getHeaders(),
    }),

  updateTicketStatus: (id: string, data: unknown) =>
    adminApi.patch(`${kitchen1}/kitchen/tickets/${id}/status`, data, {
      headers: fnbServiceApi.getHeaders(),
    }),
  updateTicketItemStatus: (id: string, data: unknown) =>
    adminApi.patch(`${kitchen1}/kitchen/tickets/items/${id}/status`, data, {
      headers: fnbServiceApi.getHeaders(),
    }),
  getStations: () =>
    adminApi.get(`${kitchen1}/kitchen/stations`, {
      headers: fnbServiceApi.getHeaders(),
    }),
  createStation: (data: unknown) =>
    adminApi.post(`${kitchen1}/kitchen/stations`, data, {
      headers: fnbServiceApi.getHeaders(),
    }),
};
