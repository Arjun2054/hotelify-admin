import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import type { Room, CheckInPayload } from "@/types/room-types";

interface Props {
  open: boolean;
  room: Room | null;
  isLoading: boolean;
  onClose: () => void;
  onSubmit: (roomId: string, data: CheckInPayload) => Promise<void>;
}

export function CheckInDialog({
  open,
  room,
  isLoading,
  onClose,
  onSubmit,
}: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CheckInPayload>({
    defaultValues: {
      checkIn: new Date().toISOString().slice(0, 16),
    },
  });

  const onFormSubmit = async (data: CheckInPayload) => {
    if (!room) return;
    await onSubmit(room.id, {
      // ← roomId is the first arg
      ...data, // ← body is the second arg
      checkIn: new Date(data.checkIn).toISOString(),
    });
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Check In — Room {room?.roomNumber}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="guestName">Guest Name *</Label>
            <Input
              id="guestName"
              {...register("guestName", { required: "Guest name is required" })}
              placeholder="John Doe"
            />
            {errors.guestName && (
              <p className="text-xs text-red-500">{errors.guestName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="guestEmail">Email</Label>
            <Input
              id="guestEmail"
              type="email"
              {...register("guestEmail")}
              placeholder="john@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="checkIn">Check-In Date/Time *</Label>
            <Input
              id="checkIn"
              type="datetime-local"
              {...register("checkIn", {
                required: "Check-in date is required",
              })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              placeholder="Special requests, preferences..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Check In
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
