// src/components/room/RoomStatusModal.tsx
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
} from "lucide-react";

interface RoomStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: Room | null;
  onConfirm: (id: string, status: RoomStatus) => Promise<void>;
}

const STATUS_OPTIONS: {
  value: RoomStatus;
  label: string;
  description: string;
  icon: React.ElementType;
  className: string;
  disabled?: (current: RoomStatus) => boolean;
}[] = [
  {
    value: "AVAILABLE",
    label: "Available",
    description: "Room is clean and ready for new guests",
    icon: CheckCircle2,
    className:
      "border-emerald-200 bg-emerald-50/50 data-[selected=true]:border-emerald-500 data-[selected=true]:bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/20",
  },
  {
    value: "CLEANING",
    label: "Cleaning",
    description: "Room is currently being cleaned",
    icon: Sparkles,
    className:
      "border-amber-200 bg-amber-50/50 data-[selected=true]:border-amber-500 data-[selected=true]:bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20",
    disabled: (s) => s === "OCCUPIED",
  },
  {
    value: "MAINTENANCE",
    label: "Maintenance",
    description: "Room needs maintenance or repairs",
    icon: Wrench,
    className:
      "border-orange-200 bg-orange-50/50 data-[selected=true]:border-orange-500 data-[selected=true]:bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20",
    disabled: (s) => s === "OCCUPIED",
  },
  {
    value: "OUT_OF_ORDER",
    label: "Out of Order",
    description: "Room is unavailable for any reason",
    icon: AlertTriangle,
    className:
      "border-red-200 bg-red-50/50 data-[selected=true]:border-red-500 data-[selected=true]:bg-red-50 dark:border-red-800 dark:bg-red-950/20",
    disabled: (s) => s === "OCCUPIED",
  },
];

const ICON_COLORS: Record<string, string> = {
  AVAILABLE: "text-emerald-600 dark:text-emerald-400",
  CLEANING: "text-amber-600 dark:text-amber-400",
  MAINTENANCE: "text-orange-600 dark:text-orange-400",
  OUT_OF_ORDER: "text-red-600 dark:text-red-400",
};

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
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Update Room Status</DialogTitle>
          <DialogDescription>
            Change the status of Room {room.roomNumber}
          </DialogDescription>
        </DialogHeader>

        {/* Current status */}
        <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-sm">
          <span className="text-muted-foreground">Current:</span>
          <RoomStatusBadge status={room.status} showDot />
          {selected && (
            <>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground mx-1" />
              <RoomStatusBadge status={selected} showDot />
            </>
          )}
        </div>

        {/* Options */}
        <div className="space-y-2">
          {STATUS_OPTIONS.map((opt) => {
            const isDisabled =
              opt.disabled?.(room.status) || opt.value === room.status;
            const isSelected = selected === opt.value;

            return (
              <button
                key={opt.value}
                disabled={isDisabled}
                onClick={() => setSelected(opt.value)}
                data-selected={isSelected}
                className={cn(
                  "w-full rounded-xl border p-3 text-left transition-all duration-150",
                  "disabled:cursor-not-allowed disabled:opacity-40",
                  opt.className,
                )}
              >
                <div className="flex items-center gap-3">
                  <opt.icon
                    className={cn(
                      "h-4 w-4 flex-shrink-0",
                      ICON_COLORS[opt.value],
                    )}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{opt.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {opt.description}
                    </p>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selected || isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : null}
            Update Status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
