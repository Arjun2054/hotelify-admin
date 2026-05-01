// components/room/RoomItemsManager.tsx

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Plus, Trash2, Package, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRoomStore } from "@/store/room/useRoomStore";
import type { AddRoomItemPayload, RoomItem } from "@/types/hotelItem-types";

interface HotelItem {
  id: string;
  name: string;
  unit?: { name: string; abbreviation: string };
  category?: { name: string };
}

interface Props {
  roomId: string;
  roomNumber: string;
  roomItems: RoomItem[];
  hotelItems: HotelItem[]; // pass available hotel items
}

export function RoomItemsManager({
  roomId,
  roomNumber,
  roomItems,
  hotelItems,
}: Props) {
  const { addRoomItem, removeRoomItem, isLoading } = useRoomStore();

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<RoomItem | null>(null);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [quantity, setQuantity] = useState(1);

  // Filter out items already assigned to this room
  const availableItems = hotelItems.filter(
    (hi) => !roomItems.some((ri) => ri.hotelItemId === hi.id),
  );

  const handleAdd = async () => {
    if (!selectedItemId) {
      toast.error("Please select an item");
      return;
    }
    if (quantity < 1) {
      toast.error("Quantity must be at least 1");
      return;
    }

    try {
      const data: AddRoomItemPayload = {
        hotelItemId: selectedItemId,
        standardQty: quantity,
      };
      await addRoomItem(roomId, data);
      toast.success("Item added to room");
      setAddDialogOpen(false);
      setSelectedItemId("");
      setQuantity(1);
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const handleRemove = async () => {
    if (!deleteTarget) return;
    try {
      await removeRoomItem(deleteTarget.id);
      toast.success("Item removed from room");
    } catch (err) {
      toast.error((err as Error).message);
    }
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Room Items
        </h3>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setAddDialogOpen(true)}
          disabled={availableItems.length === 0}
        >
          <Plus className="mr-1 h-4 w-4" /> Add Item
        </Button>
      </div>

      {roomItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center border rounded-lg border-dashed">
          <Package className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            No items assigned to this room yet.
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-center">Std. Qty</TableHead>
              <TableHead className="text-center">Unit</TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {roomItems.map((ri) => (
              <TableRow key={ri.id}>
                <TableCell className="font-medium">
                  {ri.hotelItem.name}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {ri.hotelItem.category?.name ?? "—"}
                </TableCell>
                <TableCell className="text-center">{ri.standardQty}</TableCell>
                <TableCell className="text-center">
                  {ri.hotelItem.unit?.abbreviation ??
                    ri.hotelItem.unit?.name ??
                    "—"}
                </TableCell>
                <TableCell>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-red-500 hover:text-red-700"
                    onClick={() => setDeleteTarget(ri)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* ─── Add Item Dialog ─────────────────────────── */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Add Item to Room {roomNumber}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Hotel Item *</Label>
              <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an item..." />
                </SelectTrigger>
                <SelectContent>
                  {availableItems.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                      {item.category ? ` (${item.category.name})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {availableItems.length === 0 && (
                <p className="text-xs text-amber-600">
                  All items are already assigned to this room.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Standard Quantity *</Label>
              <Input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                placeholder="e.g. 2"
              />
              <p className="text-xs text-muted-foreground">
                The standard quantity expected in this room.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={isLoading || !selectedItemId}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Delete Confirmation ─────────────────────── */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Item?</AlertDialogTitle>
            <AlertDialogDescription>
              Remove <strong>{deleteTarget?.hotelItem.name}</strong> from Room{" "}
              {roomNumber}? This won't delete the hotel item itself.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              className="bg-red-600 hover:bg-red-700"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
