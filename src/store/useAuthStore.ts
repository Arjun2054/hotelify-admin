// src/store/useAuthStore.ts
import { authService } from "@/services/authService";
import { moduleService } from "@/services/moduleService"; // ← NEW
import { persist } from "zustand/middleware";
import { create } from "zustand";
import type {
  ModuleType,
  OrganizationModule,
} from "@/types/organization_module";

export type User = {
  userId: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt?: string;
};

export type MemberRole = "OWNER" | "ADMIN" | "STAFF";
export type OrganizationType = "HOTEL" | "STORE" | "CLOTHING";
export type StaffDepartment =
  | "HOUSEKEEPING"
  | "FRONT_DESK"
  | "KITCHEN"
  | "MAINTENANCE"
  | "GENERAL";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  features: Record<string, boolean>;
  modules?: OrganizationModule[]; // populated after fetchActiveOrgModules
  plan: string;
  role: MemberRole;
  department?: StaffDepartment | null;
  jobTitle?: string | null;
  type: OrganizationType;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  organizationName: string;
  type?: OrganizationType;
  modules?: ModuleType[];
}

export interface LoginResponse {
  message: string;
  user: User;
  organizations: Organization[];
  accessToken: string;
  refreshToken: string;
}

interface AuthStore {
  user: User | null;
  organizations: Organization[];
  activeOrganizationId: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  modulesLoading: boolean; // ← NEW: separate loading for modules
  error: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setActiveOrganization: (orgId: string) => Promise<void>; // now async
  fetchActiveOrgModules: () => Promise<void>; // ← NEW

  // Getters
  getActiveOrganization: () => Organization | null;
  getActiveRole: () => MemberRole | null;
  hasFeature: (featureName: string) => boolean;
  hasModule: (module: ModuleType) => boolean;
  getEnabledModules: () => ModuleType[];
  canPerformAction: (requiredRoles: MemberRole[]) => boolean;
  clearError: () => void;
  setUser: (user: User | null) => void;
  getActiveDepartment: () => StaffDepartment | null;
  getActiveJobTitle: () => string | null;
  isInDepartment: (dept: StaffDepartment) => boolean;
  updateOrganizationModules: (modules: OrganizationModule[]) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: authService.getStoredUser(),
      organizations: authService.getStoredOrganizations(),
      activeOrganizationId: authService.getActiveOrganizationId(),
      isAuthenticated: !!authService.getAccessToken(),
      loading: false,
      modulesLoading: false,
      error: null,

      // ── Login ──────────────────────────────────────────────────────────────
      login: async (credentials) => {
        set({ loading: true, error: null });
        try {
          const response = await authService.login(credentials);

          authService.setTokens(response.accessToken, response.refreshToken);
          authService.setUser(response.user);
          authService.setOrganizations(response.organizations);

          const activeOrgId =
            authService.getActiveOrganizationId() ||
            response.organizations[0]?.id;
          authService.setActiveOrganization(activeOrgId || "");

          set({
            user: response.user,
            organizations: response.organizations,
            activeOrganizationId: activeOrgId,
            isAuthenticated: true,
            loading: false,
          });

          // Fetch modules for the active org right after login
          await get().fetchActiveOrgModules();
        } catch (error: any) {
          set({
            error: error.response?.data?.message || "Login failed",
            loading: false,
          });
          throw error;
        }
      },

      // ── Register ───────────────────────────────────────────────────────────
      register: async (data) => {
        set({ loading: true, error: null });
        try {
          await authService.register(data);
          set({ loading: false });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || "Registration failed",
            loading: false,
          });
          throw error;
        }
      },

      // ── Logout ─────────────────────────────────────────────────────────────
      logout: async () => {
        set({ loading: true });
        try {
          await authService.logout();
        } finally {
          // Clear all cached modules
          moduleService.clearAllCachedModules();
          authService.clearStorage();
          set({
            user: null,
            organizations: [],
            activeOrganizationId: null,
            isAuthenticated: false,
            loading: false,
            error: null,
          });
        }
      },

      // ── checkAuth — called on every page refresh ───────────────────────────
      checkAuth: async () => {
        const token = authService.getAccessToken();
        if (!token) {
          set({
            isAuthenticated: false,
            user: null,
            organizations: [],
            activeOrganizationId: null,
          });
          return;
        }

        set({ loading: true });
        try {
          const response = await authService.getCurrentUser();
          authService.setUser(response.user);
          authService.setOrganizations(response.organizations);

          const activeOrgId =
            authService.getActiveOrganizationId() ||
            response.organizations[0]?.id;

          set({
            user: response.user,
            organizations: response.organizations,
            activeOrganizationId: activeOrgId,
            isAuthenticated: true,
            loading: false,
          });

          // ← Re-fetch modules on every page refresh
          await get().fetchActiveOrgModules();
        } catch {
          moduleService.clearAllCachedModules();
          authService.clearStorage();
          set({
            user: null,
            organizations: [],
            activeOrganizationId: null,
            isAuthenticated: false,
            loading: false,
          });
        }
      },

      // ── Fetch modules for the active org ───────────────────────────────────
      fetchActiveOrgModules: async () => {
        const state = get();
        const orgId = state.activeOrganizationId;
        if (!orgId) return;

        // 1. Load from localStorage cache immediately (instant UI)
        const cached = moduleService.getCachedModules(orgId);
        if (cached) {
          const updatedOrgs = state.organizations.map((org) =>
            org.id === orgId ? { ...org, modules: cached } : org,
          );
          set({ organizations: updatedOrgs });
        }

        // 2. Always fetch fresh from server in background
        set({ modulesLoading: true });
        try {
          const freshModules =
            await moduleService.getOrganizationModules(orgId);

          // Update cache
          moduleService.cacheModules(orgId, freshModules);

          // Update store
          const currentOrgs = get().organizations;
          const updatedOrgs = currentOrgs.map((org) =>
            org.id === orgId ? { ...org, modules: freshModules } : org,
          );
          authService.setOrganizations(updatedOrgs);
          set({ organizations: updatedOrgs, modulesLoading: false });
        } catch {
          // If fetch fails, cached data is still shown — silent fail
          set({ modulesLoading: false });
        }
      },

      // ── Set active org (now re-fetches modules too) ────────────────────────
      setActiveOrganization: async (orgId: string) => {
        authService.setActiveOrganization(orgId);
        set({ activeOrganizationId: orgId });

        // Fetch modules for the newly selected org
        await get().fetchActiveOrgModules();
      },

      // ── Getters ────────────────────────────────────────────────────────────
      getActiveOrganization: () => {
        const state = get();
        return (
          state.organizations.find(
            (org) => org.id === state.activeOrganizationId,
          ) || null
        );
      },

      getActiveRole: () => {
        return get().getActiveOrganization()?.role || null;
      },

      hasModule: (module: ModuleType) => {
        const org = get().getActiveOrganization();
        if (!org) return false;

        // Use modules array if available (DB-driven)
        if (org.modules && org.modules.length > 0) {
          return org.modules.some((m) => m.module === module && m.isEnabled);
        }

        // While modules are loading, check localStorage cache directly
        const cached = moduleService.getCachedModules(org.id);
        if (cached) {
          return cached.some((m) => m.module === module && m.isEnabled);
        }

        return false;
      },

      getEnabledModules: () => {
        const org = get().getActiveOrganization();
        if (!org) return [];

        if (org.modules && org.modules.length > 0) {
          return org.modules
            .filter((m) => m.isEnabled)
            .map((m) => m.module as ModuleType);
        }

        // Fallback to cache
        const cached = moduleService.getCachedModules(org.id);
        if (cached) {
          return cached
            .filter((m) => m.isEnabled)
            .map((m) => m.module as ModuleType);
        }

        return [];
      },

      hasFeature: (featureName: string) => {
        const org = get().getActiveOrganization();
        if (!org) return false;
        return org.features[featureName] === true;
      },

      canPerformAction: (requiredRoles: MemberRole[]) => {
        const role = get().getActiveRole();
        if (!role) return false;
        return requiredRoles.includes(role);
      },

      getActiveDepartment: () => {
        const org = get().getActiveOrganization();
        if (!org || org.role !== "STAFF") return null;
        return org.department ?? null;
      },

      getActiveJobTitle: () => {
        return get().getActiveOrganization()?.jobTitle ?? null;
      },

      isInDepartment: (dept: StaffDepartment) => {
        const role = get().getActiveRole();
        if (role === "OWNER" || role === "ADMIN") return true;
        const department = get().getActiveDepartment();
        if (!department) return true;
        return department === dept;
      },

      updateOrganizationModules: (modules: OrganizationModule[]) => {
        const state = get();
        const orgId = state.activeOrganizationId;
        if (!orgId) return;

        // Update cache
        moduleService.cacheModules(orgId, modules);

        // Update store
        const updatedOrgs = state.organizations.map((org) =>
          org.id === orgId ? { ...org, modules } : org,
        );
        authService.setOrganizations(updatedOrgs);
        set({ organizations: updatedOrgs });
      },

      clearError: () => set({ error: null }),
      setUser: (user) => set({ user }),
    }),
    {
      name: "auth-storage",
      // Don't persist modulesLoading
      partialize: (state) => ({
        user: state.user,
        organizations: state.organizations,
        activeOrganizationId: state.activeOrganizationId,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
