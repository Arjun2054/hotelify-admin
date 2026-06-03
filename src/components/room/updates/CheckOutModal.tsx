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
import type { Room } from "@/types/room-types";
import { LogOut, Calendar, Moon, Layers } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

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

  const nightlyRate = Number(room?.roomType?.basePrice ?? 0);
  const totalCharge = stayNights * nightlyRate;

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

  const checkInDate = new Date(guest.checkIn);
  const today = new Date();

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="gap-0 p-0 sm:max-w-md">
        {/* ── Header ── */}
        <DialogHeader className="space-y-1.5 px-6 pt-6 pb-5">
          <DialogTitle className="text-base font-semibold tracking-tight">
            Check out guest
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Review the stay summary before finalizing checkout.
          </DialogDescription>
        </DialogHeader>

        {/* ── Guest strip ── */}
        <div className="flex items-center justify-between gap-3 border-y border-border/60 bg-muted/30 px-6 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-background text-sm font-semibold text-foreground/80 ring-1 ring-border/60">
              {guest.guestName.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold leading-tight">
                {guest.guestName}
              </p>
              <p className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Layers className="h-3 w-3" />
                  Room {room.roomNumber}
                </span>
                <span aria-hidden className="text-border">
                  ·
                </span>
                <span className="truncate">{room.roomType.name}</span>
              </p>
            </div>
          </div>
        </div>

        {/* ── Stay timeline ── */}
        <div className="px-6 pt-5">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Stay
          </p>

          <div className="mt-3 flex items-center gap-3">
            {/* Check-in */}
            <DateBlock
              label="Check-in"
              icon={Calendar}
              primary={checkInDate.toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
              secondary={checkInDate.toLocaleDateString(undefined, {
                year: "numeric",
              })}
            />

            {/* Connector with night count */}
            <div className="flex flex-1 items-center gap-2">
              <span
                aria-hidden
                className="h-px flex-1 bg-gradient-to-r from-border via-border to-transparent"
              />
              <span className="flex items-center gap-1 rounded-full border border-border/60 bg-muted/40 px-2 py-0.5 text-[11px] font-medium text-foreground/80">
                <Moon className="h-3 w-3 text-muted-foreground" />
                {stayNights} {stayNights === 1 ? "night" : "nights"}
              </span>
              <span
                aria-hidden
                className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-border"
              />
            </div>

            {/* Check-out */}
            <DateBlock
              label="Check-out"
              icon={Calendar}
              primary={today.toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
              secondary="Today"
              align="right"
            />
          </div>
        </div>

        {/* ── Billing ── */}
        <div className="px-6 pt-5">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Billing
          </p>

          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">
                {stayNights} × {formatCurrency(nightlyRate)}
                <span className="text-muted-foreground/70"> / night</span>
              </dt>
              <dd className="tabular-nums text-foreground">
                {formatCurrency(totalCharge)}
              </dd>
            </div>

            <div className="flex items-baseline justify-between border-t border-border/60 pt-2.5">
              <dt className="text-sm font-semibold">Total due</dt>
              <dd className="text-lg font-semibold tabular-nums tracking-tight">
                {formatCurrency(totalCharge)}
              </dd>
            </div>
          </dl>
        </div>

        {/* ── Notes ── */}
        <div className="space-y-1.5 px-6 py-5">
          <div className="flex items-baseline justify-between">
            <Label htmlFor="checkout-notes" className="text-xs font-medium">
              Checkout notes
            </Label>
            <span className="text-[10px] text-muted-foreground">Optional</span>
          </div>
          <Textarea
            id="checkout-notes"
            placeholder="Damage, feedback, follow-ups…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="resize-none text-sm"
          />
        </div>

        {/* ── Footer ── */}
        <DialogFooter className="gap-2 border-t border-border/60 bg-muted/20 px-6 py-4 sm:gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={isLoading}
            className="gap-1.5"
          >
            {isLoading ? (
              <>
                <span className="h-3.5 w-3.5 rounded-full border-2 border-current/30 border-t-current animate-spin" />
                Processing…
              </>
            ) : (
              <>
                <LogOut className="h-3.5 w-3.5" />
                Confirm checkout
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ──────────────────────────────────────────────────────────── */
/*  Tiny date display used by the stay timeline                  */
/* ──────────────────────────────────────────────────────────── */

interface DateBlockProps {
  label: string;
  primary: string;
  secondary: string;
  icon: React.ComponentType<{ className?: string }>;
  align?: "left" | "right";
}

function DateBlock({
  label,
  primary,
  secondary,
  icon: Icon,
  align = "left",
}: DateBlockProps) {
  return (
    <div
      className={
        align === "right" ? "shrink-0 text-right" : "shrink-0 text-left"
      }
    >
      <div
        className={`flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground ${
          align === "right" ? "justify-end" : ""
        }`}
      >
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <p className="mt-1 text-sm font-semibold tabular-nums leading-none">
        {primary}
      </p>
      <p className="mt-1 text-[11px] text-muted-foreground">{secondary}</p>
    </div>
  );
}
