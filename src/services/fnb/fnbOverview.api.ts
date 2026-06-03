// frontend/src/features/fnb/services/fnbOverview.api.ts

import adminApi from "@/lib/config";
import type { FnbOverviewStats } from "@/store/fnb/fnbOverview.store";

const base = () => `/fnb`;

export const fnbOverviewApi = {
  getStats: () =>
    adminApi.get<{ data: FnbOverviewStats }>(`${base()}/overview`),

  getPublicMenus: () => adminApi.get(`${base()}/public/menus`),
};
