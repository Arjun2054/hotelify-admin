// src/components/room/AddRoomItemModal.tsx
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { HotelItem } from "@/types/hotelItem-types";
import type { AddRoomItemPayload } from "@/types/hotelItem-types";
import { Package, Search, Check, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddRoomItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  hotelItems: HotelItem[];
  existingItemIds: string[];
  onConfirm: (data: AddRoomItemPayload) => Promise<void>;
}

export function AddRoomItemModal({
  isOpen,
  onClose,
  hotelItems,
  existingItemIds,
  onConfirm,
}: AddRoomItemModalProps) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<HotelItem | null>(null);
  const [qty, setQty] = useState("1");
  const [isLoading, setIsLoading] = useState(false);

  const available = hotelItems.filter(
    (item) => !existingItemIds.includes(item.id),
  );

  const filtered = available.filter((item) =>
    [item.name, item.sku ?? "", item.category?.name ?? ""]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  const handleConfirm = async () => {
    if (!selected) return;
    setIsLoading(true);
    try {
      await onConfirm({
        hotelItemId: selected.id,
        standardQty: parseFloat(qty) || 1,
      });
      handleClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setSearch("");
      setSelected(null);
      setQty("1");
    }, 200);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Add Room Item
          </DialogTitle>
          <DialogDescription>
            Select an inventory item to assign to this room
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-9"
            autoFocus
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Item list */}
        <ScrollArea className="h-56 rounded-xl border">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-8 text-center">
              <Package className="h-8 w-8 text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">
                {search ? "No items match your search" : "No available items"}
              </p>
            </div>
          ) : (
            <div className="p-1.5 space-y-0.5">
              {filtered.map((item) => {
                const isSelected = selected?.id === item.id;
                const stockNum = Number(item.stockQuantity);
                const isLowStock = stockNum < Number(item.minimumStock);

                return (
                  <button
                    key={item.id}
                    onClick={() => setSelected(isSelected ? null : item)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all",
                      isSelected
                        ? "bg-primary/10 border border-primary/20"
                        : "hover:bg-muted/60",
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg",
                        isSelected ? "bg-primary/20" : "bg-muted",
                      )}
                    >
                      <Package
                        className={cn(
                          "h-4 w-4",
                          isSelected ? "text-primary" : "text-muted-foreground",
                        )}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {item.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {item.category && (
                          <span className="text-xs text-muted-foreground">
                            {item.category.name}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          Stock: {stockNum.toFixed(1)} {item.unit?.abbreviation}
                        </span>
                        {isLowStock && (
                          <Badge
                            variant="destructive"
                            className="text-[10px] px-1 py-0 h-4"
                          >
                            Low
                          </Badge>
                        )}
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Quantity selector - shown when item selected */}
        {selected && (
          <>
            <Separator />
            <div className="rounded-xl bg-muted/50 border p-3">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                  <Package className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {selected.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selected.unit?.name}
                  </p>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="qty" className="text-xs">
                  Standard Quantity ({selected.unit?.abbreviation ?? "units"})
                </Label>
                <Input
                  id="qty"
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  className="h-8"
                />
              </div>
            </div>
          </>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selected || isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Add Item
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
