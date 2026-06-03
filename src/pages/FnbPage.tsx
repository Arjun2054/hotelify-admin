import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  Plus,
  Settings2,
  Utensils,
  LayoutGrid,
  Building2,
  ShieldAlert,
  Lock,
  ChefHat,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useFnbStore } from "@/store/fnb/fnb.store";
import type { FnbServiceType } from "@/types/fnb.types";
import { OrgServiceCard } from "@/components/fnb/updates/OrgServiceCard";
import { FnbSetupWizard } from "@/components/fnb/updates/FnbSetupWizard";
import { useAuthStore } from "@/store/useAuthStore";

// ── Read-only empty state ─────────────────────────────────────────────────────
function ReadOnlyEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-stone-100 border border-stone-200 mb-5">
        <Utensils className="w-7 h-7 text-stone-400" />
      </div>
      <h3
        className="font-semibold text-gray-800 mb-1"
        style={{ fontSize: "15px" }}
      >
        No F&B services configured
      </h3>
      <p
        className="text-gray-400 max-w-xs leading-relaxed"
        style={{ fontSize: "12px" }}
      >
        Your property has no food & beverage services set up yet. Contact an{" "}
        <span className="font-semibold text-gray-500">admin or owner</span> to
        configure available services.
      </p>
    </div>
  );
}

// ── Manager empty state ───────────────────────────────────────────────────────
function EmptyState({ onSetup }: { onSetup: () => void }) {
  const serviceTypes = [
    { icon: "🍽️", label: "Restaurant" },
    { icon: "🥘", label: "Buffet" },
    { icon: "🍸", label: "Bar & Lounge" },
    { icon: "🛎️", label: "Room Service" },
    { icon: "🎉", label: "Banquet" },
    { icon: "☕", label: "Café" },
  ];

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center px-6">
      {/* Icon cluster */}
      <div className="relative mb-7">
        <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-stone-100 border border-stone-200">
          <ChefHat className="w-9 h-9 text-stone-500" />
        </div>
        <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-7 h-7 rounded-full bg-stone-800 border-2 border-white shadow-sm">
          <Plus className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
        </span>
      </div>

      <h3 className="font-bold text-gray-800 mb-2" style={{ fontSize: "18px" }}>
        No F&B Services Yet
      </h3>
      <p
        className="text-gray-400 max-w-sm leading-relaxed mb-7"
        style={{ fontSize: "13px" }}
      >
        Add the food & beverage services your property offers — restaurant, bar,
        room service, and more.
      </p>

      {/* Service type preview chips */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {serviceTypes.map((s) => (
          <span
            key={s.label}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full",
              "bg-white border border-gray-200 text-gray-500 shadow-sm",
            )}
            style={{ fontSize: "12px" }}
          >
            <span style={{ fontSize: "14px" }}>{s.icon}</span>
            {s.label}
          </span>
        ))}
      </div>

      <Button
        onClick={onSetup}
        className="h-10 px-6 rounded-xl bg-stone-800 hover:bg-stone-700 text-white gap-2 shadow-sm font-semibold"
        style={{ fontSize: "13px" }}
      >
        <Settings2 className="w-4 h-4" />
        Set Up F&B Services
      </Button>
    </div>
  );
}

// ── No-org guard ──────────────────────────────────────────────────────────────
function NoOrgState() {
  return (
    <div className="min-h-screen bg-[#f9f7f4] flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-10 max-w-md w-full text-center">
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 mx-auto mb-5">
          <Building2 className="w-7 h-7 text-amber-600" />
        </div>
        <h2
          className="font-bold text-gray-800 mb-2"
          style={{ fontSize: "16px" }}
        >
          No Organization Selected
        </h2>
        <p className="text-gray-400" style={{ fontSize: "12px" }}>
          Please select an organization to continue.
        </p>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function FnbServicesPage() {
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

  const activeOrg = getActiveOrganization();
  const isManager = canPerformAction(["OWNER", "ADMIN"]);

  useEffect(() => {
    fetchServices();
  }, []);

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

  // ── Guards ────────────────────────────────────────────────────────────────
  if (!activeOrg) return <NoOrgState />;

  if (isLoading && services.length === 0) {
    return (
      <div className="min-h-screen bg-[#f9f7f4]">
        {/* Hero skeleton */}
        <div className="bg-linear-to-br from-stone-800 to-stone-900 px-8 py-10">
          <div className="space-y-3">
            <Skeleton className="h-3 w-48 bg-white/10 rounded-full" />
            <Skeleton className="h-7 w-64 bg-white/10 rounded-lg" />
            <Skeleton className="h-4 w-80 bg-white/10 rounded-lg" />
            <div className="flex gap-3 pt-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-12 w-28 rounded-xl bg-white/10"
                />
              ))}
            </div>
          </div>
        </div>
        <div className="px-8 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen">
      {/* ── Hero header ─────────────────────────────────────────────────────── */}
      <div className="relative shrink-0 bg-linear-to-r from-primary via-primary/90 to-primary/75 px-10 py-7 text-primary-foreground overflow-hidden">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-10 -right-10 h-48 w-48 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-8 right-24 h-32 w-32 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute top-4 right-64 h-16 w-16 rounded-full bg-white/5" />

        <div className="relative flex items-start justify-between gap-6 flex-wrap">
          {/* Left: icon + title */}
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm shrink-0">
              <LayoutGrid className="w-6 h-6 text-white" />
            </div>

            <div>
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 mb-1">
                <p
                  className="uppercase tracking-widest font-semibold text-stone-400"
                  style={{ fontSize: "10px" }}
                >
                  Food &amp; Beverage
                </p>
                <span className="w-1 h-1 rounded-full bg-stone-500" />
                <p
                  className="uppercase tracking-widest font-semibold text-stone-400"
                  style={{ fontSize: "10px" }}
                >
                  Services
                </p>
              </div>

              <h1
                className="font-bold text-white leading-tight tracking-tight"
                style={{ fontSize: "22px" }}
              >
                F&amp;B Services
              </h1>

              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <p
                  className="text-stone-300 leading-snug"
                  style={{ fontSize: "13px" }}
                >
                  Manage the food & beverage services at your property
                </p>

                {/* Role pill */}
                {!isManager && (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full",
                      "bg-amber-400/20 border border-amber-400/30 text-amber-300 font-medium",
                    )}
                    style={{ fontSize: "10px" }}
                  >
                    <Lock className="w-2.5 h-2.5" />
                    View only
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: CTA */}
          {created.length > 0 && notCreated.length > 0 && isManager && (
            <Button
              onClick={() => setShowWizard(true)}
              className="h-9 px-5 rounded-xl gap-2 bg-white text-stone-800 hover:bg-stone-50 font-semibold shadow-md shrink-0"
              style={{ fontSize: "13px" }}
            >
              <Plus className="w-3.5 h-3.5" />
              Add Services
            </Button>
          )}
        </div>

        {/* ── Stat strip ────────────────────────────────────────────────── */}
        {created.length > 0 && (
          <div className="relative mt-7 flex items-center gap-3 flex-wrap">
            {[
              { label: "Services Added", value: created.length },
              { label: "Active", value: enabledCount },
              { label: "Inactive", value: created.length - enabledCount },
              { label: "Available to Add", value: notCreated.length },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white/10 border border-white/15 backdrop-blur-sm"
              >
                <span
                  className="font-bold text-white leading-none"
                  style={{ fontSize: "15px" }}
                >
                  {stat.value}
                </span>
                <span
                  className="text-stone-300 leading-none"
                  style={{ fontSize: "11px" }}
                >
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Body ────────────────────────────────────────────────────────────── */}
      <div className="px-8 py-6 space-y-5">
        {/* Error banner */}
        {error && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200/70">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-red-100 shrink-0">
              <AlertCircle className="w-4 h-4 text-red-600" />
            </span>
            <p className="text-red-700 flex-1" style={{ fontSize: "12px" }}>
              {error}
            </p>
            <button
              className="text-red-500 hover:text-red-700 underline shrink-0 transition-colors"
              style={{ fontSize: "11px" }}
              onClick={() => setError(null)}
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Read-only banner */}
        {!isManager && created.length > 0 && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200/70">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-100 shrink-0">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
            </span>
            <p
              className="text-amber-700 leading-snug"
              style={{ fontSize: "12px" }}
            >
              You have <span className="font-semibold">view-only</span> access.
              Contact an <span className="font-semibold">admin or owner</span>{" "}
              to manage services.
            </p>
          </div>
        )}

        {/* ── Empty state ────────────────────────────────────────────────── */}
        {created.length === 0 && !isLoading ? (
          isManager ? (
            <EmptyState onSetup={() => setShowWizard(true)} />
          ) : (
            <ReadOnlyEmptyState />
          )
        ) : (
          <>
            {/* ── Section label ──────────────────────────────────────────── */}
            <div className="flex items-center gap-2">
              <p
                className="uppercase tracking-widest font-semibold text-gray-400"
                style={{ fontSize: "10px" }}
              >
                Configured Services
              </p>
              <div className="flex-1 h-px bg-gray-200" />
              <span
                className="px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-400 font-medium shadow-sm"
                style={{ fontSize: "10px" }}
              >
                {created.length}
              </span>
            </div>

            {/* ── Service cards grid ─────────────────────────────────────── */}
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

              {/* "Add more" card */}
              {notCreated.length > 0 && isManager && (
                <button
                  onClick={() => setShowWizard(true)}
                  className={cn(
                    "group rounded-2xl border-2 border-dashed border-stone-200 p-6",
                    "flex flex-col items-center justify-center gap-3 text-center",
                    "hover:border-stone-400 hover:bg-stone-50",
                    "transition-all duration-200 min-h-44",
                  )}
                >
                  <div
                    className={cn(
                      "flex items-center justify-center w-10 h-10 rounded-xl",
                      "bg-stone-100 group-hover:bg-stone-200 transition-colors",
                    )}
                  >
                    <Plus className="w-5 h-5 text-stone-500" />
                  </div>
                  <div>
                    <p
                      className="font-semibold text-stone-500 group-hover:text-stone-700 transition-colors"
                      style={{ fontSize: "13px" }}
                    >
                      Add More Services
                    </p>
                    <p
                      className="text-stone-400 mt-0.5"
                      style={{ fontSize: "11px" }}
                    >
                      {notCreated.length} service
                      {notCreated.length !== 1 ? "s" : ""} available
                    </p>
                  </div>
                </button>
              )}
            </div>

            {/* ── Informational footer note ──────────────────────────────── */}
            {created.length > 0 && (
              <div
                className={cn(
                  "flex items-start gap-3 px-4 py-3 rounded-xl",
                  "bg-white border border-gray-100 shadow-sm",
                )}
              >
                <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-stone-100 shrink-0 mt-0.5">
                  <ChefHat className="w-3.5 h-3.5 text-stone-500" />
                </div>
                <div>
                  <p
                    className="font-semibold text-gray-700"
                    style={{ fontSize: "12px" }}
                  >
                    Assigning Menus
                  </p>
                  <p
                    className="text-gray-400 mt-0.5"
                    style={{ fontSize: "11px" }}
                  >
                    Navigate to{" "}
                    <span className="font-medium text-gray-500">
                      Menus → Create / Edit Menu
                    </span>{" "}
                    and assign it to one or more of these services. Guests will
                    see the menu under the respective service outlet.
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Setup Wizard ──────────────────────────────────────────────────── */}
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
