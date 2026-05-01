// src/components/room/CheckOutModal.tsx
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import type { Room } from "@/types/room-types";
import {
  LogOut,
  User,
  Calendar,
  Clock,
  DollarSign,
  Receipt,
} from "lucide-react";

interface CheckOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: Room | null;
  onConfirm: (assignmentId: string, notes?: string) => Promise<void>;
}

export function CheckOutModal({
  isOpen,
  onClose,
  room,
  onConfirm,
}: CheckOutModalProps) {
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const guest = room?.currentGuest;

  const stayNights = guest
    ? Math.max(
        1,
        Math.ceil(
          (Date.now() - new Date(guest.checkIn).getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      )
    : 0;

  const totalCharge = stayNights * Number(room?.roomType?.basePrice ?? 0);

  const handleSubmit = async () => {
    if (!guest) return;
    setIsLoading(true);
    try {
      await onConfirm(guest.id, notes || undefined);
      setNotes("");
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
      setNotes("");
    }
  };

  if (!room || !guest) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LogOut className="h-5 w-5 text-primary" />
            Check Out
          </DialogTitle>
          <DialogDescription>
            Room {room.roomNumber} · {room.roomType.name}
          </DialogDescription>
        </DialogHeader>

        {/* Guest card */}
        <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
              <span className="text-sm font-bold text-primary">
                {guest.guestName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{guest.guestName}</p>
              {guest.guestEmail && (
                <p className="text-xs text-muted-foreground truncate">
                  {guest.guestEmail}
                </p>
              )}
            </div>
            <Badge variant="secondary" className="flex-shrink-0">
              {stayNights}N
            </Badge>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <Calendar className="h-3 w-3" />
                Check-in
              </div>
              <p className="font-medium text-sm">
                {new Date(guest.checkIn).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <Clock className="h-3 w-3" />
                Duration
              </div>
              <p className="font-medium text-sm">
                {stayNights} {stayNights === 1 ? "night" : "nights"}
              </p>
            </div>
          </div>

          <Separator />

          {/* Billing summary */}
          <div className="space-y-1.5 text-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span>
                {stayNights} × ${Number(room.roomType.basePrice).toFixed(0)}
                /night
              </span>
              <span>${totalCharge.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between font-semibold border-t pt-1.5">
              <div className="flex items-center gap-1.5">
                <Receipt className="h-3.5 w-3.5 text-muted-foreground" />
                Total
              </div>
              <span className="text-base">${totalCharge.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="checkout-notes">Checkout Notes</Label>
          <Textarea
            id="checkout-notes"
            placeholder="Any damage, feedback, or remarks..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="resize-none"
          />
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading} className="gap-2">
            {isLoading ? (
              <>
                <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <LogOut className="h-4 w-4" />
                Confirm Checkout
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
