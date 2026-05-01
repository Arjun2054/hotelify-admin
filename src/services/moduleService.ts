// src/services/moduleService.ts
import adminApi from "@/lib/config";
import type {
  ModuleType,
  OrganizationModule,
} from "@/types/organization_module";

class ModuleService {
  async getOrganizationModules(orgId: string): Promise<OrganizationModule[]> {
    const res = await adminApi.get<{
      success: boolean;
      modules: OrganizationModule[];
    }>(`/modules/${orgId}`);
    return res.data.modules;
  }

  async updateOrganizationModules(
    orgId: string,
    modules: ModuleType[],
  ): Promise<OrganizationModule[]> {
    const res = await adminApi.put<{
      success: boolean;
      modules: OrganizationModule[];
    }>(`/modules/${orgId}`, { modules });
    return res.data.modules;
  }

  // Cache modules in localStorage per org
  cacheModules(orgId: string, modules: OrganizationModule[]): void {
    localStorage.setItem(`modules_${orgId}`, JSON.stringify(modules));
  }

  getCachedModules(orgId: string): OrganizationModule[] | null {
    const cached = localStorage.getItem(`modules_${orgId}`);
    return cached ? JSON.parse(cached) : null;
  }

  clearCachedModules(orgId: string): void {
    localStorage.removeItem(`modules_${orgId}`);
  }

  clearAllCachedModules(): void {
    Object.keys(localStorage)
      .filter((key) => key.startsWith("modules_"))
      .forEach((key) => localStorage.removeItem(key));
  }
}

export const moduleService = new ModuleService();
