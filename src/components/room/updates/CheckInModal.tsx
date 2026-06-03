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
import { RoomStatusBadge } from "@/components/room/RoomStatusBadge";
import type { Room, CheckInPayload } from "@/types/room-types";
import { User, Mail, Calendar, LogIn, AlertCircle, Layers } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

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
      <DialogContent className="gap-0 p-0 sm:max-w-md">
        {/* ── Header ── */}
        <DialogHeader className="space-y-1.5 px-6 pt-6 pb-5">
          <DialogTitle className="text-base font-semibold tracking-tight">
            Check in guest
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Register a new guest for room {room.roomNumber}.
          </DialogDescription>
        </DialogHeader>

        {/* ── Room summary strip ── */}
        <div className="flex items-center justify-between gap-3 border-y border-border/60 bg-muted/30 px-6 py-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold tabular-nums tracking-tight">
                Room {room.roomNumber}
              </span>
              <RoomStatusBadge status={room.status} showDot />
            </div>
            <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Layers className="h-3 w-3" />
                Floor {room.floor}
              </span>
              <span aria-hidden className="text-border">
                ·
              </span>
              <span className="truncate">{room.roomType.name}</span>
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-sm font-semibold tabular-nums leading-none">
              {formatCurrency(room.roomType.basePrice)}
            </p>
            <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
              per night
            </p>
          </div>
        </div>

        {/* ── Form ── */}
        <div className="space-y-4 px-6 py-5">
          {/* Guest Name */}
          <Field
            id="guestName"
            label="Guest name"
            required
            error={errors.guestName}
          >
            <FieldInput
              icon={User}
              id="guestName"
              placeholder="Full name"
              value={form.guestName}
              onChange={(e) => patch("guestName", e.target.value)}
              hasError={!!errors.guestName}
              autoFocus
            />
          </Field>

          {/* Guest Email */}
          <Field
            id="guestEmail"
            label="Email address"
            error={errors.guestEmail}
          >
            <FieldInput
              icon={Mail}
              id="guestEmail"
              type="email"
              placeholder="guest@example.com"
              value={form.guestEmail}
              onChange={(e) => patch("guestEmail", e.target.value)}
              hasError={!!errors.guestEmail}
            />
          </Field>

          {/* Check-in Date */}
          <Field
            id="checkIn"
            label="Check-in date"
            required
            error={errors.checkIn}
          >
            <FieldInput
              icon={Calendar}
              id="checkIn"
              type="date"
              value={form.checkIn}
              onChange={(e) => patch("checkIn", e.target.value)}
              hasError={!!errors.checkIn}
            />
          </Field>

          {/* Notes */}
          <div className="space-y-1.5">
            <div className="flex items-baseline justify-between">
              <Label htmlFor="notes" className="text-xs font-medium">
                Notes
              </Label>
              <span className="text-[10px] text-muted-foreground">
                Optional
              </span>
            </div>
            <Textarea
              id="notes"
              placeholder="Special requests, preferences…"
              value={form.notes}
              onChange={(e) => patch("notes", e.target.value)}
              rows={3}
              className="resize-none text-sm"
            />
          </div>
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
                Checking in…
              </>
            ) : (
              <>
                <LogIn className="h-3.5 w-3.5" />
                Confirm check in
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ──────────────────────────────────────────────────────────── */
/*  Small internal helpers — keep markup DRY and consistent     */
/* ──────────────────────────────────────────────────────────── */

interface FieldProps {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}

function Field({ id, label, required, error, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <Label htmlFor={id} className="text-xs font-medium">
          {label}
          {required && (
            <span className="ml-0.5 text-destructive" aria-hidden>
              *
            </span>
          )}
        </Label>
        {!required && (
          <span className="text-[10px] text-muted-foreground">Optional</span>
        )}
      </div>
      {children}
      {error && (
        <p className="flex items-center gap-1 text-[11px] text-destructive">
          <AlertCircle className="h-3 w-3 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

interface FieldInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon: React.ComponentType<{ className?: string }>;
  hasError?: boolean;
}

function FieldInput({
  icon: Icon,
  hasError,
  className,
  ...props
}: FieldInputProps) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
      <Input
        {...props}
        className={cn(
          "h-9 pl-9 text-sm",
          hasError && "border-destructive focus-visible:ring-destructive/30",
          className,
        )}
      />
    </div>
  );
}
