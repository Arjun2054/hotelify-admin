import { HotelItemDetailSheet } from "@/components/hotel-items/HotelItemDetailSheet";
import { HotelItemFilters } from "@/components/hotel-items/HotelItemFilters";
import { HotelItemFormDialog } from "@/components/hotel-items/HotelItemFormDialog";
import { HotelItemTable } from "@/components/hotel-items/HotelItemTable";
import { ItemStatsCards } from "@/components/hotel-items/ItemStatsCards";
import { StockMovementDialog } from "@/components/hotel-items/StockMovementDialog";
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
import { Button } from "@/components/ui/button";
import { useCategoryStore } from "@/store/categoryStore";
import { useHotelItemStore } from "@/store/hotel/useHotelItemStore";
import { useUnitStore } from "@/store/room/unitStore";
import { useSupplierStore } from "@/store/supplierStore";
import type {
  CreateHotelItemPayload,
  CreateStockMovementPayload,
  HotelItem,
  StockMovementType,
} from "@/types/hotelItem-types";
import {
  Plus,
  Package,
  ChevronLeft,
  ChevronRight,
  ArrowDownToLine,
  ArrowUpFromLine,
  Boxes,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ── Page ──────────────────────────────────────────────────────────────────────
const HotelItemPage = () => {
  const {
    items,
    stats,
    filters,
    isLoading,
    meta,
    fetchItems,
    fetchStats,
    createItem,
    updateItem,
    deleteItem,
    toogleActive,
    createMovement,
    setFilters,
  } = useHotelItemStore();

  const { units, fetchUnits } = useUnitStore();
  const { categories, fetchCategories } = useCategoryStore();
  const { suppliers, fetchSuppliers } = useSupplierStore();

  // Dialog states
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<HotelItem | null>(null);
  const [detailItem, setDetailItem] = useState<HotelItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [stockMovementItem, setStockMovementItem] = useState<HotelItem | null>(
    null,
  );
  const [stockMovementType, setStockMovementType] =
    useState<StockMovementType>("STOCK_IN");
  const [deleteTarget, setDeleteTarget] = useState<HotelItem | null>(null);

  useEffect(() => {
    fetchItems();
    fetchStats();
    fetchUnits();
    fetchCategories();
    fetchSuppliers();
  }, []);

  useEffect(() => {
    fetchItems();
  }, [filters]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleCreate = async (data: CreateHotelItemPayload) => {
    await createItem(data);
    toast.success("Item created successfully");
  };

  const handleEdit = async (data: CreateHotelItemPayload) => {
    if (!editingItem) return;
    await updateItem(editingItem.id, data);
    toast.success("Item updated successfully");
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteItem(deleteTarget.id);
      toast.success(`"${deleteTarget.name}" deleted`);
    } catch (err) {
      toast.error((err as Error).message);
    }
    setDeleteTarget(null);
  };

  const handleToggleActive = async (item: HotelItem) => {
    try {
      const updated = await toogleActive(item.id);
      toast.success(
        `"${item.name}" ${updated.isActive ? "activated" : "deactivated"}`,
      );
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const handleStockMovement = async (data: CreateStockMovementPayload) => {
    try {
      await createMovement(data);
      toast.success("Stock movement recorded");
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const openStockMovement = (item: HotelItem, type: StockMovementType) => {
    setStockMovementItem(item);
    setStockMovementType(type);
  };

  const openDetail = useCallback((item: HotelItem) => {
    setDetailItem(item);
    setDetailOpen(true);
  }, []);

  const handleClearFilters = () => {
    setFilters({
      categoryId: undefined,
      supplierId: undefined,
      isActive: undefined,
      lowStock: undefined,
      search: undefined,
    });
  };

  const totalItems = meta?.total ?? items.length;
  const currentPage = meta?.page ?? 1;
  const totalPages = meta?.totalPages ?? 1;

  // Derive quick stats from store stats for hero strip
  const activeCount = stats?.activeItems ?? 0;
  const lowStockCount = stats?.lowStockItems ?? 0;
  const totalValue = stats?.totalStockValue ?? 0;

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
              <Package className="w-6 h-6 text-white" />
            </div>

            <div>
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 mb-1">
                <p
                  className="uppercase tracking-widest font-semibold text-stone-400"
                  style={{ fontSize: "10px" }}
                >
                  Hotel Management
                </p>
                <span className="w-1 h-1 rounded-full bg-stone-500" />
                <p
                  className="uppercase tracking-widest font-semibold text-stone-400"
                  style={{ fontSize: "10px" }}
                >
                  Inventory
                </p>
                <span className="w-1 h-1 rounded-full bg-stone-500" />
                <p
                  className="uppercase tracking-widest font-semibold text-stone-400"
                  style={{ fontSize: "10px" }}
                >
                  Items
                </p>
              </div>

              <h1
                className="font-bold text-white leading-tight tracking-tight"
                style={{ fontSize: "22px" }}
              >
                Hotel Items
              </h1>
              <p
                className="text-stone-300 mt-1 leading-snug"
                style={{ fontSize: "13px" }}
              >
                Manage inventory items, stock levels, and movements
              </p>
            </div>
          </div>

          {/* Right: CTA */}
          <Button
            onClick={() => {
              setEditingItem(null);
              setFormOpen(true);
            }}
            className="h-9 px-5 rounded-xl gap-2 bg-white text-stone-800 hover:bg-stone-50 font-semibold shadow-md shrink-0"
            style={{ fontSize: "13px" }}
          >
            <Plus className="w-3.5 h-3.5" />
            Add Item
          </Button>
        </div>

        {/* ── Stat strip ────────────────────────────────────────────────── */}
        <div className="relative mt-7 flex items-center gap-3 flex-wrap">
          {[
            {
              label: "Total Items",
              value: totalItems,
              icon: Boxes,
            },
            {
              label: "Active",
              value: activeCount,
              icon: Package,
            },
            {
              label: "Low Stock",
              value: lowStockCount,
              icon: ArrowDownToLine,
            },
            {
              label: "Stock Value",
              value: `$${Number(totalValue).toLocaleString()}`,
              icon: ArrowUpFromLine,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white/10 border border-white/15 backdrop-blur-sm"
            >
              <stat.icon className="w-3.5 h-3.5 text-stone-300 shrink-0" />
              <span
                className="font-bold text-white leading-none"
                style={{ fontSize: "15px" }}
              >
                {isLoading ? "—" : stat.value}
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
        {/* KPI Cards */}
        <ItemStatsCards stats={stats} />

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <HotelItemFilters
            filters={filters}
            categories={categories}
            suppliers={suppliers}
            onFilterChange={setFilters}
            onClear={handleClearFilters}
          />
        </div>

        {/* Section label */}
        <div className="flex items-center gap-2">
          <p
            className="uppercase tracking-widest font-semibold text-gray-400"
            style={{ fontSize: "10px" }}
          >
            All Items
          </p>
          <div className="flex-1 h-px bg-gray-200" />
          {meta && (
            <span
              className="px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-400 font-medium shadow-sm"
              style={{ fontSize: "10px" }}
            >
              {items.length} of {meta.total} shown
            </span>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <HotelItemTable
            items={items}
            isLoading={isLoading}
            onView={openDetail}
            onEdit={(item) => {
              setEditingItem(item);
              setFormOpen(true);
            }}
            onDelete={setDeleteTarget}
            onStockMovement={openStockMovement}
            onToggleActive={handleToggleActive}
          />
        </div>

        {/* Pagination */}
        {meta && totalPages > 1 && (
          <div className="flex items-center justify-between flex-wrap gap-3 pt-1">
            <p className="text-gray-400" style={{ fontSize: "12px" }}>
              Page{" "}
              <span className="font-semibold text-gray-600">{currentPage}</span>{" "}
              of{" "}
              <span className="font-semibold text-gray-600">{totalPages}</span>{" "}
              ·{" "}
              <span className="font-semibold text-gray-600">{meta.total}</span>{" "}
              total items
            </p>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1 || isLoading}
                onClick={() => fetchItems(currentPage - 1)}
                className="h-8 px-3 rounded-xl border-gray-200 bg-white shadow-sm text-gray-600 hover:bg-stone-50 gap-1"
                style={{ fontSize: "12px" }}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
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
                        onClick={() => fetchItems(p as number)}
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
                disabled={currentPage >= totalPages || isLoading}
                onClick={() => fetchItems(currentPage + 1)}
                className="h-8 px-3 rounded-xl border-gray-200 bg-white shadow-sm text-gray-600 hover:bg-stone-50 gap-1"
                style={{ fontSize: "12px" }}
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ── Dialogs ─────────────────────────────────────────────────────────── */}

      {/* Create / Edit */}
      <HotelItemFormDialog
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingItem(null);
        }}
        onSubmit={editingItem ? handleEdit : handleCreate}
        editingItem={editingItem}
        categories={categories}
        units={units}
        suppliers={suppliers}
        isLoading={isLoading}
      />

      {/* Detail sheet */}
      <HotelItemDetailSheet
        item={detailItem}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onStockMovement={(item, type) => {
          setDetailOpen(false);
          openStockMovement(item, type);
        }}
      />

      {/* Stock movement */}
      <StockMovementDialog
        open={!!stockMovementItem}
        item={stockMovementItem}
        initialType={stockMovementType}
        isLoading={isLoading}
        onClose={() => setStockMovementItem(null)}
        onSubmit={handleStockMovement}
      />

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <AlertDialogContent className="rounded-2xl border-gray-100 shadow-xl p-0 overflow-hidden gap-0">
          {/* Red gradient header */}
          <div className="bg-linear-to-br from-red-600 to-red-700 px-6 py-5">
            <AlertDialogHeader>
              <AlertDialogTitle
                className="text-white font-semibold"
                style={{ fontSize: "15px" }}
              >
                Delete "{deleteTarget?.name}"?
              </AlertDialogTitle>
              <AlertDialogDescription
                className="text-red-200"
                style={{ fontSize: "12px" }}
              >
                This will permanently remove the item and its history. This
                action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
          </div>

          {/* Footer */}
          <AlertDialogFooter className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-2">
            <AlertDialogCancel
              className="flex-1 h-9 rounded-xl border-gray-200 text-gray-600"
              style={{ fontSize: "13px" }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="flex-1 h-9 rounded-xl bg-red-600 hover:bg-red-700 text-white"
              style={{ fontSize: "13px" }}
            >
              Delete Item
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default HotelItemPage;
