import {
  categoryApi,
  dietaryTagApi,
  fnbServiceApi,
  kitchenApi,
  menuApi,
  menuItemApi,
  orderApi,
  sectionApi,
  type OrgFnbServiceEntry,
} from "@/services/fnb/fnbService";
import type {
  Analytics,
  DietaryTag,
  KitchenTicket,
  Menu,
  MenuCategory,
  MenuItem,
  MenuSection,
  Order,
  PaginatedResponse,
} from "@/types/fnb.types";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

// ── State Interfaces ──────────────────────────────────────────────────────────

interface FnbState {
  // Global services
  services: OrgFnbServiceEntry[];
  isTogglingService: Record<string, boolean>;

  // Menus
  menus: PaginatedResponse<Menu> | null;
  currentMenu: Menu | null;

  // Items
  items: PaginatedResponse<MenuItem> | null;
  currentItem: MenuItem | null;

  // Categories & Tags
  categories: MenuCategory[];
  dietaryTags: DietaryTag[];

  // Sections
  sections: MenuSection[];

  // Orders
  orders: Order[];
  activeOrder: Order | null;
  totalOrders: number;
  isOrderLoading: boolean;
  orderFilters: Record<string, unknown>;

  //Kitchen
  kitchenTickets: KitchenTicket[];
  recentlyCompleted: KitchenTicket[];
  stations: unknown[];
  isKitchenLoading: boolean;
  selectedStationId: string | null;

  //analytics
  analytics: Analytics | null;

  // UI State
  isLoading: boolean;
  isLoadingItems: boolean;
  isSubmitting: boolean;
  error: string | null;
  selectedItems: string[];

  // Filters
  itemFilters: {
    search: string;
    status: string;
    menuId: string;
    categoryId: string;
    page: number;
    limit: number;
  };

  menuFilters: {
    search: string;
    status: string;
    page: number;
    limit: number;
  };
}

interface FnbActions {
  // Services
  fetchServices: () => Promise<void>;
  toggleService: (serviceId: string) => Promise<void>;
  removeService: (serviceId: string) => Promise<void>;
  updateService: (
    serviceId: string,
    data: {
      name: string;
      description?: string;
      isEnabled?: boolean;
      status?: string;
    },
  ) => Promise<void>;
  createService: (data: { type: string }) => Promise<void>;
  bulkCreateServices: (services: { type: string }[]) => Promise<void>;

  fetchGlobalServices: () => Promise<void>;
  fetchOrgServices: () => Promise<void>;
  enableService: (fnbServiceId: string, config?: object) => Promise<void>;
  disableService: (serviceId: string) => Promise<void>;

  // Menus
  fetchMenus: () => Promise<void>;
  fetchMenuById: (menuId: string) => Promise<void>;
  createMenu: (
    data: Partial<Menu> & { fnbServiceIds?: string[] },
  ) => Promise<Menu>;
  updateMenu: (
    menuId: string,
    data: Partial<Menu> & { fnbServiceIds?: string[] },
  ) => Promise<void>;
  deleteMenu: (menuId: string) => Promise<void>;
  duplicateMenu: (menuId: string) => Promise<void>;
  setCurrentMenu: (menu: Menu | null) => void;

  // Sections
  fetchSections: (menuId: string) => Promise<void>;
  createSection: (
    menuId: string,
    data: { name: string; description?: string },
  ) => Promise<void>;
  updateSection: (
    menuId: string,
    sectionId: string,
    data: Partial<MenuSection>,
  ) => Promise<void>;
  deleteSection: (menuId: string, sectionId: string) => Promise<void>;

  // Items
  fetchItems: (params?: Partial<FnbState["itemFilters"]>) => Promise<void>;
  fetchItemById: (itemId: string) => Promise<void>;
  createItem: (
    data: Partial<MenuItem> & { menuId: string; dietaryTagIds?: string[] },
  ) => Promise<MenuItem>;
  updateItem: (
    itemId: string,
    data: Partial<MenuItem> & { dietaryTagIds?: string[] },
  ) => Promise<void>;
  deleteItem: (itemId: string) => Promise<void>;
  bulkUpdateStatus: (
    itemIds: string[],
    status: "AVAILABLE" | "OUT_OF_STOCK" | "DISCONTINUED",
  ) => Promise<void>;
  setCurrentItem: (item: MenuItem | null) => void;
  toggleSelectItem: (itemId: string) => void;
  clearSelection: () => void;
  setItemFilters: (filters: Partial<FnbState["itemFilters"]>) => void;
  setMenuFilters: (filters: Partial<FnbState["menuFilters"]>) => void;

  // Categories
  fetchCategories: () => Promise<void>;
  createCategory: (data: Partial<MenuCategory>) => Promise<void>;
  updateCategory: (
    categoryId: string,
    data: Partial<MenuCategory>,
  ) => Promise<void>;
  deleteCategory: (categoryId: string) => Promise<void>;

  // Dietary Tags
  fetchDietaryTags: () => Promise<void>;
  createDietaryTag: (data: Partial<DietaryTag>) => Promise<void>;
  updateDietaryTag: (tagId: string, data: Partial<DietaryTag>) => Promise<void>;
  deleteDietaryTag: (tagId: string) => Promise<void>;

  // Orders
  setOrderFilters: (filters: Record<string, unknown>) => void;
  fetchOrders: () => Promise<void>;
  fetchOrderById: (id: string) => Promise<void>;
  updateOrderStatus: (
    id: string,
    status: string,
    reason?: string,
  ) => Promise<void>;
  sendToKitchen: (id: string) => Promise<void>;
  processPayment: (id: string, data: unknown) => Promise<void>;
  cancelOrder: (id: string, reason: string) => Promise<void>;

  //Kitchen

  setSelectedStation: (stationId: string | null) => void;
  fetchKDSDashboard: () => Promise<void>;
  updateTicketStatus: (id: string, status: string) => Promise<void>;
  updateTicketItemStatus: (id: string, status: string) => Promise<void>;

  // Analytics

  fetchAnalytics: (params?: Record<string, unknown>) => Promise<void>;

  // Utils
  setError: (error: string | null) => void;
  reset: () => void;
}

// ── Initial State ─────────────────────────────────────────────────────────────

const initialState: FnbState = {
  services: [],
  isTogglingService: {},
  menus: null,
  currentMenu: null,
  items: null,
  activeOrder: null,
  orders: [],
  totalOrders: 0,
  orderFilters: {},
  isOrderLoading: false,
  kitchenTickets: [],
  recentlyCompleted: [],
  stations: [],
  isKitchenLoading: false,
  selectedStationId: null,
  analytics: null,
  currentItem: null,
  categories: [],
  dietaryTags: [],
  sections: [],
  isLoading: false,
  isLoadingItems: false,
  isSubmitting: false,
  error: null,
  selectedItems: [],
  itemFilters: {
    search: "",
    status: "",
    menuId: "",
    categoryId: "",
    page: 1,
    limit: 20,
  },
  menuFilters: { search: "", status: "", page: 1, limit: 20 },
};
function normalisePaginatedResponse<T>(
  raw: unknown,
): PaginatedResponse<T> | null {
  if (!raw || typeof raw !== "object") return null;

  const r = raw as Record<string, unknown>;

  // Shape B: top-level object already has `pagination`
  if ("pagination" in r && Array.isArray(r.data)) {
    return raw as PaginatedResponse<T>;
  }

  // Shape A: unwrap the extra `data` envelope
  if ("data" in r && r.data && typeof r.data === "object") {
    const inner = r.data as Record<string, unknown>;
    if ("pagination" in inner && Array.isArray(inner.data)) {
      return r.data as PaginatedResponse<T>;
    }
  }

  return null;
}

// ── Store ─────────────────────────────────────────────────────────────────────

export const useFnbStore = create<FnbState & FnbActions>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // ── Services ────────────────────────────────────────────────────────────

      fetchServices: async () => {
        set({ isLoading: true, error: null });
        try {
          const res = await fnbServiceApi.list();
          set({ services: res.data.data ?? [] });
        } catch (err: any) {
          set({ error: err?.response?.data?.message ?? err.message });
        } finally {
          set({ isLoading: false });
        }
      },

      bulkCreateServices: async (services) => {
        set({ isSubmitting: true, error: null });
        try {
          await fnbServiceApi.bulkCreate(services);
          const res = await fnbServiceApi.list();
          set({ services: res.data.data ?? [] });
        } catch (err: any) {
          set({ error: err?.response?.data?.message ?? err.message });
          throw err;
        } finally {
          set({ isSubmitting: false });
        }
      },

      toggleService: async (serviceId) => {
        set((s) => ({
          isTogglingService: { ...s.isTogglingService, [serviceId]: true },
        }));
        try {
          await fnbServiceApi.toggle(serviceId);
          const res = await fnbServiceApi.list();
          set({ services: res.data.data ?? [] });
        } catch (err: any) {
          set({ error: err?.response?.data?.message ?? err.message });
          throw err;
        } finally {
          set((s) => ({
            isTogglingService: { ...s.isTogglingService, [serviceId]: false },
          }));
        }
      },

      removeService: async (serviceId) => {
        set({ isSubmitting: true });
        try {
          await fnbServiceApi.remove(serviceId);
          const res = await fnbServiceApi.list();
          set({ services: res.data.data ?? [] });
        } catch (err: any) {
          set({ error: err?.response?.data?.message ?? err.message });
          throw err;
        } finally {
          set({ isSubmitting: false });
        }
      },

      // Stubs for service actions defined in the interface
      createService: async () => {},
      updateService: async () => {},
      fetchGlobalServices: async () => {},
      fetchOrgServices: async () => {},
      enableService: async () => {},
      disableService: async () => {},

      // ── Menus ───────────────────────────────────────────────────────────────

      fetchMenus: async () => {
        const { menuFilters } = get();
        set({ isLoading: true, error: null });
        try {
          const res = await menuApi.list(menuFilters);
          set({ menus: res.data.data });
        } catch (err: any) {
          set({ error: err.message });
        } finally {
          set({ isLoading: false });
        }
      },

      fetchMenuById: async (menuId) => {
        set({ isLoading: true, error: null });
        try {
          const res = await menuApi.getById(menuId);
          set({ currentMenu: res.data.data });
        } catch (err: any) {
          set({ error: err.message });
        } finally {
          set({ isLoading: false });
        }
      },

      createMenu: async (data) => {
        set({ isSubmitting: true, error: null });
        try {
          const res = await menuApi.create(data);
          await get().fetchMenus();
          return res.data.data;
        } catch (err: any) {
          set({ error: err.message });
          throw err;
        } finally {
          set({ isSubmitting: false });
        }
      },

      updateMenu: async (menuId, data) => {
        set({ isSubmitting: true, error: null });
        try {
          const res = await menuApi.update(menuId, data);
          set((s) => ({
            menus: s.menus
              ? {
                  ...s.menus,
                  data: s.menus.data.map((m) =>
                    m.id === menuId ? res.data.data : m,
                  ),
                }
              : null,
            currentMenu:
              s.currentMenu?.id === menuId ? res.data.data : s.currentMenu,
          }));
        } catch (err: any) {
          set({ error: err.message });
          throw err;
        } finally {
          set({ isSubmitting: false });
        }
      },

      deleteMenu: async (menuId) => {
        set({ isSubmitting: true, error: null });
        try {
          await menuApi.delete(menuId);
          set((s) => ({
            menus: s.menus
              ? {
                  ...s.menus,
                  data: s.menus.data.filter((m) => m.id !== menuId),
                }
              : null,
          }));
        } catch (err: any) {
          set({ error: err.message });
          throw err;
        } finally {
          set({ isSubmitting: false });
        }
      },

      duplicateMenu: async (menuId) => {
        set({ isSubmitting: true });
        try {
          await menuApi.duplicate(menuId);
          await get().fetchMenus();
        } catch (err: any) {
          set({ error: err.message });
          throw err;
        } finally {
          set({ isSubmitting: false });
        }
      },

      setCurrentMenu: (menu) => set({ currentMenu: menu }),

      // ── Sections ─────────────────────────────────────────────────────────────

      fetchSections: async (menuId) => {
        set({ isLoading: true });
        try {
          const res = await sectionApi.list(menuId);
          set({ sections: res.data.data });
        } catch (err: any) {
          set({ error: err.message });
        } finally {
          set({ isLoading: false });
        }
      },

      createSection: async (menuId, data) => {
        set({ isSubmitting: true });
        try {
          const res = await sectionApi.create(menuId, data);
          set((s) => ({ sections: [...s.sections, res.data.data] }));
        } catch (err: any) {
          set({ error: err.message });
          throw err;
        } finally {
          set({ isSubmitting: false });
        }
      },

      updateSection: async (menuId, sectionId, data) => {
        set({ isSubmitting: true });
        try {
          const res = await sectionApi.update(menuId, sectionId, data);
          set((s) => ({
            sections: s.sections.map((sec) =>
              sec.id === sectionId ? res.data.data : sec,
            ),
          }));
        } catch (err: any) {
          set({ error: err.message });
          throw err;
        } finally {
          set({ isSubmitting: false });
        }
      },

      deleteSection: async (menuId, sectionId) => {
        set({ isSubmitting: true });
        try {
          await sectionApi.delete(menuId, sectionId);
          set((s) => ({
            sections: s.sections.filter((sec) => sec.id !== sectionId),
          }));
        } catch (err: any) {
          set({ error: err.message });
          throw err;
        } finally {
          set({ isSubmitting: false });
        }
      },

      // ── Items ────────────────────────────────────────────────────────────────

      fetchItems: async (params?: Partial<FnbState["itemFilters"]>) => {
        const { itemFilters } = get();
        // Merge: explicit params override stored filters
        const merged = { ...itemFilters, ...params };

        if (!merged.menuId) {
          console.warn("fetchItems: no menuId, skipping");
          return;
        }

        set({ isLoadingItems: true, error: null });
        try {
          const res = await menuItemApi.list({
            page: merged.page ?? 1,
            limit: merged.limit ?? 20,
            menuId: merged.menuId,
            ...(merged.status ? { status: merged.status } : {}),
            ...(merged.search ? { search: merged.search } : {}),
            ...(merged.categoryId ? { categoryId: merged.categoryId } : {}),
          });

          // ─── FIX: normalise response regardless of backend envelope shape ───
          // Shape A (double-nested): res.data = { data: { data:[], pagination:{} } }
          // Shape B (single-nested): res.data = { data:[], pagination:{} }
          const normalised = normalisePaginatedResponse<MenuItem>(res.data);

          // Always update items — even when the list is empty — so the
          // component never shows stale data from a previous menu visit.
          set({ items: normalised });
        } catch (err: any) {
          set({ error: err?.response?.data?.message ?? err.message });
        } finally {
          set({ isLoadingItems: false });
        }
      },

      fetchItemById: async (itemId) => {
        set({ isLoading: true });
        try {
          const res = await menuItemApi.getById(itemId);
          set({ currentItem: res.data.data });
        } catch (err: any) {
          set({ error: err.message });
        } finally {
          set({ isLoading: false });
        }
      },

      createItem: async (data) => {
        set({ isSubmitting: true, error: null });
        try {
          const res = await menuItemApi.create(data);
          return res.data.data;
        } catch (err: any) {
          set({ error: err.message });
          throw err;
        } finally {
          set({ isSubmitting: false });
        }
      },

      updateItem: async (itemId, data) => {
        set({ isSubmitting: true });
        try {
          const res = await menuItemApi.update(itemId, data);
          set((s) => ({
            items: s.items
              ? {
                  ...s.items,
                  data: s.items.data.map((i) =>
                    i.id === itemId ? res.data.data : i,
                  ),
                }
              : null,
            currentItem:
              s.currentItem?.id === itemId ? res.data.data : s.currentItem,
          }));
        } catch (err: any) {
          set({ error: err.message });
          throw err;
        } finally {
          set({ isSubmitting: false });
        }
      },

      deleteItem: async (itemId) => {
        set({ isSubmitting: true });
        try {
          await menuItemApi.delete(itemId);
          set((s) => ({
            items: s.items
              ? {
                  ...s.items,
                  data: s.items.data.filter((i) => i.id !== itemId),
                }
              : null,
            selectedItems: s.selectedItems.filter((id) => id !== itemId),
          }));
        } catch (err: any) {
          set({ error: err.message });
          throw err;
        } finally {
          set({ isSubmitting: false });
        }
      },

      bulkUpdateStatus: async (itemIds, status) => {
        set({ isSubmitting: true });
        try {
          await menuItemApi.bulkUpdateStatus({ itemIds, status });
          set((s) => ({
            items: s.items
              ? {
                  ...s.items,
                  data: s.items.data.map((i) =>
                    itemIds.includes(i.id) ? { ...i, status } : i,
                  ),
                }
              : null,
            selectedItems: [],
          }));
        } catch (err: any) {
          set({ error: err.message });
          throw err;
        } finally {
          set({ isSubmitting: false });
        }
      },

      setCurrentItem: (item) => set({ currentItem: item }),

      toggleSelectItem: (itemId) =>
        set((s) => ({
          selectedItems: s.selectedItems.includes(itemId)
            ? s.selectedItems.filter((id) => id !== itemId)
            : [...s.selectedItems, itemId],
        })),

      clearSelection: () => set({ selectedItems: [] }),

      setItemFilters: (filters) =>
        set((s) => ({ itemFilters: { ...s.itemFilters, ...filters } })),

      setMenuFilters: (filters) =>
        set((s) => ({ menuFilters: { ...s.menuFilters, ...filters } })),

      // ── Categories ───────────────────────────────────────────────────────────

      fetchCategories: async () => {
        set({ isLoading: true });
        try {
          const res = await categoryApi.list();
          set({ categories: res.data.data });
        } catch (err: any) {
          set({ error: err.message });
        } finally {
          set({ isLoading: false });
        }
      },

      createCategory: async (data) => {
        set({ isSubmitting: true });
        try {
          const res = await categoryApi.create(data);
          set((s) => ({ categories: [...s.categories, res.data.data] }));
        } catch (err: any) {
          set({ error: err.message });
          throw err;
        } finally {
          set({ isSubmitting: false });
        }
      },

      updateCategory: async (categoryId, data) => {
        set({ isSubmitting: true });
        try {
          const res = await categoryApi.update(categoryId, data);
          set((s) => ({
            categories: s.categories.map((c) =>
              c.id === categoryId ? res.data.data : c,
            ),
          }));
        } catch (err: any) {
          set({ error: err.message });
          throw err;
        } finally {
          set({ isSubmitting: false });
        }
      },

      deleteCategory: async (categoryId) => {
        set({ isSubmitting: true });
        try {
          await categoryApi.delete(categoryId);
          set((s) => ({
            categories: s.categories.filter((c) => c.id !== categoryId),
          }));
        } catch (err: any) {
          set({ error: err.message });
          throw err;
        } finally {
          set({ isSubmitting: false });
        }
      },

      // ── Dietary Tags ─────────────────────────────────────────────────────────

      fetchDietaryTags: async () => {
        set({ isLoading: true });
        try {
          const res = await dietaryTagApi.list();
          set({ dietaryTags: res.data.data });
        } catch (err: any) {
          set({ error: err.message });
        } finally {
          set({ isLoading: false });
        }
      },

      createDietaryTag: async (data) => {
        set({ isSubmitting: true });
        try {
          const res = await dietaryTagApi.create(data);
          set((s) => ({ dietaryTags: [...s.dietaryTags, res.data.data] }));
        } catch (err: any) {
          set({ error: err.message });
          throw err;
        } finally {
          set({ isSubmitting: false });
        }
      },

      updateDietaryTag: async (tagId, data) => {
        set({ isSubmitting: true });
        try {
          const res = await dietaryTagApi.update(tagId, data);
          set((s) => ({
            dietaryTags: s.dietaryTags.map((t) =>
              t.id === tagId ? res.data.data : t,
            ),
          }));
        } catch (err: any) {
          set({ error: err.message });
          throw err;
        } finally {
          set({ isSubmitting: false });
        }
      },

      deleteDietaryTag: async (tagId) => {
        set({ isSubmitting: true });
        try {
          await dietaryTagApi.delete(tagId);
          set((s) => ({
            dietaryTags: s.dietaryTags.filter((t) => t.id !== tagId),
          }));
        } catch (err: any) {
          set({ error: err.message });
          throw err;
        } finally {
          set({ isSubmitting: false });
        }
      },

      // ------------- Orders
      setOrderFilters: (filters) => set({ orderFilters: filters }),
      fetchOrders: async () => {
        const { orderFilters } = get();

        set({ isOrderLoading: true });
        try {
          const res = await orderApi.getOrders(orderFilters);
          set({
            orders: res.data.data,
            totalOrders: res.data.pagination?.total ?? 0,
          });
        } finally {
          set({ isOrderLoading: false });
        }
      },

      fetchOrderById: async (id) => {
        const res = await orderApi.getOrder(id);
        set({ activeOrder: res.data.data });
      },

      updateOrderStatus: async (id, status, reason) => {
        const { fetchOrders } = get();
        await orderApi.updateOrderStatus(id, {
          status,
          reason,
        });
        await fetchOrders();
      },

      sendToKitchen: async (id) => {
        const { fetchOrders } = get();
        await orderApi.sendToKitchen(id);
        await fetchOrders();
      },

      processPayment: async (id, data) => {
        const { fetchOrders } = get();
        await orderApi.processPayment(id, data);
        await fetchOrders();
      },
      cancelOrder: async (id, reason) => {
        const { fetchOrders } = get();

        await orderApi.cancelOrder(id, reason);
        await fetchOrders();
      },

      //------kitchen
      setSelectedStation: (stationId) => set({ selectedStationId: stationId }),

      fetchKDSDashboard: async () => {
        const { selectedStationId } = get();
        set({ isKitchenLoading: true });
        try {
          const res = await kitchenApi.getKDSDashboard(
            selectedStationId ?? undefined,
          );
          set({
            kitchenTickets: res.data.data.activeTickets,
            recentlyCompleted: res.data.data.recentlyCompleted,
            stations: res.data.data.stations,
          });
        } finally {
          set({ isKitchenLoading: false });
        }
      },

      updateTicketStatus: async (id, status) => {
        const { fetchKDSDashboard } = get();

        await kitchenApi.updateTicketStatus(id, { status });
        await fetchKDSDashboard();
      },

      updateTicketItemStatus: async (id, status) => {
        const { fetchKDSDashboard } = get();

        await kitchenApi.updateTicketItemStatus(id, { status });
        await fetchKDSDashboard();
      },

      // ── Analytics ────────────────────────────────────────────────────────────

      setError: (error) => set({ error }),
      reset: () => set(initialState),
    }),
    { name: "fnb-store" },
  ),
);
