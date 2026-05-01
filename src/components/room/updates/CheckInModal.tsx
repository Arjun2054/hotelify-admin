// src/components/room/CheckInModal.tsx
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
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RoomStatusBadge } from "@/components/room/RoomStatusBadge";
import type { Room, CheckInPayload } from "@/types/room-types";
import {
  BedDouble,
  User,
  Mail,
  Calendar,
  LogIn,
  DollarSign,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: Room | null;
  onConfirm: (roomId: string, data: CheckInPayload) => Promise<void>;
}

interface FormState {
  guestName: string;
  guestEmail: string;
  checkIn: string;
  notes: string;
}

interface FormErrors {
  guestName?: string;
  guestEmail?: string;
  checkIn?: string;
}

const defaultForm = (): FormState => ({
  guestName: "",
  guestEmail: "",
  checkIn: new Date().toISOString().split("T")[0],
  notes: "",
});

export function CheckInModal({
  isOpen,
  onClose,
  room,
  onConfirm,
}: CheckInModalProps) {
  const [form, setForm] = useState<FormState>(defaultForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const patch = (key: keyof FormState, val: string) =>
    setForm((p) => ({ ...p, [key]: val }));

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.guestName.trim()) e.guestName = "Guest name is required";
    if (form.guestEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.guestEmail))
      e.guestEmail = "Enter a valid email address";
    if (!form.checkIn) e.checkIn = "Check-in date is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!room || !validate()) return;
    setIsLoading(true);
    try {
      await onConfirm(room.id, {
        guestName: form.guestName.trim(),
        guestEmail: form.guestEmail || undefined,
        checkIn: form.checkIn,
        notes: form.notes || undefined,
      });
      setForm(defaultForm());
      setErrors({});
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
      setTimeout(() => {
        setForm(defaultForm());
        setErrors({});
      }, 200);
    }
  };

  if (!room) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LogIn className="h-5 w-5 text-emerald-600" />
            Check In Guest
          </DialogTitle>
          <DialogDescription>
            Register a new guest for room {room.roomNumber}
          </DialogDescription>
        </DialogHeader>

        {/* Room info */}
        <div className="rounded-xl bg-muted/50 border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900 flex-shrink-0">
              <BedDouble className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold">Room {room.roomNumber}</p>
                <RoomStatusBadge status={room.status} />
              </div>
              <p className="text-sm text-muted-foreground">
                Floor {room.floor} · {room.roomType.name}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="flex items-center gap-0.5 font-bold text-lg">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                {Number(room.roomType.basePrice).toFixed(0)}
              </div>
              <p className="text-[10px] text-muted-foreground">per night</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Form */}
        <div className="space-y-4">
          {/* Guest Name */}
          <div className="space-y-2">
            <Label htmlFor="guestName">
              Guest Name <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="guestName"
                placeholder="Full name"
                value={form.guestName}
                onChange={(e) => patch("guestName", e.target.value)}
                className={cn(
                  "pl-9",
                  errors.guestName &&
                    "border-destructive focus-visible:ring-destructive",
                )}
              />
            </div>
            {errors.guestName && (
              <p className="flex items-center gap-1.5 text-xs text-destructive">
                <AlertCircle className="h-3.5 w-3.5" />
                {errors.guestName}
              </p>
            )}
          </div>

          {/* Guest Email */}
          <div className="space-y-2">
            <Label htmlFor="guestEmail">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="guestEmail"
                type="email"
                placeholder="guest@example.com"
                value={form.guestEmail}
                onChange={(e) => patch("guestEmail", e.target.value)}
                className={cn(
                  "pl-9",
                  errors.guestEmail &&
                    "border-destructive focus-visible:ring-destructive",
                )}
              />
            </div>
            {errors.guestEmail && (
              <p className="flex items-center gap-1.5 text-xs text-destructive">
                <AlertCircle className="h-3.5 w-3.5" />
                {errors.guestEmail}
              </p>
            )}
          </div>

          {/* Check-in Date */}
          <div className="space-y-2">
            <Label htmlFor="checkIn">
              Check-in Date <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="checkIn"
                type="date"
                value={form.checkIn}
                onChange={(e) => patch("checkIn", e.target.value)}
                className={cn(
                  "pl-9",
                  errors.checkIn &&
                    "border-destructive focus-visible:ring-destructive",
                )}
              />
            </div>
            {errors.checkIn && (
              <p className="flex items-center gap-1.5 text-xs text-destructive">
                <AlertCircle className="h-3.5 w-3.5" />
                {errors.checkIn}
              </p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Special requests, preferences..."
              value={form.notes}
              onChange={(e) => patch("notes", e.target.value)}
              rows={2}
              className="resize-none"
            />
          </div>
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
            onClick={handleSubmit}
            disabled={isLoading}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {isLoading ? (
              <>
                <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Checking In...
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                Confirm Check In
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
