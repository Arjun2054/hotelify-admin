import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Loader2,
  Package,
  ShoppingCart,
  Truck,
  BedDouble,
  Sparkles,
  Warehouse,
  Bell,
  Info,
  Utensils,
  User,
  Settings2,
  Building2,
  ShieldCheck,
  CreditCard,
  Zap,
  Globe,
  Mail,
  Phone,
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
  availableFor: OrganizationType[];
  isPremium?: boolean;
}

const MODULE_META: ModuleMeta[] = [
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
    isPremium: true,
  },
  {
    id: "HOTEL_FNB",
    name: "Food & Beverage",
    description: "Track hotel food and beverage",
    icon: Utensils,
    dependencies: [],
    availableFor: ["HOTEL"],
    isPremium: true,
  },
  {
    id: "HR",
    name: "HR Management",
    description: "Manage staff profiles, roles and permissions",
    icon: User,
    dependencies: [],
    availableFor: ["HOTEL", "STORE", "CLOTHING"],
    isPremium: true,
  },
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
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  modules: ModuleType[];
}

const CATEGORIES: CategoryDef[] = [
  {
    id: "inventory",
    label: "Store & Inventory",
    description: "Manage your products, sales and purchase orders",
    icon: Package,
    modules: ["INVENTORY", "SALES", "PURCHASES"],
  },
  {
    id: "hotel",
    label: "Hotel Operations",
    description: "Room management, housekeeping and hotel supplies",
    icon: Building2,
    modules: [
      "HOTEL_ROOMS",
      "HOTEL_HOUSEKEEPING",
      "HOTEL_INVENTORY",
      "HOTEL_FNB",
    ],
  },
  {
    id: "hr",
    label: "Human Resources",
    description: "Leave, attendance and payroll management for your team",
    icon: User,
    modules: ["HR"],
  },
  {
    id: "general",
    label: "General",
    description: "Platform-wide utilities and tools",
    icon: Settings2,
    modules: ["NOTIFICATIONS"],
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────────
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

function toggleModule(
  moduleId: ModuleType,
  current: Set<ModuleType>,
  allMetas: ModuleMeta[],
): Set<ModuleType> {
  const next = new Set(current);
  if (next.has(moduleId)) {
    next.delete(moduleId);
    allMetas.forEach((m) => {
      if (m.dependencies.includes(moduleId)) next.delete(m.id);
    });
  } else {
    next.add(moduleId);
    const meta = allMetas.find((m) => m.id === moduleId);
    meta?.dependencies.forEach((dep) => next.add(dep));
  }
  return next;
}

// ── Components ────────────────────────────────────────────────────────────────
function ModuleCard({
  meta,
  isEnabled,
  isLocked,
  canEdit,
  onToggle,
}: {
  meta: ModuleMeta;
  isEnabled: boolean;
  isLocked: boolean;
  canEdit: boolean;
  onToggle: () => void;
}) {
  const Icon = meta.icon;
  return (
    <Card
      className={cn(
        "flex flex-col h-full transition-all duration-200",
        isEnabled && "border-primary/40 bg-primary/5",
      )}
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div
          className={cn(
            "p-2 rounded-lg",
            isEnabled ? "bg-primary text-primary-foreground" : "bg-muted",
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
        <Switch
          checked={isEnabled || isLocked}
          onCheckedChange={onToggle}
          disabled={!canEdit || isLocked}
        />
      </CardHeader>
      <CardContent className="flex-1">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="font-semibold text-sm">{meta.name}</span>
          {meta.isPremium && (
            <Badge
              variant="outline"
              className="text-[10px] bg-amber-100 text-amber-700 border-amber-200"
            >
              <Zap className="w-2 h-2 mr-1 fill-amber-500" /> Premium
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {meta.description}
        </p>
      </CardContent>
      {isLocked && (
        <CardFooter className="pt-0">
          <p className="text-[10px] text-amber-600 font-medium">
            Required by another active module
          </p>
        </CardFooter>
      )}
    </Card>
  );
}

export default function ModuleSettingsPage() {
  const getActiveOrganization = useAuthStore((s) => s.getActiveOrganization);
  const getActiveRole = useAuthStore((s) => s.getActiveRole);
  const updateOrganizationModules = useAuthStore(
    (s) => s.updateOrganizationModules,
  );

  const activeOrg = getActiveOrganization();
  const role = getActiveRole();
  const orgType = activeOrg?.type as OrganizationType | undefined;
  const canEdit = role === "OWNER";

  const [enabled, setEnabled] = useState<Set<ModuleType>>(new Set());
  const [initialEnabled, setInitialEnabled] = useState<Set<ModuleType>>(
    new Set(),
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("profile");

  const availableMetas = orgType
    ? MODULE_META.filter((m) => m.availableFor.includes(orgType))
    : [];
  const lockedModules = getLockedModules(enabled, availableMetas);
  const hasChanges =
    JSON.stringify([...enabled].sort()) !==
    JSON.stringify([...initialEnabled].sort());

  useEffect(() => {
    if (activeOrg?.id) fetchModules();
  }, [activeOrg?.id]);

  const fetchModules = async () => {
    setLoading(true);
    try {
      const modules = await moduleService.getOrganizationModules(activeOrg!.id);
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
      toast.success("Settings updated successfully");
    } catch {
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3 h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Syncing settings...</p>
      </div>
    );

  if (!activeOrg) return null;

  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-muted/20 py-10 px-4 md:px-8">
      <div className="w-full max-w-5xl space-y-8">
        {/* Top Branding Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b pb-8">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-xl">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {activeOrg.name}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="bg-background">
                  {orgType}
                </Badge>
                <div className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">Admin Workspace</p>
              </div>
            </div>
          </div>
          {canEdit && hasChanges && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setEnabled(new Set(initialEnabled))}
                disabled={saving}
              >
                Discard
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{" "}
                Save Changes
              </Button>
            </div>
          )}
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <div className="flex justify-center">
            <TabsList className="bg-background border p-1 h-12 shadow-sm rounded-xl">
              <TabsTrigger
                value="profile"
                className="px-6 rounded-lg gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <User className="w-4 h-4" /> Profile
              </TabsTrigger>
              <TabsTrigger
                value="modules"
                className="px-6 rounded-lg gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Settings2 className="w-4 h-4" /> Modules
              </TabsTrigger>
              <TabsTrigger
                value="billing"
                className="px-6 rounded-lg gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <CreditCard className="w-4 h-4" /> Billing
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Profile Tab Content */}
          <TabsContent
            value="profile"
            className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300"
          >
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Business Information</CardTitle>
                  <CardDescription>
                    Update your public profile and contact details.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-muted-foreground uppercase">
                        Display Name
                      </label>
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/40 border text-sm">
                        <Building2 className="w-4 h-4 text-primary" />{" "}
                        {activeOrg.name}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-muted-foreground uppercase">
                        Organization Type
                      </label>
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/40 border text-sm">
                        <Globe className="w-4 h-4 text-primary" /> {orgType}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 pt-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase">
                      Contact Email
                    </label>
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/40 border text-sm text-muted-foreground">
                      <Mail className="w-4 h-4" /> admin@
                      {activeOrg.name.toLowerCase().replace(/\s/g, "")}.com
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Account Status</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-semibold">Verified Organization</p>
                      <p className="text-sm text-muted-foreground">
                        Your business is fully verified and active.
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-green-500">Active</Badge>
                </CardContent>
              </Card>
            </div>
            <div className="space-y-6">
              <Card className="bg-primary text-primary-foreground">
                <CardHeader>
                  <CardTitle className="text-lg">Module Pulse</CardTitle>
                  <CardDescription className="text-primary-foreground/70">
                    Current workspace utilization.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">
                    {enabled.size} / {availableMetas.length}
                  </div>
                  <p className="text-sm opacity-80 mt-2">Active Modules</p>
                  <div className="mt-4 h-2 w-full bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white transition-all duration-500"
                      style={{
                        width: `${(enabled.size / availableMetas.length) * 100}%`,
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Modules Tab Content */}
          <TabsContent
            value="modules"
            className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="md:col-span-1 space-y-4">
                <h3 className="text-lg font-semibold">Features</h3>
                <p className="text-sm text-muted-foreground">
                  Enable or disable specific tools for your organization
                  workspace.
                </p>
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 space-y-3">
                  <div className="flex items-center gap-2 font-semibold text-sm">
                    <Zap className="w-4 h-4 fill-amber-500" />
                    Upgrade Required
                  </div>
                  <p className="text-xs leading-relaxed">
                    Some advanced modules require a Premium subscription to
                    unlock full capabilities.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full bg-white text-amber-700 border-amber-200 hover:bg-amber-100"
                    onClick={() => setActiveTab("billing")}
                  >
                    Check Pricing
                  </Button>
                </div>
              </div>

              <div className="md:col-span-3 space-y-12">
                {CATEGORIES.filter((c) =>
                  availableMetas.some((m) => c.modules.includes(m.id)),
                ).map((cat) => (
                  <div key={cat.id} className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-2">
                      <div className="flex items-center gap-2">
                        <cat.icon className="w-4 h-4 text-primary" />
                        <h4 className="font-bold">{cat.label}</h4>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {
                          availableMetas.filter(
                            (m) =>
                              cat.modules.includes(m.id) && enabled.has(m.id),
                          ).length
                        }{" "}
                        /{" "}
                        {
                          availableMetas.filter((m) =>
                            cat.modules.includes(m.id),
                          ).length
                        }{" "}
                        Active
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {availableMetas
                        .filter((m) => cat.modules.includes(m.id))
                        .map((meta) => (
                          <ModuleCard
                            key={meta.id}
                            meta={meta}
                            isEnabled={enabled.has(meta.id)}
                            isLocked={lockedModules.has(meta.id)}
                            canEdit={canEdit}
                            onToggle={() =>
                              setEnabled((prev) =>
                                toggleModule(meta.id, prev, availableMetas),
                              )
                            }
                          />
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Billing Tab Content */}
          <TabsContent
            value="billing"
            className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Subscription Plan</CardTitle>
                  <CardDescription>
                    Manage your current subscription and usage limits.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <Badge className="mb-2">Standard Plan</Badge>
                      <h3 className="text-2xl font-bold">
                        $49.00{" "}
                        <span className="text-sm font-normal text-muted-foreground">
                          / month
                        </span>
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Next billing date: July 15, 2026
                      </p>
                    </div>
                    <Button className="gap-2">
                      <Zap className="w-4 h-4 fill-current" /> Upgrade to Pro
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <CreditCard className="w-4 h-4" /> Payment Method
                    </h4>
                    <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/20">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-12 bg-white border rounded-md flex items-center justify-center font-bold text-blue-600 italic">
                          VISA
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            Visa ending in 4242
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Expires 12/28
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Billing Contact</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span>Billing Admin</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span>
                        billing@
                        {activeOrg.name.toLowerCase().replace(/\s/g, "")}.com
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>+1 (555) 000-0000</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" size="sm" className="w-full">
                      Update Info
                    </Button>
                  </CardFooter>
                </Card>

                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="pt-6 text-center">
                    <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Info className="w-6 h-6 text-primary" />
                    </div>
                    <h4 className="font-bold mb-1">Need help?</h4>
                    <p className="text-xs text-muted-foreground mb-4">
                      Contact our support team for custom enterprise pricing.
                    </p>
                    <Button
                      variant="link"
                      className="text-primary h-auto p-0 text-xs"
                    >
                      Contact Sales
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
