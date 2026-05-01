// src/components/room/CreateRoomModal.tsx
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
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { CreateRoomPayload, RoomType } from "@/types/room-types";
import { AlertCircle, Plus, Pencil } from "lucide-react";
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
  { value: "Ocean", label: "🌊 Ocean" },
  { value: "Garden", label: "🌿 Garden" },
  { value: "City", label: "🏙️ City" },
  { value: "Pool", label: "🏊 Pool" },
  { value: "Mountain", label: "⛰️ Mountain" },
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {editMode ? (
              <Pencil className="h-5 w-5 text-primary" />
            ) : (
              <Plus className="h-5 w-5 text-primary" />
            )}
            {editMode ? "Edit Room" : "Create New Room"}
          </DialogTitle>
          <DialogDescription>
            {editMode
              ? "Update the room details below"
              : "Fill in the details to add a new room"}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[65vh] pr-1">
          <div className="space-y-5 py-1 pr-3">
            {/* Room Type */}
            <div className="space-y-2">
              <Label>
                Room Type <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.roomTypeId}
                onValueChange={(v) => patch("roomTypeId", v)}
              >
                <SelectTrigger
                  className={cn(errors.roomTypeId && "border-destructive")}
                >
                  <SelectValue placeholder="Select a room type" />
                </SelectTrigger>
                <SelectContent>
                  {roomTypes.map((rt) => (
                    <SelectItem key={rt.id} value={rt.id}>
                      <div className="flex items-center justify-between gap-4 w-full">
                        <span>{rt.name}</span>
                        <span className="text-muted-foreground text-xs">
                          ${Number(rt.basePrice).toFixed(0)}/night · max{" "}
                          {rt.maxOccupancy}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.roomTypeId && (
                <p className="flex items-center gap-1.5 text-xs text-destructive">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errors.roomTypeId}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Room Number */}
              <div className="space-y-2">
                <Label htmlFor="roomNumber">
                  Room Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="roomNumber"
                  placeholder="e.g. 101, A-205"
                  value={form.roomNumber}
                  onChange={(e) => patch("roomNumber", e.target.value)}
                  className={cn(errors.roomNumber && "border-destructive")}
                />
                {errors.roomNumber && (
                  <p className="flex items-center gap-1.5 text-xs text-destructive">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.roomNumber}
                  </p>
                )}
              </div>

              {/* Floor */}
              <div className="space-y-2">
                <Label htmlFor="floor">
                  Floor <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="floor"
                  type="number"
                  min={0}
                  placeholder="Floor number"
                  value={form.floor}
                  onChange={(e) => patch("floor", Number(e.target.value))}
                  className={cn(errors.floor && "border-destructive")}
                />
                {errors.floor && (
                  <p className="flex items-center gap-1.5 text-xs text-destructive">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.floor}
                  </p>
                )}
              </div>
            </div>

            {/* View Type */}
            <div className="space-y-2">
              <Label>View Type</Label>
              <Select
                value={form.viewType || "NONE"}
                onValueChange={(v) => patch("viewType", v === "NONE" ? "" : v)}
              >
                <SelectTrigger>
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
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes about this room..."
                value={form.notes ?? ""}
                onChange={(e) => patch("notes", e.target.value)}
                rows={2}
                className="resize-none"
              />
            </div>

            <Separator />

            {/* Toggles */}
            <div className="space-y-3">
              <p className="text-sm font-medium">Room Features</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-xl border bg-muted/30 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">Corner Room</p>
                    <p className="text-xs text-muted-foreground">
                      Located at the building corner
                    </p>
                  </div>
                  <Switch
                    checked={form.isCorner ?? false}
                    onCheckedChange={(v) => patch("isCorner", v)}
                  />
                </div>

                <div className="flex items-center justify-between rounded-xl border bg-muted/30 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">Accessible Room</p>
                    <p className="text-xs text-muted-foreground">
                      Wheelchair accessible features available
                    </p>
                  </div>
                  <Switch
                    checked={form.isAccessible ?? false}
                    onCheckedChange={(v) => patch("isAccessible", v)}
                  />
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

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
              <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : editMode ? (
              <Pencil className="h-4 w-4" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            {editMode ? "Save Changes" : "Create Room"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
