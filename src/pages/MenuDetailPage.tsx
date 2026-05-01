import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useFnbStore } from "../store/fnb/fnb.store";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Plus,
  Search,
  ChevronDown,
  Trash2,
  CheckSquare,
  Layers,
  X,
  UtensilsCrossed,
  Edit2,
  RefreshCw,
  Lock,
  ShieldAlert,
  ChefHat,
  BookOpen,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import type { MenuItem } from "@/types/fnb.types";
import { MenuItemCard } from "@/components/fnb/updates/MenuItemCard";
import { MenuItemForm } from "@/components/fnb/updates/MenuItemForm";
import { useAuthStore } from "@/store/useAuthStore";
import { cn } from "@/lib/utils";

// ── Skeleton item ─────────────────────────────────────────────────────────────
function ItemSkeleton() {
  return (
    <div className="flex gap-3 p-3 rounded-xl border border-gray-100 bg-white shadow-sm">
      <Skeleton className="w-4 h-4 rounded mt-0.5 shrink-0" />
      <Skeleton className="w-[72px] h-[72px] rounded-lg shrink-0" />
      <div className="flex-1 space-y-2 py-1">
        <Skeleton className="h-3.5 w-1/3 rounded-lg" />
        <Skeleton className="h-3 w-2/3 rounded-lg" />
        <Skeleton className="h-3 w-1/2 rounded-lg" />
      </div>
    </div>
  );
}

export default function MenuDetailPage() {
  const { menuId } = useParams<{ menuId: string }>();
  const safeMenuId = menuId ?? "";
  const navigate = useNavigate();
  const isFirstRender = useRef(true);

  // ── Auth ──────────────────────────────────────────────────────────────────
  const { canPerformAction } = useAuthStore();
  const isManager = canPerformAction(["OWNER", "ADMIN"]);

  // ── Store ─────────────────────────────────────────────────────────────────
  const {
    currentMenu,
    items,
    sections,
    categories,
    dietaryTags,
    menus,
    isLoading,
    isLoadingItems,
    isSubmitting,
    selectedItems,
    itemFilters,
    fetchMenuById,
    fetchItems,
    fetchSections,
    fetchCategories,
    fetchDietaryTags,
    fetchMenus,
    createItem,
    updateItem,
    deleteItem,
    bulkUpdateStatus,
    createSection,
    updateSection,
    deleteSection,
    toggleSelectItem,
    clearSelection,
    setItemFilters,
  } = useFnbStore();

  // ── Local UI state ────────────────────────────────────────────────────────
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [showSectionDialog, setShowSectionDialog] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");
  const [newSectionDesc, setNewSectionDesc] = useState("");
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingSectionName, setEditingSectionName] = useState("");
  const [localSearch, setLocalSearch] = useState("");
  const [localStatus, setLocalStatus] = useState("all");

  // ── Guard ─────────────────────────────────────────────────────────────────
  if (!safeMenuId) {
    return (
      <div className="min-h-screen bg-[#f9f7f4] flex flex-col items-center justify-center py-24 text-center px-6">
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-stone-100 border border-stone-200 mb-5">
          <UtensilsCrossed className="w-7 h-7 text-stone-400" />
        </div>
        <h3
          className="font-semibold text-gray-800 mb-1"
          style={{ fontSize: "15px" }}
        >
          Menu not found
        </h3>
        <p className="text-gray-400 mb-5" style={{ fontSize: "12px" }}>
          The menu you're looking for doesn't exist or has been removed.
        </p>
        <Button
          onClick={() => navigate("/fnb/menus")}
          className="h-9 px-5 rounded-xl bg-stone-800 hover:bg-stone-700 text-white"
          style={{ fontSize: "13px" }}
        >
          Back to Menus
        </Button>
      </div>
    );
  }

  // ── Mount ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    isFirstRender.current = true;
    setItemFilters({ menuId: safeMenuId, status: "", page: 1 });
    fetchMenuById(safeMenuId);
    fetchSections(safeMenuId);
    fetchCategories();
    fetchDietaryTags();
    fetchMenus();
    fetchItems({ menuId: safeMenuId, status: "", page: 1 });
    return () => {
      setItemFilters({ menuId: "", page: 1, status: "" });
      clearSelection();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeMenuId]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    fetchItems({
      menuId: safeMenuId,
      status: itemFilters.status,
      page: itemFilters.page,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemFilters.page, itemFilters.status]);

  // ── Derived data ──────────────────────────────────────────────────────────
  const allItems: MenuItem[] = items?.data ?? [];
  const totalItems: number = items?.pagination?.total ?? 0;
  const totalPages = items?.pagination?.totalPages ?? 1;
  const currentPage = itemFilters.page ?? 1;

  const filteredItems = allItems.filter((item) => {
    const q = localSearch.toLowerCase();
    const matchSearch = !localSearch
      ? true
      : item.name.toLowerCase().includes(q) ||
        (item.description ?? "").toLowerCase().includes(q) ||
        (item.sku ?? "").toLowerCase().includes(q);
    const matchStatus =
      localStatus === "all" ? true : item.status === localStatus;
    return matchSearch && matchStatus;
  });

  const itemsBySection = sections.reduce<Record<string, MenuItem[]>>(
    (acc, section) => {
      acc[section.id] = filteredItems.filter(
        (item) => item.sectionId === section.id,
      );
      return acc;
    },
    {},
  );
  const unsectionedItems = filteredItems.filter((item) => !item.sectionId);

  // ── Status config ─────────────────────────────────────────────────────────
  const menuStatusConfig: Record<
    string,
    { dot: string; label: string; className: string }
  > = {
    ACTIVE: {
      dot: "bg-emerald-500",
      label: "Active",
      className: "bg-emerald-50 border-emerald-200 text-emerald-700",
    },
    INACTIVE: {
      dot: "bg-amber-400",
      label: "Inactive",
      className: "bg-amber-50 border-amber-200 text-amber-700",
    },
    ARCHIVED: {
      dot: "bg-gray-400",
      label: "Archived",
      className: "bg-gray-100 border-gray-200 text-gray-500",
    },
  };
  const statusConf = currentMenu?.status
    ? menuStatusConfig[currentMenu.status]
    : null;

  // ── Item handlers ─────────────────────────────────────────────────────────
  const handleCreateItem = async (data: any) => {
    if (!isManager) return;
    try {
      await createItem({ ...data, menuId: safeMenuId });
      toast.success("Item added");
      setShowItemForm(false);
      await fetchItems({
        menuId: safeMenuId,
        status: itemFilters.status,
        page: 1,
      });
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ?? err?.message ?? "Failed to add item",
      );
    }
  };

  const handleUpdateItem = async (data: any) => {
    if (!isManager || !editingItem) return;
    try {
      await updateItem(editingItem.id, data);
      toast.success("Item updated");
      setEditingItem(null);
      await fetchItems({
        menuId: safeMenuId,
        status: itemFilters.status,
        page: itemFilters.page,
      });
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ?? err?.message ?? "Failed to update item",
      );
    }
  };

  const handleConfirmDelete = async () => {
    if (!isManager || !deletingItemId) return;
    try {
      await deleteItem(deletingItemId);
      toast.success("Item deleted");
      await fetchItems({
        menuId: safeMenuId,
        status: itemFilters.status,
        page: 1,
      });
    } catch {
      toast.error("Failed to delete item");
    } finally {
      setDeletingItemId(null);
    }
  };

  const handleStatusChange = async (
    itemId: string,
    status: "AVAILABLE" | "OUT_OF_STOCK" | "DISCONTINUED",
  ) => {
    if (!isManager) return;
    try {
      await bulkUpdateStatus([itemId], status);
      toast.success(`Marked as ${status.replace(/_/g, " ").toLowerCase()}`);
      await fetchItems({
        menuId: safeMenuId,
        status: itemFilters.status,
        page: itemFilters.page,
      });
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleBulkStatus = async (
    status: "AVAILABLE" | "OUT_OF_STOCK" | "DISCONTINUED",
  ) => {
    if (!isManager || !selectedItems.length) return;
    try {
      await bulkUpdateStatus(selectedItems, status);
      toast.success(`${selectedItems.length} item(s) updated`);
      await fetchItems({
        menuId: safeMenuId,
        status: itemFilters.status,
        page: itemFilters.page,
      });
    } catch {
      toast.error("Bulk update failed");
    }
  };

  // ── Section handlers ──────────────────────────────────────────────────────
  const handleCreateSection = async () => {
    if (!isManager) return;
    const name = newSectionName.trim();
    if (!name) return;
    try {
      await createSection(safeMenuId, {
        name,
        description: newSectionDesc.trim() || undefined,
      });
      toast.success("Section created");
      setNewSectionName("");
      setNewSectionDesc("");
      setShowSectionDialog(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to create section");
    }
  };

  const handleSectionEditSave = async (sectionId: string) => {
    if (!isManager) return;
    const name = editingSectionName.trim();
    if (!name) return;
    try {
      await updateSection(safeMenuId, sectionId, { name });
      toast.success("Section updated");
      setEditingSectionId(null);
    } catch {
      toast.error("Failed to update section");
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!isManager) return;
    try {
      await deleteSection(safeMenuId, sectionId);
      toast.success("Section deleted — items moved to General");
      await fetchItems({
        menuId: safeMenuId,
        status: itemFilters.status,
        page: 1,
      });
    } catch {
      toast.error("Failed to delete section");
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen">
      {/* ── Hero header ───────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-linear-to-br from-stone-800 via-stone-700 to-stone-900 px-8 py-8">
        {/* Decorative */}
        <div className="absolute -top-10 -right-10 w-52 h-52 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-16 -left-6 w-60 h-60 rounded-full bg-white/5 pointer-events-none" />

        <div className="relative space-y-4">
          {/* Back nav */}
          <button
            onClick={() => navigate("/fnb/menus")}
            className={cn(
              "inline-flex items-center gap-1.5 text-stone-400 hover:text-white",
              "transition-colors duration-150",
            )}
            style={{ fontSize: "12px" }}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Menus
          </button>

          {/* Title row */}
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div className="flex items-center gap-4">
              {/* Icon */}
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm shrink-0">
                <BookOpen className="w-6 h-6 text-white" />
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
                    Menu Detail
                  </p>
                </div>

                {isLoading && !currentMenu ? (
                  <div className="space-y-1.5">
                    <Skeleton className="h-6 w-48 bg-white/10" />
                    <Skeleton className="h-3.5 w-32 bg-white/10" />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h1
                        className="font-bold text-white leading-tight tracking-tight"
                        style={{ fontSize: "22px" }}
                      >
                        {currentMenu?.name ?? "Menu"}
                      </h1>

                      {/* Status badge */}
                      {statusConf && (
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border font-medium",
                            statusConf.className,
                          )}
                          style={{ fontSize: "10px" }}
                        >
                          <span
                            className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              statusConf.dot,
                            )}
                          />
                          {statusConf.label}
                        </span>
                      )}

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

                    <p
                      className="text-stone-300 mt-1"
                      style={{ fontSize: "13px" }}
                    >
                      {currentMenu?.description || "No description provided"}
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Refresh */}
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={isLoadingItems}
                      onClick={() =>
                        fetchItems({
                          menuId: safeMenuId,
                          status: itemFilters.status,
                          page: itemFilters.page,
                        })
                      }
                      className="h-9 w-9 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/15"
                    >
                      <RefreshCw
                        className={cn(
                          "w-4 h-4",
                          isLoadingItems && "animate-spin",
                        )}
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    Refresh items
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {isManager && (
                <>
                  <Button
                    onClick={() => setShowSectionDialog(true)}
                    className={cn(
                      "h-9 px-4 rounded-xl gap-2",
                      "bg-white/10 hover:bg-white/20 text-white border border-white/15",
                    )}
                    style={{ fontSize: "13px" }}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    Add Section
                  </Button>

                  <Button
                    onClick={() => setShowItemForm(true)}
                    className="h-9 px-4 rounded-xl gap-2 bg-white text-stone-800 hover:bg-stone-50 font-semibold shadow-md"
                    style={{ fontSize: "13px" }}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Item
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Stat strip */}
          <div className="flex items-center gap-3 flex-wrap pt-1">
            {[
              { label: "Total Items", value: totalItems },
              { label: "Sections", value: sections.length },
              {
                label: "Available",
                value: allItems.filter((i) => i.status === "AVAILABLE").length,
              },
              {
                label: "Out of Stock",
                value: allItems.filter((i) => i.status === "OUT_OF_STOCK")
                  .length,
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
      </div>

      {/* ── Body ────────────────────────────────────────────────────────────── */}
      <div className="px-8 py-6 space-y-5">
        {/* Read-only banner */}
        {!isManager && (
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
              to manage items.
            </p>
          </div>
        )}

        {/* ── Toolbar ─────────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            <Input
              placeholder="Search items…"
              className="pl-9 pr-8 h-9 rounded-xl border-gray-200 bg-white shadow-sm focus-visible:ring-stone-400/30 text-sm"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
            />
            {localSearch && (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setLocalSearch("")}
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status filter */}
          <Select
            value={localStatus}
            onValueChange={(val) => {
              setLocalStatus(val);
              setItemFilters({ status: val === "all" ? "" : val, page: 1 });
            }}
          >
            <SelectTrigger
              className="w-44 h-9 rounded-xl border-gray-200 bg-white shadow-sm focus:ring-stone-400/30"
              style={{ fontSize: "13px" }}
            >
              <Filter className="w-3.5 h-3.5 mr-2 text-gray-400" />
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-gray-100 shadow-lg">
              <SelectItem value="all" style={{ fontSize: "13px" }}>
                All Status
              </SelectItem>
              <SelectItem value="AVAILABLE" style={{ fontSize: "13px" }}>
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Available
                </span>
              </SelectItem>
              <SelectItem value="OUT_OF_STOCK" style={{ fontSize: "13px" }}>
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  Out of Stock
                </span>
              </SelectItem>
              <SelectItem value="DISCONTINUED" style={{ fontSize: "13px" }}>
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                  Discontinued
                </span>
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Bulk actions */}
          {isManager && selectedItems.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-3 rounded-xl border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 gap-2"
                  style={{ fontSize: "12px" }}
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  {selectedItems.length} selected
                  <ChevronDown className="w-3.5 h-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-48 rounded-xl border-gray-100 shadow-lg"
              >
                <DropdownMenuItem
                  onClick={() => handleBulkStatus("AVAILABLE")}
                  className="gap-2 rounded-lg"
                  style={{ fontSize: "13px" }}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Mark Available
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleBulkStatus("OUT_OF_STOCK")}
                  className="gap-2 rounded-lg"
                  style={{ fontSize: "13px" }}
                >
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  Mark Out of Stock
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleBulkStatus("DISCONTINUED")}
                  className="gap-2 rounded-lg text-destructive focus:text-destructive"
                  style={{ fontSize: "13px" }}
                >
                  <span className="w-2 h-2 rounded-full bg-red-400" />
                  Mark Discontinued
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={clearSelection}
                  className="gap-2 rounded-lg"
                  style={{ fontSize: "13px" }}
                >
                  <X className="w-3.5 h-3.5" />
                  Clear Selection
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Result count */}
          {!isLoadingItems && filteredItems.length > 0 && (
            <span
              className="ml-auto text-gray-400 font-medium"
              style={{ fontSize: "12px" }}
            >
              Showing {filteredItems.length} of {totalItems}
            </span>
          )}
        </div>

        {/* ── Content ───────────────────────────────────────────────────────── */}
        {isLoadingItems && allItems.length === 0 ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <ItemSkeleton key={i} />
            ))}
          </div>
        ) : !isLoadingItems && filteredItems.length === 0 ? (
          /* ── Empty states ─────────────────────────────────────────────── */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-stone-100 border border-stone-200 mb-5">
              {localSearch || localStatus !== "all" ? (
                <Search className="w-7 h-7 text-stone-400" />
              ) : (
                <ChefHat className="w-7 h-7 text-stone-400" />
              )}
            </div>

            {localSearch || localStatus !== "all" ? (
              <>
                <h3
                  className="font-semibold text-gray-800 mb-1"
                  style={{ fontSize: "15px" }}
                >
                  No items match your filters
                </h3>
                <p
                  className="text-gray-400 max-w-xs leading-relaxed mb-5"
                  style={{ fontSize: "12px" }}
                >
                  Try clearing your search or changing the status filter.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setLocalSearch("");
                    setLocalStatus("all");
                    setItemFilters({ status: "", page: 1 });
                  }}
                  className="h-9 px-4 rounded-xl border-gray-200 bg-white"
                  style={{ fontSize: "12px" }}
                >
                  Clear Filters
                </Button>
              </>
            ) : isManager ? (
              <>
                <h3
                  className="font-semibold text-gray-800 mb-1"
                  style={{ fontSize: "15px" }}
                >
                  No items yet
                </h3>
                <p
                  className="text-gray-400 max-w-xs leading-relaxed mb-5"
                  style={{ fontSize: "12px" }}
                >
                  Add your first menu item to start building this menu.
                </p>
                <Button
                  onClick={() => setShowItemForm(true)}
                  className="h-9 px-5 rounded-xl bg-stone-800 hover:bg-stone-700 text-white gap-2"
                  style={{ fontSize: "13px" }}
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add First Item
                </Button>
              </>
            ) : (
              <>
                <h3
                  className="font-semibold text-gray-800 mb-1"
                  style={{ fontSize: "15px" }}
                >
                  No items yet
                </h3>
                <p
                  className="text-gray-400 max-w-xs leading-relaxed"
                  style={{ fontSize: "12px" }}
                >
                  This menu has no items. Contact an{" "}
                  <span className="font-semibold text-gray-500">
                    admin or owner
                  </span>{" "}
                  to add items.
                </p>
              </>
            )}
          </div>
        ) : (
          /* ── Sections + items ───────────────────────────────────────────── */
          <div className="space-y-6">
            {sections.map((section) => {
              const sItems = itemsBySection[section.id] ?? [];
              if (
                sItems.length === 0 &&
                (localSearch || localStatus !== "all")
              ) {
                return null;
              }

              return (
                <div key={section.id}>
                  {/* Section header */}
                  <div className="flex items-center gap-2 mb-3 group">
                    {isManager && editingSectionId === section.id ? (
                      <div className="flex items-center gap-2 flex-1">
                        <Input
                          value={editingSectionName}
                          onChange={(e) =>
                            setEditingSectionName(e.target.value)
                          }
                          className="h-8 text-sm max-w-xs rounded-xl border-gray-200 focus-visible:ring-stone-400/30"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter")
                              handleSectionEditSave(section.id);
                            if (e.key === "Escape") setEditingSectionId(null);
                          }}
                        />
                        <Button
                          size="sm"
                          className="h-7 px-3 rounded-lg bg-stone-800 hover:bg-stone-700 text-white"
                          style={{ fontSize: "11px" }}
                          onClick={() => handleSectionEditSave(section.id)}
                          disabled={isSubmitting}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-3 rounded-lg"
                          style={{ fontSize: "11px" }}
                          onClick={() => setEditingSectionId(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <>
                        {/* Colored left rule */}
                        <div className="w-1 h-5 rounded-full bg-stone-400 shrink-0" />

                        <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-stone-100 shrink-0">
                          <Layers className="w-3.5 h-3.5 text-stone-500" />
                        </div>

                        <h3
                          className="font-semibold text-stone-600 uppercase tracking-widest"
                          style={{ fontSize: "11px" }}
                        >
                          {section.name}
                        </h3>

                        <span
                          className="px-2 py-0.5 rounded-full bg-stone-100 border border-stone-200 text-stone-500 font-medium leading-none"
                          style={{ fontSize: "10px" }}
                        >
                          {sItems.length}
                        </span>

                        {/* Divider rule */}
                        <div className="flex-1 h-px bg-stone-200/70" />

                        {/* Section actions */}
                        {isManager && (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <TooltipProvider delayDuration={200}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-stone-100"
                                    onClick={() => {
                                      setEditingSectionId(section.id);
                                      setEditingSectionName(section.name);
                                    }}
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="text-xs">
                                  Rename section
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider delayDuration={200}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50"
                                    onClick={() =>
                                      handleDeleteSection(section.id)
                                    }
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="text-xs">
                                  Delete section
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Items */}
                  <div className="space-y-2 pl-5 border-l-2 border-stone-100 ml-1">
                    {sItems.length > 0 ? (
                      sItems.map((item) => (
                        <MenuItemCard
                          key={item.id}
                          item={item}
                          isSelected={selectedItems.includes(item.id)}
                          isManager={isManager}
                          onSelect={toggleSelectItem}
                          onEdit={setEditingItem}
                          onDelete={(id) => setDeletingItemId(id)}
                          onStatusChange={handleStatusChange}
                        />
                      ))
                    ) : (
                      <p
                        className="py-3 italic text-gray-400"
                        style={{ fontSize: "12px" }}
                      >
                        No items in this section
                        {isManager && (
                          <>
                            {" — "}
                            <button
                              className="underline hover:text-stone-600 transition-colors"
                              onClick={() => setShowItemForm(true)}
                            >
                              add one
                            </button>
                          </>
                        )}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}

            {/* ── Unsectioned / General ──────────────────────────────────── */}
            {unsectionedItems.length > 0 && (
              <div>
                {sections.length > 0 && (
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-5 rounded-full bg-stone-300 shrink-0" />
                    <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-stone-100 shrink-0">
                      <UtensilsCrossed className="w-3.5 h-3.5 text-stone-400" />
                    </div>
                    <h3
                      className="font-semibold text-stone-500 uppercase tracking-widest"
                      style={{ fontSize: "11px" }}
                    >
                      General
                    </h3>
                    <span
                      className="px-2 py-0.5 rounded-full bg-stone-100 border border-stone-200 text-stone-400 font-medium leading-none"
                      style={{ fontSize: "10px" }}
                    >
                      {unsectionedItems.length}
                    </span>
                    <div className="flex-1 h-px bg-stone-200/70" />
                  </div>
                )}

                <div
                  className={cn(
                    "space-y-2",
                    sections.length > 0 &&
                      "pl-5 border-l-2 border-stone-100 ml-1",
                  )}
                >
                  {unsectionedItems.map((item) => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      isSelected={selectedItems.includes(item.id)}
                      isManager={isManager}
                      onSelect={toggleSelectItem}
                      onEdit={setEditingItem}
                      onDelete={(id) => setDeletingItemId(id)}
                      onStatusChange={handleStatusChange}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Pagination ──────────────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1 || isLoadingItems}
              onClick={() => setItemFilters({ page: currentPage - 1 })}
              className="h-8 px-4 rounded-xl border-gray-200 bg-white shadow-sm text-gray-600 hover:bg-stone-50"
              style={{ fontSize: "12px" }}
            >
              Previous
            </Button>

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
                      onClick={() => setItemFilters({ page: p as number })}
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
              disabled={currentPage >= totalPages || isLoadingItems}
              onClick={() => setItemFilters({ page: currentPage + 1 })}
              className="h-8 px-4 rounded-xl border-gray-200 bg-white shadow-sm text-gray-600 hover:bg-stone-50"
              style={{ fontSize: "12px" }}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* ── Manager-only modals ───────────────────────────────────────────── */}
      {isManager && (
        <>
          <MenuItemForm
            open={showItemForm}
            onClose={() => setShowItemForm(false)}
            onSubmit={handleCreateItem}
            menus={menus?.data ?? []}
            sections={sections}
            categories={categories}
            dietaryTags={dietaryTags}
            defaultMenuId={safeMenuId}
            isLoading={isSubmitting}
          />

          <MenuItemForm
            open={!!editingItem}
            onClose={() => setEditingItem(null)}
            onSubmit={handleUpdateItem}
            item={editingItem}
            menus={menus?.data ?? []}
            sections={sections}
            categories={categories}
            dietaryTags={dietaryTags}
            defaultMenuId={safeMenuId}
            isLoading={isSubmitting}
          />

          {/* Delete confirmation */}
          <AlertDialog
            open={!!deletingItemId}
            onOpenChange={(open) => !open && setDeletingItemId(null)}
          >
            <AlertDialogContent className="rounded-2xl border-gray-100 shadow-xl p-0 overflow-hidden gap-0">
              {/* Header */}
              <div className="bg-linear-to-br from-red-600 to-red-700 px-6 py-5">
                <AlertDialogHeader>
                  <AlertDialogTitle
                    className="text-white font-semibold"
                    style={{ fontSize: "15px" }}
                  >
                    Delete Menu Item
                  </AlertDialogTitle>
                  <AlertDialogDescription
                    className="text-red-200"
                    style={{ fontSize: "12px" }}
                  >
                    This action cannot be undone. The item will be permanently
                    removed from this menu.
                  </AlertDialogDescription>
                </AlertDialogHeader>
              </div>
              <AlertDialogFooter className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-2">
                <AlertDialogCancel
                  className="flex-1 h-9 rounded-xl border-gray-200 text-gray-600"
                  style={{ fontSize: "13px" }}
                >
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  className="flex-1 h-9 rounded-xl bg-red-600 hover:bg-red-700 text-white"
                  style={{ fontSize: "13px" }}
                  onClick={handleConfirmDelete}
                >
                  Delete Item
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Add Section Dialog */}
          <Dialog
            open={showSectionDialog}
            onOpenChange={(open) => {
              setShowSectionDialog(open);
              if (!open) {
                setNewSectionName("");
                setNewSectionDesc("");
              }
            }}
          >
            <DialogContent className="max-w-md w-[90vw] p-0 gap-0 rounded-2xl overflow-hidden border-gray-100 shadow-xl">
              {/* Header */}
              <div className="bg-linear-to-br from-stone-800 to-stone-700 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-white/15 border border-white/20">
                    <Layers className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <DialogTitle
                      className="font-semibold text-white leading-snug"
                      style={{ fontSize: "14px" }}
                    >
                      Add Section
                    </DialogTitle>
                    <p
                      className="text-stone-300 leading-none mt-0.5"
                      style={{ fontSize: "11px" }}
                    >
                      Group items into logical sections on this menu
                    </p>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="px-6 py-5 space-y-4 bg-white">
                <div>
                  <label
                    className="text-gray-600 font-medium"
                    style={{ fontSize: "12px" }}
                  >
                    Section Name <span className="text-destructive">*</span>
                  </label>
                  <Input
                    className="mt-1.5 h-9 rounded-xl border-gray-200 text-sm focus-visible:ring-stone-400/30"
                    placeholder="e.g. Starters, Mains, Desserts"
                    value={newSectionName}
                    onChange={(e) => setNewSectionName(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleCreateSection()
                    }
                    autoFocus
                  />
                </div>
                <div>
                  <label
                    className="text-gray-500 font-medium"
                    style={{ fontSize: "12px" }}
                  >
                    Description{" "}
                    <span className="text-gray-400 font-normal">
                      (optional)
                    </span>
                  </label>
                  <Input
                    className="mt-1.5 h-9 rounded-xl border-gray-200 text-sm focus-visible:ring-stone-400/30"
                    placeholder="Brief description of this section…"
                    value={newSectionDesc}
                    onChange={(e) => setNewSectionDesc(e.target.value)}
                  />
                </div>

                {/* Live preview */}
                {newSectionName && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="w-1 h-5 rounded-full bg-stone-400 shrink-0" />
                    <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-stone-100 shrink-0">
                      <Layers className="w-3.5 h-3.5 text-stone-500" />
                    </div>
                    <span
                      className="font-semibold text-stone-600 uppercase tracking-widest"
                      style={{ fontSize: "11px" }}
                    >
                      {newSectionName}
                    </span>
                    <p className="text-gray-400" style={{ fontSize: "11px" }}>
                      — Preview
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <DialogFooter className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowSectionDialog(false)}
                  className="flex-1 h-9 rounded-xl border-gray-200 text-gray-600"
                  style={{ fontSize: "13px" }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateSection}
                  disabled={!newSectionName.trim() || isSubmitting}
                  className="flex-1 h-9 rounded-xl bg-stone-800 hover:bg-stone-700 text-white"
                  style={{ fontSize: "13px" }}
                >
                  Create Section
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
