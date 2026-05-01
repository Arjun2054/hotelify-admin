import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  Plus,
  Settings2,
  Utensils,
  LayoutGrid,
  Building2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useFnbStore } from "@/store/fnb/fnb.store";
import type { FnbServiceType } from "@/types/fnb.types";
import { OrgServiceCard } from "@/components/fnb/updates/OrgServiceCard";
import { FnbSetupWizard } from "@/components/fnb/updates/FnbSetupWizard";
import { useAuthStore } from "@/store/useAuthStore";

// ── Empty state ────────────────────────────────────────────────────────────────
function EmptyState({ onSetup }: { onSetup: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-primary/10 to-primary/5 flex items-center justify-center border border-primary/10">
          <Utensils className="w-9 h-9 text-primary/60" />
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
          <Plus className="w-3.5 h-3.5 text-white" strokeWidth={3} />
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-900">
        No F&B services yet
      </h3>
      <p className="text-sm text-muted-foreground mt-2 mb-6 max-w-sm leading-relaxed">
        Add the food & beverage services your property offers — restaurant, bar,
        room service, and more.
      </p>

      {/* Service type preview */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {[
          { icon: "🍽️", label: "Restaurant" },
          { icon: "🥘", label: "Buffet" },
          { icon: "🍸", label: "Bar" },
          { icon: "🛋️", label: "Lounge" },
          { icon: "🛎️", label: "Room Service" },
          { icon: "🎉", label: "Banquet" },
        ].map((s) => (
          <span
            key={s.label}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-sm text-muted-foreground border"
          >
            {s.icon} {s.label}
          </span>
        ))}
      </div>

      <Button size="lg" onClick={onSetup} className="gap-2">
        <Settings2 className="w-4 h-4" />
        Set Up F&B Services
      </Button>
    </div>
  );
}

// ── Stats bar ──────────────────────────────────────────────────────────────────
function StatsBar({ created, enabled }: { created: number; enabled: number }) {
  return (
    <div className="flex flex-wrap gap-3">
      {[
        {
          label: "Services Added",
          value: created,
          badge: "bg-blue-100 text-blue-700",
        },
        {
          label: "Active",
          value: enabled,
          badge: "bg-green-100 text-green-700",
        },
        {
          label: "Inactive",
          value: created - enabled,
          badge: "bg-gray-100 text-gray-600",
        },
      ].map((s) => (
        <div
          key={s.label}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border shadow-sm"
        >
          <Badge className={cn("text-xs border-0 font-semibold", s.badge)}>
            {s.value}
          </Badge>
          <span className="text-sm text-muted-foreground">{s.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function FnbServicesPage() {
  // ── Auth Store ────────────────────────────────────────────
  const { getActiveOrganization, canPerformAction } = useAuthStore();

  const {
    services,
    isLoading,
    isSubmitting,
    isTogglingService,
    error,
    fetchServices,
    bulkCreateServices,
    toggleService,
    removeService,
    setError,
  } = useFnbStore();

  const [showWizard, setShowWizard] = useState(false);

  // ── Derived Identity ──────────────────────────────────────
  // role and department live in activeOrg, NOT in user object
  const activeOrg = getActiveOrganization();

  // Convenience flags
  const isManager = canPerformAction(["OWNER", "ADMIN"]);

  useEffect(() => {
    fetchServices();
  }, []);

  // Partition into created vs not-yet-created
  const created = services.filter((s) => s.isCreated);
  const notCreated = services.filter((s) => !s.isCreated);
  const enabledCount = created.filter((s) => s.isEnabled).length;

  const handleWizardConfirm = async (selectedTypes: FnbServiceType[]) => {
    try {
      const result = await bulkCreateServices(
        selectedTypes.map((type) => ({ type })),
      );
      const count = (result as any)?.created?.length ?? selectedTypes.length;
      toast.success(
        `${count} service${count !== 1 ? "s" : ""} added successfully`,
        { description: "You can now assign menus to each service." },
      );
      setShowWizard(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to add services");
    }
  };

  const handleToggle = async (serviceId: string) => {
    try {
      await toggleService(serviceId);
    } catch {
      toast.error("Failed to update service");
    }
  };

  const handleRemove = async (serviceId: string) => {
    try {
      await removeService(serviceId);
      toast.success("Service removed");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to remove service");
    }
  };

  if (isLoading && services.length === 0) {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <Skeleton className="h-7 w-52" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="flex gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-32 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // ── Guard: No Organization ────────────────────────────────
  if (!activeOrg) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-yellow-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            No Organization Selected
          </h2>
          <p className="text-gray-500 text-sm">
            Please select an organization to continue.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-primary" />
            F&B Services
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage the food & beverage services available at your property.
          </p>
        </div>

        {created.length > 0 && notCreated.length > 0 && isManager && (
          <Button
            onClick={() => setShowWizard(true)}
            className="gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add Services
          </Button>
        )}
      </div>

      {/* ── Error ───────────────────────────────────────────────────────────── */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <button
              className="underline text-xs ml-2"
              onClick={() => setError(null)}
            >
              Dismiss
            </button>
          </AlertDescription>
        </Alert>
      )}

      {/* ── Empty state ─────────────────────────────────────────────────────── */}
      {created.length === 0 && !isLoading ? (
        isManager ? (
          <EmptyState onSetup={() => setShowWizard(true)} />
        ) : (
          <ReadOnlyEmptyState /> // ← new component below
        )
      ) : (
        <>
          {/* Stats */}
          <StatsBar created={created.length} enabled={enabledCount} />

          {/* Service cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {created.map((entry) => (
              <OrgServiceCard
                key={entry.type}
                entry={entry}
                onToggle={handleToggle}
                onRemove={handleRemove}
                isToggling={
                  isTogglingService[entry.orgService?.id ?? ""] ?? false
                }
                isManager={isManager}
              />
            ))}

            {/* "Add more" card — shown when some types are still available */}
            {notCreated.length > 0 && isManager && (
              <button
                onClick={() => setShowWizard(true)}
                className={cn(
                  "rounded-xl border-2 border-dashed border-gray-200 p-6",
                  "flex flex-col items-center justify-center gap-3 text-center",
                  "text-muted-foreground hover:border-primary/40 hover:text-primary",
                  "hover:bg-primary/5 transition-all duration-200 min-h-44",
                )}
              >
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-sm">Add More Services</p>
                  <p className="text-xs mt-0.5">
                    {notCreated.length} service
                    {notCreated.length !== 1 ? "s" : ""} available
                  </p>
                </div>
              </button>
            )}
          </div>
        </>
      )}

      {/* ── Setup Wizard ─────────────────────────────────────────────────────── */}
      <FnbSetupWizard
        open={showWizard}
        onClose={() => setShowWizard(false)}
        onConfirm={handleWizardConfirm}
        alreadyCreated={created.map((s) => s.type)}
        isLoading={isSubmitting}
      />
    </div>
  );
}
// Drop inside FnbServicesPage.tsx above the page component
function ReadOnlyEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center border border-gray-200 mb-4">
        <Utensils className="w-7 h-7 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900">
        No F&B services configured
      </h3>
      <p className="text-sm text-muted-foreground mt-2 max-w-sm leading-relaxed">
        Your property has no food & beverage services set up yet. Contact an{" "}
        <strong>admin or owner</strong> to configure available services.
      </p>
    </div>
  );
}
