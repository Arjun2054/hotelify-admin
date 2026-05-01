import { useAuthStore } from "@/store/useAuthStore";
import { Building2 } from "lucide-react";

export function OrganizationSwitcher() {
  const { getActiveOrganization } = useAuthStore();

  const activeOrg = getActiveOrganization();

  if (!activeOrg) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
        <Building2 className="h-4 w-4 text-primary-foreground" />
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-semibold leading-none">
          {activeOrg.name}
        </span>
        <span className="text-xs text-muted-foreground mt-0.5 capitalize">
          {activeOrg.plan}
        </span>
      </div>
    </div>
  );
}
