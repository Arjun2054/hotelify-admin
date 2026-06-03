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
import { cn } from "@/lib/utils";
import { RoomStatusBadge } from "@/components/room/RoomStatusBadge";
import type { Room, RoomStatus } from "@/types/room-types";
import {
  CheckCircle2,
  Sparkles,
  Wrench,
  AlertTriangle,
  ArrowRight,
  Check,
} from "lucide-react";

interface RoomStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: Room | null;
  onConfirm: (id: string, status: RoomStatus) => Promise<void>;
}

interface StatusOption {
  value: RoomStatus;
  label: string;
  description: string;
  icon: React.ElementType;
  iconTone: string;
  disabled?: (current: RoomStatus) => boolean;
}

const STATUS_OPTIONS: StatusOption[] = [
  {
    value: "AVAILABLE",
    label: "Available",
    description: "Clean and ready for new guests",
    icon: CheckCircle2,
    iconTone: "text-emerald-600 dark:text-emerald-400",
  },
  {
    value: "CLEANING",
    label: "Cleaning",
    description: "Housekeeping is in progress",
    icon: Sparkles,
    iconTone: "text-amber-600 dark:text-amber-400",
    disabled: (s) => s === "OCCUPIED",
  },
  {
    value: "MAINTENANCE",
    label: "Maintenance",
    description: "Needs repairs or service",
    icon: Wrench,
    iconTone: "text-orange-600 dark:text-orange-400",
    disabled: (s) => s === "OCCUPIED",
  },
  {
    value: "OUT_OF_ORDER",
    label: "Out of order",
    description: "Unavailable until further notice",
    icon: AlertTriangle,
    iconTone: "text-red-600 dark:text-red-400",
    disabled: (s) => s === "OCCUPIED",
  },
];

export function RoomStatusModal({
  isOpen,
  onClose,
  room,
  onConfirm,
}: RoomStatusModalProps) {
  const [selected, setSelected] = useState<RoomStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    if (!room || !selected) return;
    setIsLoading(true);
    try {
      await onConfirm(room.id, selected);
      setSelected(null);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
      setSelected(null);
    }
  };

  if (!room) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="gap-0 p-0 sm:max-w-md">
        {/* ── Header ── */}
        <DialogHeader className="space-y-1.5 px-6 pt-6 pb-5">
          <DialogTitle className="text-base font-semibold tracking-tight">
            Update room status
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Change the operational status of room {room.roomNumber}.
          </DialogDescription>
        </DialogHeader>

        {/* ── Transition strip ── */}
        <div className="flex items-center gap-3 border-y border-border/60 bg-muted/30 px-6 py-3 text-xs">
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            From
          </span>
          <RoomStatusBadge status={room.status} showDot />
          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/60" />
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            To
          </span>
          {selected ? (
            <RoomStatusBadge status={selected} showDot />
          ) : (
            <span className="text-xs text-muted-foreground/70 italic">
              Select below
            </span>
          )}
        </div>

        {/* ── Options ── */}
        <div className="px-6 py-5">
          <p className="mb-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            New status
          </p>

          <div
            role="radiogroup"
            aria-label="Room status"
            className="divide-y divide-border/60 overflow-hidden rounded-md border border-border/60"
          >
            {STATUS_OPTIONS.map((opt) => {
              const isDisabled =
                opt.disabled?.(room.status) || opt.value === room.status;
              const isCurrent = opt.value === room.status;
              const isSelected = selected === opt.value;
              const Icon = opt.icon;

              return (
                <button
                  key={opt.value}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  disabled={isDisabled}
                  onClick={() => setSelected(opt.value)}
                  className={cn(
                    "group flex w-full items-center gap-3 px-3.5 py-3 text-left transition-colors",
                    "focus:outline-none focus-visible:bg-muted/60",
                    !isDisabled && "hover:bg-muted/40 cursor-pointer",
                    isDisabled && "cursor-not-allowed opacity-50",
                    isSelected && "bg-muted/60",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0",
                      isDisabled ? "text-muted-foreground" : opt.iconTone,
                    )}
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium leading-none">
                        {opt.label}
                      </p>
                      {isCurrent && (
                        <span className="rounded-sm bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {opt.description}
                    </p>
                  </div>

                  {/* Radio indicator */}
                  <span
                    aria-hidden
                    className={cn(
                      "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors",
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background",
                    )}
                  >
                    {isSelected && <Check className="h-2.5 w-2.5" />}
                  </span>
                </button>
              );
            })}
          </div>

          {room.status === "OCCUPIED" && (
            <p className="mt-3 flex items-start gap-1.5 text-[11px] text-muted-foreground">
              <AlertTriangle className="mt-px h-3 w-3 shrink-0" />
              An occupied room must be checked out before changing status.
            </p>
          )}
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
            onClick={handleConfirm}
            disabled={!selected || isLoading}
            className="gap-1.5"
          >
            {isLoading && (
              <span className="h-3.5 w-3.5 rounded-full border-2 border-current/30 border-t-current animate-spin" />
            )}
            Update status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
