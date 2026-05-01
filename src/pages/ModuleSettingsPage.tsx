// src/pages/ModuleSettingsPage.tsx
import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Loader2,
  Package,
  ShoppingCart,
  Truck,
  BedDouble,
  Sparkles,
  Warehouse,
  CalendarOff,
  Clock,
  Banknote,
  Bell,
  Info,
  CheckCircle2,
  Utensils,
} from "lucide-react";
import { moduleService } from "@/services/moduleService";
import { cn } from "@/lib/utils";
import type { ModuleType } from "@/types/organization_module";
import type { OrganizationType } from "@/lib/types";

// ── Module metadata ────────────────────────────────────────────────────────────
interface ModuleMeta {
  id: ModuleType;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  dependencies: ModuleType[];
  // Which org types can see/use this module
  availableFor: OrganizationType[];
}

const MODULE_META: ModuleMeta[] = [
  // ── Store / Clothing ────────────────────────────────────────────────────────
  {
    id: "INVENTORY",
    name: "Inventory Management",
    description: "Track products, stock levels, categories and suppliers",
    icon: Package,
    dependencies: [],
    availableFor: ["STORE", "CLOTHING"],
  },
  {
    id: "SALES",
    name: "Sales",
    description: "Create invoices and track customer sales",
    icon: ShoppingCart,
    dependencies: ["INVENTORY"],
    availableFor: ["STORE", "CLOTHING"],
  },
  {
    id: "PURCHASES",
    name: "Purchases",
    description: "Manage purchase orders and supplier deliveries",
    icon: Truck,
    dependencies: ["INVENTORY"],
    availableFor: ["STORE", "CLOTHING"],
  },

  // ── Hotel ───────────────────────────────────────────────────────────────────
  {
    id: "HOTEL_ROOMS",
    name: "Room Management",
    description: "Manage rooms, room types and guest check-ins",
    icon: BedDouble,
    dependencies: [],
    availableFor: ["HOTEL"],
  },
  {
    id: "HOTEL_HOUSEKEEPING",
    name: "Housekeeping",
    description: "Schedule and track housekeeping tasks per room",
    icon: Sparkles,
    dependencies: ["HOTEL_ROOMS"],
    availableFor: ["HOTEL"],
  },
  {
    id: "HOTEL_INVENTORY",
    name: "Hotel Inventory",
    description: "Track hotel supplies, linens and consumables",
    icon: Warehouse,
    dependencies: [],
    availableFor: ["HOTEL"],
  },
  {
    id: "HOTEL_FNB",
    name: "Food & Beverage",
    description: "Track hotel food and beverage",
    icon: Utensils,
    dependencies: [],
    availableFor: ["HOTEL"],
  },

  // ── HR — available for all org types ───────────────────────────────────────
  {
    id: "HR_LEAVE",
    name: "Leave Management",
    description: "Manage staff leave requests and balances",
    icon: CalendarOff,
    dependencies: [],
    availableFor: ["HOTEL", "STORE", "CLOTHING"],
  },
  {
    id: "HR_ATTENDANCE",
    name: "Attendance",
    description: "Track staff clock-in/out, overtime and absences",
    icon: Clock,
    dependencies: [],
    availableFor: ["HOTEL", "STORE", "CLOTHING"],
  },
  {
    id: "HR_PAYROLL",
    name: "Payroll",
    description: "Generate payslips and manage salaries",
    icon: Banknote,
    dependencies: [],
    availableFor: ["HOTEL", "STORE", "CLOTHING"],
  },

  // ── General ─────────────────────────────────────────────────────────────────
  {
    id: "NOTIFICATIONS",
    name: "Notifications",
    description: "In-app alerts for tasks and system updates",
    icon: Bell,
    dependencies: [],
    availableFor: ["HOTEL", "STORE", "CLOTHING"],
  },
];

// ── Category definitions ───────────────────────────────────────────────────────
interface CategoryDef {
  label: string;
  description: string;
  modules: ModuleType[];
  // Which org types see this category at all
  availableFor: OrganizationType[];
}

const CATEGORIES: CategoryDef[] = [
  {
    label: "Store & Inventory",
    description: "Manage your products, sales and purchase orders",
    modules: ["INVENTORY", "SALES", "PURCHASES"],
    availableFor: ["STORE", "CLOTHING"],
  },
  {
    label: "Hotel Operations",
    description: "Room management, housekeeping and hotel supplies",
    modules: [
      "HOTEL_ROOMS",
      "HOTEL_HOUSEKEEPING",
      "HOTEL_INVENTORY",
      "HOTEL_FNB",
    ],
    availableFor: ["HOTEL"],
  },
  {
    label: "Human Resources",
    description: "Leave, attendance and payroll management for your team",
    modules: ["HR_LEAVE", "HR_ATTENDANCE", "HR_PAYROLL"],
    availableFor: ["HOTEL", "STORE", "CLOTHING"],
  },
  {
    label: "General",
    description: "Platform-wide utilities",
    modules: ["NOTIFICATIONS"],
    availableFor: ["HOTEL", "STORE", "CLOTHING"],
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Given a set of selected modules, returns module IDs that are
 * "locked on" because something selected depends on them.
 */
function getLockedModules(
  selected: Set<ModuleType>,
  availableMetas: ModuleMeta[],
): Set<ModuleType> {
  const locked = new Set<ModuleType>();
  selected.forEach((moduleId) => {
    const meta = availableMetas.find((m) => m.id === moduleId);
    meta?.dependencies.forEach((dep) => {
      if (selected.has(dep)) locked.add(dep);
    });
  });
  return locked;
}

/**
 * When enabling a module, auto-add its dependencies.
 * When disabling, cascade-disable modules that depend on it.
 */
function toggleModule(
  moduleId: ModuleType,
  current: Set<ModuleType>,
  allMetas: ModuleMeta[],
): Set<ModuleType> {
  const next = new Set(current);

  if (next.has(moduleId)) {
    // Disabling — also disable anything that depends on this module
    next.delete(moduleId);
    allMetas.forEach((m) => {
      if (m.dependencies.includes(moduleId)) next.delete(m.id);
    });
  } else {
    // Enabling — auto-enable dependencies
    next.add(moduleId);
    const meta = allMetas.find((m) => m.id === moduleId);
    meta?.dependencies.forEach((dep) => next.add(dep));
  }

  return next;
}

// ── Module card ────────────────────────────────────────────────────────────────
interface ModuleCardProps {
  meta: ModuleMeta;
  isEnabled: boolean;
  isLocked: boolean;
  canEdit: boolean;
  onToggle: () => void;
}

function ModuleCard({
  meta,
  isEnabled,
  isLocked,
  canEdit,
  onToggle,
}: ModuleCardProps) {
  const Icon = meta.icon;

  const depNames = meta.dependencies.map(
    (d) => MODULE_META.find((m) => m.id === d)?.name ?? d,
  );

  return (
    <Card
      className={cn(
        "flex items-start gap-4 p-4 transition-all duration-200",
        isEnabled && "border-primary/40 bg-primary/5",
        !canEdit && "opacity-70",
      )}
    >
      {/* Module icon */}
      <div
        className={cn(
          "mt-0.5 rounded-lg p-2 shrink-0 transition-colors",
          isEnabled
            ? "bg-primary/10 text-primary"
            : "bg-muted text-muted-foreground",
        )}
      >
        <Icon className="w-5 h-5" />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <span className="font-medium text-sm">{meta.name}</span>

          {/* Dependency badge */}
          {depNames.length > 0 && !isLocked && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              Requires: {depNames.join(", ")}
            </Badge>
          )}

          {/* Locked badge — shown when another module depends on this */}
          {isLocked && (
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0 border-amber-300 bg-amber-50 text-amber-700"
            >
              Required by another module
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{meta.description}</p>
      </div>

      {/* Toggle */}
      <Switch
        checked={isEnabled || isLocked}
        onCheckedChange={onToggle}
        disabled={!canEdit || isLocked}
        aria-label={`Toggle ${meta.name}`}
        className="mt-0.5 shrink-0"
      />
    </Card>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function ModuleSettingsPage() {
  const getActiveOrganization = useAuthStore((s) => s.getActiveOrganization);
  const getActiveRole = useAuthStore((s) => s.getActiveRole);
  const updateOrganizationModules = useAuthStore(
    (s) => s.updateOrganizationModules,
  );

  const activeOrg = getActiveOrganization();
  const role = getActiveRole();
  const orgType = activeOrg?.type as OrganizationType | undefined;

  // Only OWNER can edit
  const canEdit = role === "OWNER";

  const [enabled, setEnabled] = useState<Set<ModuleType>>(new Set());
  const [initialEnabled, setInitialEnabled] = useState<Set<ModuleType>>(
    new Set(),
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ── Filter everything by org type ────────────────────────────────────────────
  const availableMetas = orgType
    ? MODULE_META.filter((m) => m.availableFor.includes(orgType))
    : [];

  const availableCategories = orgType
    ? CATEGORIES.filter((cat) => cat.availableFor.includes(orgType))
    : [];

  // ── Locked modules (depended on by something selected) ───────────────────────
  const lockedModules = getLockedModules(enabled, availableMetas);

  // ── Dirty check (has anything changed?) ──────────────────────────────────────
  const hasChanges =
    JSON.stringify([...enabled].sort()) !==
    JSON.stringify([...initialEnabled].sort());

  // ── Fetch current modules ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!activeOrg?.id) return;
    fetchModules();
  }, [activeOrg?.id]);

  const fetchModules = async () => {
    setLoading(true);
    try {
      const modules = await moduleService.getOrganizationModules(activeOrg!.id);

      // Only keep modules that are valid for this org type
      const enabledSet = new Set<ModuleType>(
        modules
          .filter((m) => {
            if (!m.isEnabled) return false;
            const meta = MODULE_META.find((mm) => mm.id === m.module);
            return meta?.availableFor.includes(orgType!) ?? false;
          })
          .map((m) => m.module as ModuleType),
      );

      setEnabled(enabledSet);
      setInitialEnabled(new Set(enabledSet));
    } catch {
      toast.error("Failed to load module settings");
    } finally {
      setLoading(false);
    }
  };

  // ── Toggle handler ────────────────────────────────────────────────────────────
  const handleToggle = (moduleId: ModuleType) => {
    if (!canEdit) return;
    setEnabled((prev) => toggleModule(moduleId, prev, availableMetas));
  };

  // ── Select all / clear all (scoped to org type) ───────────────────────────────
  const handleSelectAll = () => {
    setEnabled(new Set(availableMetas.map((m) => m.id)));
  };

  const handleClearAll = () => {
    setEnabled(new Set());
  };

  // ── Save ──────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!activeOrg?.id) return;
    setSaving(true);
    try {
      const updated = await moduleService.updateOrganizationModules(
        activeOrg.id,
        Array.from(enabled),
      );
      updateOrganizationModules(updated);
      setInitialEnabled(new Set(enabled));
      toast.success("Module settings saved successfully");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  // ── Reset ─────────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setEnabled(new Set(initialEnabled));
  };

  // ── Loading state ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Loading module settings...
          </p>
        </div>
      </div>
    );
  }

  // ── No org selected ───────────────────────────────────────────────────────────
  if (!activeOrg || !orgType) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <Info className="h-10 w-10 text-muted-foreground" />
        <p className="font-medium">No organization selected</p>
        <p className="text-sm text-muted-foreground">
          Select an organization to manage its modules.
        </p>
      </div>
    );
  }

  // ── Org type label ─────────────────────────────────────────────────────────────
  const orgTypeLabel: Record<OrganizationType, string> = {
    HOTEL: "Hotel / Resort",
    STORE: "Store / Shop",
    CLOTHING: "Clothing / Fashion",
  };

  return (
    <div className="max-w-2xl space-y-8">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Module Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage features for{" "}
            <span className="font-medium text-foreground">
              {activeOrg.name}
            </span>
          </p>
        </div>

        {/* Org type badge */}
        <Badge variant="outline" className="shrink-0 text-xs px-3 py-1.5">
          {orgTypeLabel[orgType]}
        </Badge>
      </div>

      {/* ── Read-only notice ───────────────────────────────────────────────── */}
      {!canEdit && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <Info className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-700">
            Only the organization owner can change module settings. Contact your
            owner to request changes.
          </p>
        </div>
      )}

      {/* ── Selection summary bar ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-4 py-3">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">
            {enabled.size} of {availableMetas.length} modules enabled
          </span>
        </div>

        {canEdit && (
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-xs h-7"
              onClick={handleSelectAll}
              disabled={enabled.size === availableMetas.length}
            >
              Enable all
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-xs h-7 text-destructive hover:text-destructive"
              onClick={handleClearAll}
              disabled={enabled.size === 0}
            >
              Disable all
            </Button>
          </div>
        )}
      </div>

      {/* ── Module categories ──────────────────────────────────────────────── */}
      <div className="space-y-8">
        {availableCategories.map((category) => {
          // Only show modules that belong to this org type
          const categoryMetas = category.modules
            .map((id) => availableMetas.find((m) => m.id === id))
            .filter((m): m is ModuleMeta => m !== undefined);

          if (categoryMetas.length === 0) return null;

          // How many in this category are enabled
          const enabledInCategory = categoryMetas.filter((m) =>
            enabled.has(m.id),
          ).length;

          return (
            <div key={category.label}>
              {/* Category header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h2 className="text-sm font-semibold">{category.label}</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {category.description}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0 mt-1">
                  {enabledInCategory}/{categoryMetas.length} enabled
                </span>
              </div>

              {/* Module cards */}
              <div className="space-y-2">
                {categoryMetas.map((meta) => (
                  <ModuleCard
                    key={meta.id}
                    meta={meta}
                    isEnabled={enabled.has(meta.id)}
                    isLocked={lockedModules.has(meta.id)}
                    canEdit={canEdit}
                    onToggle={() => handleToggle(meta.id)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Footer action bar ──────────────────────────────────────────────── */}
      {canEdit && (
        <div
          className={cn(
            "sticky bottom-0 flex items-center justify-between gap-3",
            "rounded-xl border bg-background/95 backdrop-blur px-4 py-3",
            "shadow-lg transition-all duration-300",
            hasChanges ? "opacity-100" : "opacity-0 pointer-events-none",
          )}
        >
          <p className="text-sm text-muted-foreground">
            You have unsaved changes
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={saving}
            >
              Reset
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save changes
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
