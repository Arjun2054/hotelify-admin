import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  Search,
  ChefHat,
  Filter,
  Lock,
  UtensilsCrossed,
  BookOpen,
  ShieldAlert,
} from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { toast } from "sonner";
import { useFnbStore } from "@/store/fnb/fnb.store";
import type { Menu } from "@/types/fnb.types";
import { MenuCard } from "@/components/fnb/updates/MenuCard";
import { MenuForm } from "@/components/fnb/updates/MenuForm";
import { useAuthStore } from "@/store/useAuthStore";
import { cn } from "@/lib/utils";

// ── Read-only empty state ─────────────────────────────────────────────────────
function ReadOnlyEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-stone-100 border border-stone-200 mb-5">
        <BookOpen className="w-7 h-7 text-stone-400" />
      </div>
      <h3
        className="font-semibold text-gray-800 mb-1"
        style={{ fontSize: "15px" }}
      >
        No menus available
      </h3>
      <p
        className="text-gray-400 max-w-xs leading-relaxed"
        style={{ fontSize: "12px" }}
      >
        No menus have been created for this property. Contact an{" "}
        <span className="font-semibold text-gray-500">admin or owner</span> to
        add menus.
      </p>
    </div>
  );
}

// ── Manager empty state ───────────────────────────────────────────────────────
function ManagerEmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-stone-100 border border-stone-200 mb-5">
        <UtensilsCrossed className="w-7 h-7 text-stone-400" />
      </div>
      <h3
        className="font-semibold text-gray-800 mb-1"
        style={{ fontSize: "15px" }}
      >
        No menus yet
      </h3>
      <p
        className="text-gray-400 max-w-xs leading-relaxed mb-5"
        style={{ fontSize: "12px" }}
      >
        Start by creating your first menu. You can assign it to services, set
        availability windows, and add items.
      </p>
      <Button
        onClick={onAdd}
        className="h-9 px-5 rounded-xl bg-stone-800 hover:bg-stone-700 text-white gap-2 shadow-sm"
        style={{ fontSize: "13px" }}
      >
        <Plus className="w-3.5 h-3.5" />
        Create First Menu
      </Button>
    </div>
  );
}

// ── Skeleton card ─────────────────────────────────────────────────────────────
function MenuSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden border border-gray-100 bg-white shadow-sm">
      <Skeleton className="h-36 w-full rounded-none" />
      <div className="p-4 space-y-2.5">
        <Skeleton className="h-4 w-2/3 rounded-lg" />
        <Skeleton className="h-3 w-full rounded-lg" />
        <Skeleton className="h-3 w-4/5 rounded-lg" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export default function MenusPage() {
  const navigate = useNavigate();

  // ── Auth ──────────────────────────────────────────────────────────────────
  const { canPerformAction } = useAuthStore();
  const isManager = canPerformAction(["OWNER", "ADMIN"]);

  // ── Store ─────────────────────────────────────────────────────────────────
  const {
    menus,
    services,
    fetchServices,
    isLoading,
    isSubmitting,
    menuFilters,
    fetchMenus,
    createMenu,
    updateMenu,
    deleteMenu,
    duplicateMenu,
    setMenuFilters,
  } = useFnbStore();

  const [showForm, setShowForm] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [searchValue, setSearchValue] = useState(menuFilters.search);
  const debouncedSearch = useDebounce(searchValue, 400);

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    setMenuFilters({ search: debouncedSearch });
  }, [debouncedSearch]);

  useEffect(() => {
    fetchMenus();
  }, [menuFilters.search, menuFilters.status, menuFilters.page]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleCreate = async (data: any) => {
    if (!isManager) return;
    try {
      await createMenu(data);
      toast.success("Menu created successfully");
      setShowForm(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Failed to create menu");
    }
  };

  const handleUpdate = async (data: any) => {
    if (!isManager || !editingMenu) return;
    try {
      await updateMenu(editingMenu.id, data);
      toast.success("Menu updated successfully");
      setEditingMenu(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Failed to update menu");
    }
  };

  const handleDelete = async (menuId: string) => {
    if (!isManager) return;
    try {
      await deleteMenu(menuId);
      toast.success("Menu deleted");
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Failed to delete menu");
    }
  };

  const handleDuplicate = async (menuId: string) => {
    if (!isManager) return;
    try {
      await duplicateMenu(menuId);
      toast.success("Menu duplicated successfully");
    } catch (err: any) {
      toast.error("Failed to duplicate menu");
    }
  };

  const handleEdit = (menu: Menu) => {
    if (!isManager) return;
    setEditingMenu(menu);
  };

  const handleView = (menu: Menu) => {
    navigate(`/fnb/menus/${menu.id}`);
  };

  const totalMenus = menus?.pagination.total ?? 0;
  const totalPages = menus?.pagination.totalPages ?? 1;
  const currentPage = menuFilters.page ?? 1;

  return (
    <div className="min-h-screen">
      {/* ── Hero header ─────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-linear-to-br from-stone-800 via-stone-700 to-stone-900 px-8 py-10">
        {/* Decorative blobs */}
        <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-20 -left-8 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute top-4 right-48 w-24 h-24 rounded-full bg-white/3 pointer-events-none" />

        <div className="relative flex items-start justify-between gap-6 flex-wrap">
          {/* Left: icon + title */}
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
                  Menu Management
                </p>
              </div>
              <h1
                className="font-bold text-white leading-tight tracking-tight"
                style={{ fontSize: "22px" }}
              >
                Dining Menus
              </h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <p
                  className="text-stone-300 leading-snug"
                  style={{ fontSize: "13px" }}
                >
                  {totalMenus} menu{totalMenus !== 1 ? "s" : ""} configured for
                  this property
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
          {isManager && (
            <Button
              onClick={() => setShowForm(true)}
              className={cn(
                "h-9 px-5 rounded-xl gap-2 shadow-md shrink-0",
                "bg-white text-stone-800 hover:bg-stone-50 font-semibold",
              )}
              style={{ fontSize: "13px" }}
            >
              <Plus className="w-3.5 h-3.5" />
              New Menu
            </Button>
          )}
        </div>

        {/* ── Stat strip ──────────────────────────────────────────────────── */}
        <div className="relative mt-7 flex items-center gap-3 flex-wrap">
          {[
            {
              label: "Total Menus",
              value: totalMenus,
            },
            {
              label: "Active",
              value:
                menus?.data.filter((m) => m.status === "ACTIVE").length ?? 0,
            },
            {
              label: "Inactive",
              value:
                menus?.data.filter((m) => m.status === "INACTIVE").length ?? 0,
            },
            {
              label: "Archived",
              value:
                menus?.data.filter((m) => m.status === "ARCHIVED").length ?? 0,
            },
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
      </div>

      {/* ── Body ────────────────────────────────────────────────────────────── */}
      <div className="px-8 py-6 space-y-5">
        {/* Read-only banner */}
        {!isManager && (
          <div
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl",
              "bg-amber-50 border border-amber-200/70",
            )}
          >
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-100 shrink-0">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
            </span>
            <p
              className="text-amber-700 leading-snug"
              style={{ fontSize: "12px" }}
            >
              You have <span className="font-semibold">view-only</span> access.
              Contact an <span className="font-semibold">admin or owner</span>{" "}
              to create or modify menus.
            </p>
          </div>
        )}

        {/* ── Filter bar ──────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <Input
              placeholder="Search menus…"
              className={cn(
                "pl-9 h-9 rounded-xl border-gray-200 bg-white shadow-sm",
                "focus-visible:ring-stone-400/30 text-sm",
              )}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>

          {/* Status filter */}
          <Select
            value={menuFilters.status || "all"}
            onValueChange={(v) =>
              setMenuFilters({ status: v === "all" ? "" : v, page: 1 })
            }
          >
            <SelectTrigger
              className={cn(
                "w-44 h-9 rounded-xl border-gray-200 bg-white shadow-sm",
                "focus:ring-stone-400/30",
              )}
              style={{ fontSize: "13px" }}
            >
              <Filter className="w-3.5 h-3.5 mr-2 text-gray-400" />
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-gray-100 shadow-lg">
              <SelectItem value="all" style={{ fontSize: "13px" }}>
                All Status
              </SelectItem>
              <SelectItem value="ACTIVE" style={{ fontSize: "13px" }}>
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Active
                </span>
              </SelectItem>
              <SelectItem value="INACTIVE" style={{ fontSize: "13px" }}>
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  Inactive
                </span>
              </SelectItem>
              <SelectItem value="ARCHIVED" style={{ fontSize: "13px" }}>
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                  Archived
                </span>
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Result count */}
          {!isLoading && (menus?.data.length ?? 0) > 0 && (
            <span
              className="ml-auto text-gray-400 font-medium"
              style={{ fontSize: "12px" }}
            >
              Showing {menus?.data.length} of {totalMenus}
            </span>
          )}
        </div>

        {/* ── Grid ────────────────────────────────────────────────────────── */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <MenuSkeleton key={i} />
            ))}
          </div>
        ) : (menus?.data.length ?? 0) === 0 ? (
          isManager ? (
            <ManagerEmptyState onAdd={() => setShowForm(true)} />
          ) : (
            <ReadOnlyEmptyState />
          )
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {menus?.data.map((menu) => (
              <MenuCard
                key={menu.id}
                menu={menu}
                isManager={isManager}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onDuplicate={handleDuplicate}
                onView={handleView}
              />
            ))}
          </div>
        )}

        {/* ── Pagination ──────────────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setMenuFilters({ page: currentPage - 1 })}
              className="h-8 px-4 rounded-xl border-gray-200 bg-white shadow-sm text-gray-600 hover:bg-stone-50"
              style={{ fontSize: "12px" }}
            >
              Previous
            </Button>

            {/* Page number pills */}
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (p) =>
                    p === 1 ||
                    p === totalPages ||
                    Math.abs(p - currentPage) <= 1,
                )
                .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1)
                    acc.push("…");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, idx) =>
                  p === "…" ? (
                    <span
                      key={`ellipsis-${idx}`}
                      className="w-8 text-center text-gray-400"
                      style={{ fontSize: "12px" }}
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setMenuFilters({ page: p as number })}
                      className={cn(
                        "w-8 h-8 rounded-lg font-medium transition-all",
                        currentPage === p
                          ? "bg-stone-800 text-white shadow-sm"
                          : "text-gray-500 hover:bg-stone-100",
                      )}
                      style={{ fontSize: "12px" }}
                    >
                      {p}
                    </button>
                  ),
                )}
            </div>

            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setMenuFilters({ page: currentPage + 1 })}
              className="h-8 px-4 rounded-xl border-gray-200 bg-white shadow-sm text-gray-600 hover:bg-stone-50"
              style={{ fontSize: "12px" }}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* ── Forms ───────────────────────────────────────────────────────────── */}
      {isManager && (
        <>
          <MenuForm
            open={showForm}
            onClose={() => setShowForm(false)}
            onSubmit={handleCreate}
            orgServices={services}
            isLoading={isSubmitting}
          />
          <MenuForm
            open={!!editingMenu}
            onClose={() => setEditingMenu(null)}
            onSubmit={handleUpdate}
            menu={editingMenu}
            orgServices={services}
            isLoading={isSubmitting}
          />
        </>
      )}
    </div>
  );
}
