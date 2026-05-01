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
import { Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

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

  // Refetch items when filters change
  useEffect(() => {
    fetchItems();
  }, [filters]);

  // ─── Handlers ─────────────────────────────────────────

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

  return (
    <div className="flex h-full flex-col space-y-6 bg-[#f9fafb]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hotel Items</h1>
          <p className="text-muted-foreground mt-1">
            Manage hotel inventory items, stock levels, and movements.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              setEditingItem(null);
              setFormOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Item
          </Button>
        </div>
      </div>
      <ItemStatsCards stats={stats} />

      {/* Filters */}
      <HotelItemFilters
        filters={filters}
        categories={categories}
        suppliers={suppliers}
        onFilterChange={setFilters}
        onClear={handleClearFilters}
      />

      {/* Table */}
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

      {/* Pagination info */}
      {meta && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {items.length} of {meta.total} items
          </span>
          {meta.totalPages > 1 && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={meta.page <= 1}
                onClick={() => fetchItems(meta.page - 1)}
              >
                Previous
              </Button>
              <span className="flex items-center px-2">
                Page {meta.page} of {meta.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={meta.page >= meta.totalPages}
                onClick={() => fetchItems(meta.page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ── Dialogs ────────────────────────────────────── */}

      {/* Create / Edit Dialog */}
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

      {/* Detail Sheet */}
      <HotelItemDetailSheet
        item={detailItem}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onStockMovement={(item, type) => {
          setDetailOpen(false);
          openStockMovement(item, type);
        }}
      />

      {/* Stock Movement Dialog */}
      <StockMovementDialog
        open={!!stockMovementItem}
        item={stockMovementItem}
        initialType={stockMovementType}
        isLoading={isLoading}
        onClose={() => setStockMovementItem(null)}
        onSubmit={handleStockMovement}
      />
      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deleteTarget?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the item and its history. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default HotelItemPage;
