import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen,
  ExternalLink,
  LayoutGrid,
  RefreshCw,
  Star,
  Tag,
  UtensilsCrossed,
  Zap,
  AlertCircle,
  Layers,
  ChefHat,
  Copy,
  ArrowRight,
} from "lucide-react";
import { format } from "date-fns";
import { useFnbOverviewStore } from "@/store/fnb/fnbOverview.store";
import { StatCard } from "@/components/fnb/overview/FnbStatCard";
import { MenuStatusGrid } from "@/components/fnb/overview/MenuStatusGrid";
import { RecentItems } from "@/components/fnb/overview/RecentItems";
import { ItemStatusChart } from "@/components/fnb/overview/ItemStatusChart";
import { ServiceBreakdown } from "@/components/fnb/overview/ServiceBreakdown";
import { cn } from "@/lib/utils";

const ORDER_PAGE_URL =
  import.meta.env.VITE_ORDER_PAGE_URL ?? "https://order.yourdomain.com";

// ── Skeleton ──────────────────────────────────────────────────────────────────
function PageSkeleton() {
  return (
    <div className="min-h-screen bg-[#f9f7f4]">
      {/* Hero skeleton */}
      <div className="bg-linear-to-br from-stone-800 to-stone-900 px-8 py-10">
        <div className="space-y-3">
          <Skeleton className="h-3 w-48 bg-white/10 rounded-full" />
          <Skeleton className="h-7 w-64 bg-white/10 rounded-lg" />
          <Skeleton className="h-4 w-80 bg-white/10 rounded-lg" />
          <div className="flex gap-3 pt-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-28 rounded-xl bg-white/10" />
            ))}
          </div>
        </div>
      </div>
      {/* Body skeleton */}
      <div className="px-8 py-6 space-y-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Section label ─────────────────────────────────────────────────────────────
function SectionLabel({ label, count }: { label: string; count?: number }) {
  return (
    <div className="flex items-center gap-2">
      <p
        className="uppercase tracking-widest font-semibold text-gray-400"
        style={{ fontSize: "10px" }}
      >
        {label}
      </p>
      <div className="flex-1 h-px bg-gray-200" />
      {count !== undefined && (
        <span
          className="px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-400 font-medium shadow-sm"
          style={{ fontSize: "10px" }}
        >
          {count}
        </span>
      )}
    </div>
  );
}

// ── Quick-nav pill ────────────────────────────────────────────────────────────
function QuickLink({
  label,
  icon: Icon,
  onClick,
}: {
  label: string;
  icon: React.ElementType;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 px-3.5 py-2 rounded-xl",
        "bg-white border border-gray-200 shadow-sm",
        "text-gray-600 hover:text-stone-800 hover:border-stone-300 hover:bg-stone-50",
        "transition-all duration-150 font-medium",
      )}
      style={{ fontSize: "12px" }}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
      <ArrowRight className="w-3 h-3 text-gray-300" />
    </button>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function FnbOverviewPage() {
  const navigate = useNavigate();
  const { stats, isLoading, error, lastFetched, fetchOverview, refresh } =
    useFnbOverviewStore();

  useEffect(() => {
    fetchOverview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const orderPageUrl = ORDER_PAGE_URL;

  if (isLoading && !stats) return <PageSkeleton />;

  return (
    <div className="min-h-screen">
      {/* ── Hero header ─────────────────────────────────────────────────────── */}
      <div className="relative shrink-0 bg-linear-to-r from-primary via-primary/90 to-primary/75 px-10 py-7 text-primary-foreground overflow-hidden">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-10 -right-10 h-48 w-48 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-8 right-24 h-32 w-32 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute top-4 right-64 h-16 w-16 rounded-full bg-white/5" />

        <div className="relative flex items-start justify-between gap-6 flex-wrap">
          {/* Left */}
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm shrink-0">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <div>
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
                  Overview
                </p>
              </div>
              <h1
                className="font-bold text-white leading-tight tracking-tight"
                style={{ fontSize: "22px" }}
              >
                F&amp;B Overview
              </h1>
              <p className="text-stone-300 mt-1" style={{ fontSize: "13px" }}>
                Real-time summary of your food &amp; beverage operations
                {lastFetched && (
                  <span className="ml-2 text-stone-400">
                    · Updated {format(lastFetched, "h:mm a")}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => window.open(orderPageUrl, "_blank")}
              className={cn(
                "h-9 px-4 rounded-xl flex items-center gap-2",
                "bg-white/10 hover:bg-white/20 text-white border border-white/15",
                "font-medium transition-colors",
              )}
              style={{ fontSize: "13px" }}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Customer Order Page
            </button>

            <button
              onClick={() => refresh()}
              disabled={isLoading}
              className={cn(
                "h-9 w-9 flex items-center justify-center rounded-xl",
                "bg-white/10 hover:bg-white/20 text-white border border-white/15",
                "transition-colors disabled:opacity-50",
              )}
              title="Refresh"
            >
              <RefreshCw
                className={cn("w-4 h-4", isLoading && "animate-spin")}
              />
            </button>
          </div>
        </div>

        {/* ── Stat strip inside hero ─────────────────────────────────────── */}
        {stats && (
          <div className="relative mt-7 flex items-center gap-3 flex-wrap">
            {[
              {
                label: "Active Services",
                value: stats.activeServices,
                icon: LayoutGrid,
              },
              {
                label: "Active Menus",
                value: stats.activeMenus,
                icon: BookOpen,
              },
              {
                label: "Menu Items",
                value: stats.totalItems,
                icon: UtensilsCrossed,
              },
              {
                label: "Sections",
                value: stats.totalSections,
                icon: Layers,
              },
            ].map((s) => (
              <div
                key={s.label}
                className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white/10 border border-white/15 backdrop-blur-sm"
              >
                <s.icon className="w-3.5 h-3.5 text-stone-300 shrink-0" />
                <span
                  className="font-bold text-white leading-none"
                  style={{ fontSize: "15px" }}
                >
                  {s.value}
                </span>
                <span
                  className="text-stone-300 leading-none"
                  style={{ fontSize: "11px" }}
                >
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Body ────────────────────────────────────────────────────────────── */}
      <div className="px-8 py-6 space-y-6">
        {/* Error banner */}
        {error && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200/70">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-red-100 shrink-0">
              <AlertCircle className="w-4 h-4 text-red-600" />
            </span>
            <p className="text-red-700 flex-1" style={{ fontSize: "12px" }}>
              {error}
            </p>
          </div>
        )}

        {/* Quick nav links */}
        <div className="flex flex-wrap gap-2">
          {[
            { label: "Services", icon: LayoutGrid, path: "/fnb/services" },
            { label: "Menus", icon: BookOpen, path: "/fnb/menus" },
            { label: "Settings", icon: Tag, path: "/fnb/settings" },
          ].map((link) => (
            <QuickLink
              key={link.label}
              label={link.label}
              icon={link.icon}
              onClick={() => navigate(link.path)}
            />
          ))}
        </div>

        {stats ? (
          <>
            {/* Primary stats */}
            <div className="space-y-3">
              <SectionLabel label="Service & Menu Overview" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard
                  label="Active Services"
                  value={stats.activeServices}
                  sub={`of ${stats.totalServices} total`}
                  icon={LayoutGrid}
                  iconColor="text-blue-600"
                  iconBg="bg-blue-50"
                />
                <StatCard
                  label="Active Menus"
                  value={stats.activeMenus}
                  sub={`of ${stats.totalMenus} total`}
                  icon={BookOpen}
                  iconColor="text-violet-600"
                  iconBg="bg-violet-50"
                />
                <StatCard
                  label="Menu Items"
                  value={stats.totalItems}
                  sub={`${stats.availableItems} available`}
                  icon={UtensilsCrossed}
                  iconColor="text-orange-600"
                  iconBg="bg-orange-50"
                />
                <StatCard
                  label="Sections"
                  value={stats.totalSections}
                  sub="across all menus"
                  icon={Layers}
                  iconColor="text-teal-600"
                  iconBg="bg-teal-50"
                />
              </div>
            </div>

            {/* Secondary stats */}
            <div className="space-y-3">
              <SectionLabel label="Item Highlights & Taxonomy" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard
                  label="Signature Items"
                  value={stats.signatureItems}
                  icon={Star}
                  iconColor="text-amber-500"
                  iconBg="bg-amber-50"
                />
                <StatCard
                  label="Featured Items"
                  value={stats.featuredItems}
                  icon={Zap}
                  iconColor="text-blue-500"
                  iconBg="bg-blue-50"
                />
                <StatCard
                  label="Categories"
                  value={stats.totalCategories}
                  icon={Tag}
                  iconColor="text-green-600"
                  iconBg="bg-green-50"
                />
                <StatCard
                  label="Dietary Tags"
                  value={stats.totalDietaryTags}
                  icon={Tag}
                  iconColor="text-pink-600"
                  iconBg="bg-pink-50"
                />
              </div>
            </div>

            {/* Main grid */}
            <div className="space-y-3">
              <SectionLabel label="Operational Detail" />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Left column */}
                <div className="lg:col-span-2 space-y-4">
                  {/* Wrap child components in white card shells */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <MenuStatusGrid menus={stats.menuStats} />
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <RecentItems items={stats.recentItems} />
                  </div>
                </div>

                {/* Right column */}
                <div className="space-y-4">
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <ItemStatusChart
                      available={stats.availableItems}
                      outOfStock={stats.outOfStockItems}
                      discontinued={stats.discontinuedItems}
                    />
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <ServiceBreakdown
                      services={stats.serviceStats}
                      totalItems={stats.totalItems}
                    />
                  </div>

                  {/* Order page card */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
                    {/* Header */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-stone-100 border border-stone-200 shrink-0 text-xl">
                        📱
                      </div>
                      <div>
                        <p
                          className="font-semibold text-gray-800"
                          style={{ fontSize: "13px" }}
                        >
                          Customer Order Page
                        </p>
                        <p
                          className="text-gray-400 mt-0.5"
                          style={{ fontSize: "11px" }}
                        >
                          Share with guests to browse your menus
                        </p>
                      </div>
                    </div>

                    {/* URL row */}
                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2">
                      <code
                        className="flex-1 text-gray-500 truncate"
                        style={{ fontSize: "10px" }}
                      >
                        {orderPageUrl}
                      </code>
                      <button
                        onClick={() =>
                          navigator.clipboard.writeText(orderPageUrl)
                        }
                        className="shrink-0 h-7 px-2.5 rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-stone-800 hover:border-stone-300 transition-colors font-medium"
                        style={{ fontSize: "11px" }}
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>

                    {/* CTA */}
                    <button
                      onClick={() => window.open(orderPageUrl, "_blank")}
                      className="w-full h-9 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
                      style={{ fontSize: "13px" }}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Open Order Page
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          !isLoading && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-stone-100 border border-stone-200 mb-5">
                <UtensilsCrossed className="w-7 h-7 text-stone-400" />
              </div>
              <p
                className="font-semibold text-gray-800 mb-1"
                style={{ fontSize: "15px" }}
              >
                No data available
              </p>
              <p className="text-gray-400 mb-5" style={{ fontSize: "12px" }}>
                Could not load F&amp;B overview. Please try again.
              </p>
              <button
                onClick={() => fetchOverview()}
                className="h-9 px-5 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-semibold shadow-sm transition-colors"
                style={{ fontSize: "13px" }}
              >
                Retry
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}
