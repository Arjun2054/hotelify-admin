import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { CreateRoomPayload, RoomType } from "@/types/room-types";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomTypes: RoomType[];
  onConfirm: (data: CreateRoomPayload) => Promise<void>;
  initialData?: Partial<CreateRoomPayload>;
  editMode?: boolean;
  roomId?: string;
  onUpdate?: (id: string, data: Partial<CreateRoomPayload>) => Promise<void>;
}

const VIEW_OPTIONS = [
  { value: "NONE", label: "No specific view" },
  { value: "Ocean", label: "Ocean" },
  { value: "Garden", label: "Garden" },
  { value: "City", label: "City" },
  { value: "Pool", label: "Pool" },
  { value: "Mountain", label: "Mountain" },
];

type FormErrors = Partial<Record<keyof CreateRoomPayload, string>>;

function defaultForm(initial?: Partial<CreateRoomPayload>): CreateRoomPayload {
  return {
    roomTypeId: initial?.roomTypeId ?? "",
    roomNumber: initial?.roomNumber ?? "",
    floor: initial?.floor ?? 1,
    status: initial?.status ?? "AVAILABLE",
    isCorner: initial?.isCorner ?? false,
    isAccessible: initial?.isAccessible ?? false,
    viewType: initial?.viewType ?? "",
    notes: initial?.notes ?? "",
  };
}

export function CreateRoomModal({
  isOpen,
  onClose,
  roomTypes,
  onConfirm,
  initialData,
  editMode = false,
  roomId,
  onUpdate,
}: CreateRoomModalProps) {
  const [form, setForm] = useState<CreateRoomPayload>(() =>
    defaultForm(initialData),
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm(defaultForm(initialData));
      setErrors({});
    }
  }, [isOpen, initialData]);

  const patch = <K extends keyof CreateRoomPayload>(
    key: K,
    val: CreateRoomPayload[K],
  ) => setForm((p) => ({ ...p, [key]: val }));

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.roomTypeId) e.roomTypeId = "Room type is required";
    if (!form.roomNumber.trim()) e.roomNumber = "Room number is required";
    if (form.floor === undefined || form.floor < 0)
      e.floor = "Valid floor number is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsLoading(true);
    try {
      const payload: CreateRoomPayload = {
        ...form,
        viewType:
          form.viewType === "NONE" || !form.viewType
            ? undefined
            : form.viewType,
        notes: form.notes || undefined,
      };
      if (editMode && roomId && onUpdate) {
        await onUpdate(roomId, payload);
      } else {
        await onConfirm(payload);
      }
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="gap-0 p-0 sm:max-w-lg">
        {/* ── Header ── */}
        <DialogHeader className="space-y-1.5 px-6 pt-6 pb-5">
          <DialogTitle className="text-base font-semibold tracking-tight">
            {editMode ? "Edit room" : "Create new room"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {editMode
              ? "Update the details for this room."
              : "Add a new room to your inventory."}
          </DialogDescription>
        </DialogHeader>

        {/* ── Body ── */}
        <div className="border-y border-border/60">
          <ScrollArea className="max-h-[65vh]">
            <div className="space-y-6 px-6 py-5">
              {/* ── Section: Basics ── */}
              <Section title="Basics">
                {/* Room Type */}
                <Field
                  id="roomTypeId"
                  label="Room type"
                  required
                  error={errors.roomTypeId}
                >
                  <Select
                    value={form.roomTypeId}
                    onValueChange={(v) => patch("roomTypeId", v)}
                  >
                    <SelectTrigger
                      id="roomTypeId"
                      className={cn(
                        "h-9 text-sm",
                        errors.roomTypeId &&
                          "border-destructive focus-visible:ring-destructive/30",
                      )}
                    >
                      <SelectValue placeholder="Select a room type" />
                    </SelectTrigger>
                    <SelectContent>
                      {roomTypes.map((rt) => (
                        <SelectItem key={rt.id} value={rt.id}>
                          <div className="flex w-full items-center justify-between gap-4">
                            <span>{rt.name}</span>
                            <span className="text-xs text-muted-foreground tabular-nums">
                              NPR{Number(rt.basePrice).toFixed(0)}/night · max{" "}
                              {rt.maxOccupancy}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  {/* Room Number */}
                  <Field
                    id="roomNumber"
                    label="Room number"
                    required
                    error={errors.roomNumber}
                  >
                    <Input
                      id="roomNumber"
                      placeholder="e.g. 101, A-205"
                      value={form.roomNumber}
                      onChange={(e) => patch("roomNumber", e.target.value)}
                      className={cn(
                        "h-9 text-sm",
                        errors.roomNumber &&
                          "border-destructive focus-visible:ring-destructive/30",
                      )}
                    />
                  </Field>

                  {/* Floor */}
                  <Field id="floor" label="Floor" required error={errors.floor}>
                    <Input
                      id="floor"
                      type="number"
                      min={0}
                      placeholder="0"
                      value={form.floor}
                      onChange={(e) => patch("floor", Number(e.target.value))}
                      className={cn(
                        "h-9 text-sm tabular-nums",
                        errors.floor &&
                          "border-destructive focus-visible:ring-destructive/30",
                      )}
                    />
                  </Field>
                </div>
              </Section>

              {/* ── Section: Details ── */}
              <Section title="Details">
                {/* View Type */}
                <Field id="viewType" label="View type">
                  <Select
                    value={form.viewType || "NONE"}
                    onValueChange={(v) =>
                      patch("viewType", v === "NONE" ? "" : v)
                    }
                  >
                    <SelectTrigger id="viewType" className="h-9 text-sm">
                      <SelectValue placeholder="Select view type" />
                    </SelectTrigger>
                    <SelectContent>
                      {VIEW_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                {/* Notes */}
                <Field id="notes" label="Notes">
                  <Textarea
                    id="notes"
                    placeholder="Additional notes about this room…"
                    value={form.notes ?? ""}
                    onChange={(e) => patch("notes", e.target.value)}
                    rows={3}
                    className="resize-none text-sm"
                  />
                </Field>
              </Section>

              {/* ── Section: Features ── */}
              <Section title="Features">
                <div className="divide-y divide-border/60 overflow-hidden rounded-md border border-border/60">
                  <FeatureToggle
                    label="Corner room"
                    description="Located at the building corner"
                    checked={form.isCorner ?? false}
                    onChange={(v) => patch("isCorner", v)}
                  />
                  <FeatureToggle
                    label="Accessible room"
                    description="Wheelchair-accessible features"
                    checked={form.isAccessible ?? false}
                    onChange={(v) => patch("isAccessible", v)}
                  />
                </div>
              </Section>
            </div>
          </ScrollArea>
        </div>

        {/* ── Footer ── */}
        <DialogFooter className="gap-2 bg-muted/20 px-6 py-4 sm:gap-2">
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
            {isLoading && (
              <span className="h-3.5 w-3.5 rounded-full border-2 border-current/30 border-t-current animate-spin" />
            )}
            {editMode ? "Save changes" : "Create room"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ──────────────────────────────────────────────────────────── */
/*  Internal layout primitives                                   */
/* ──────────────────────────────────────────────────────────── */

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

function Section({ title, children }: SectionProps) {
  return (
    <section className="space-y-3">
      <h3 className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

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

interface FeatureToggleProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}

function FeatureToggle({
  label,
  description,
  checked,
  onChange,
}: FeatureToggleProps) {
  return (
    <div className="flex items-center justify-between gap-4 px-3.5 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium leading-none">{label}</p>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
