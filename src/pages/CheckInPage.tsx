import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  ArrowLeft,
  BedDouble,
  Layers,
  Users,
  DollarSign,
  LogIn,
  Loader2,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { useRoomStore } from "@/store/room/useRoomStore";
import { useRoomAssignmentStore } from "@/store/room/useRoomAssignmentStore";
import type { CheckInPayload } from "@/types/room-types";
import { RoomStatusBadge } from "@/components/room/RoomStatusBadge";

export default function CheckInPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();

  const {
    selectedRoom,
    isLoading: roomLoading,
    fetchRoomById,
  } = useRoomStore();
  const { checkIn, isLoading: checkInLoading } = useRoomAssignmentStore();

  const [showConfirm, setShowConfirm] = useState(false);
  const [formData, setFormData] = useState<CheckInPayload | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckInPayload>({
    defaultValues: {
      guestName: "",
      guestEmail: "",
      checkIn: new Date().toISOString().slice(0, 16),
      notes: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (roomId) {
      fetchRoomById(roomId);
    }
  }, [roomId]);

  const room = selectedRoom;

  // ── Validation: Room must be available ─────────────────
  const canCheckIn =
    room && !roomLoading && room.status === "AVAILABLE" && !room.currentGuest;

  // ── Form Submit → Show confirmation ────────────────────
  const onFormSubmit = (data: CheckInPayload) => {
    setFormData({
      ...data,
      checkIn: new Date(data.checkIn).toISOString(),
    });
    setShowConfirm(true);
  };

  // ── Confirmed → Execute check-in ──────────────────────
  const executeCheckIn = async () => {
    if (!formData || !roomId) return;

    try {
      await checkIn(roomId, formData);
      setSuccess(true);
      toast.success(
        `${formData.guestName} checked into Room ${room?.roomNumber}`,
      );

      // Refresh room data
      fetchRoomById(roomId);

      // Redirect after short delay
      setTimeout(() => {
        navigate(`/rooms/${roomId}`);
      }, 2000);
    } catch (err) {
      toast.error((err as Error).message);
    }
    setShowConfirm(false);
  };

  // ── Loading state ──────────────────────────────────────
  if (roomLoading || !room) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  // ── Success state ──────────────────────────────────────
  if (success) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="border-emerald-200 bg-emerald-50/50">
          <CardContent className="p-12 text-center">
            <div className="inline-flex p-4 rounded-full bg-emerald-100 mb-6">
              <CheckCircle className="h-12 w-12 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-emerald-900 mb-2">
              Check-In Successful!
            </h2>
            <p className="text-emerald-700 mb-1">
              <strong>{formData?.guestName}</strong> has been checked into
            </p>
            <p className="text-3xl font-bold text-emerald-800 mb-6">
              Room {room.roomNumber}
            </p>
            <div className="flex gap-3 justify-center">
              <Link to={`/rooms/${roomId}`}>
                <Button variant="outline">
                  <BedDouble className="mr-2 h-4 w-4" /> View Room
                </Button>
              </Link>
              <Link to="/rooms">
                <Button>Back to Rooms</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Room not available ─────────────────────────────────
  if (!canCheckIn) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Check In</h1>
        </div>

        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-amber-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-amber-900 mb-2">
              Cannot Check In
            </h2>
            <p className="text-amber-700 mb-2">
              Room {room.roomNumber} is currently{" "}
              <strong>{room.status.toLowerCase().replace("_", " ")}</strong>.
            </p>
            {room.currentGuest && (
              <p className="text-amber-700 mb-4">
                Current guest: <strong>{room.currentGuest.guestName}</strong>
              </p>
            )}
            <p className="text-sm text-amber-600 mb-6">
              Only rooms with "Available" status can accept check-ins.
            </p>
            <div className="flex gap-3 justify-center">
              <Link to={`/rooms/${roomId}`}>
                <Button variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Room
                </Button>
              </Link>
              <Link to="/rooms">
                <Button>All Rooms</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Main Check-In Form ─────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            Check In — Room {room.roomNumber}
          </h1>
          <p className="text-muted-foreground">
            Register a new guest for this room
          </p>
        </div>
      </div>

      {/* Room Summary Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-50">
                <BedDouble className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Room {room.roomNumber}</h3>
                <p className="text-sm text-muted-foreground">
                  {room.roomType.name} · Floor {room.floor}
                  {room.viewType && ` · ${room.viewType} view`}
                </p>
              </div>
            </div>
            <div className="text-right">
              <RoomStatusBadge status={room.status} />
              <p className="text-lg font-bold mt-1">
                {formatCurrency(room.roomType.basePrice)}
                <span className="text-xs font-normal text-muted-foreground">
                  /night
                </span>
              </p>
            </div>
          </div>

          {/* Room features */}
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Floor {room.floor}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                Max {room.roomType.maxOccupancy} guests
              </span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {formatCurrency(room.roomType.basePrice)}/night
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Check-In Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LogIn className="h-5 w-5" />
            Guest Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
            {/* Guest Name */}
            <div className="space-y-2">
              <Label htmlFor="guestName" className="text-sm font-medium">
                Guest Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="guestName"
                {...register("guestName", {
                  required: "Guest name is required",
                  minLength: {
                    value: 2,
                    message: "Name must be at least 2 characters",
                  },
                })}
                placeholder="Enter guest's full name"
                className="h-11"
                autoFocus
              />
              {errors.guestName && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {errors.guestName.message}
                </p>
              )}
            </div>

            {/* Guest Email */}
            <div className="space-y-2">
              <Label htmlFor="guestEmail" className="text-sm font-medium">
                Email Address
              </Label>
              <Input
                id="guestEmail"
                type="email"
                {...register("guestEmail", {
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Invalid email address",
                  },
                })}
                placeholder="guest@example.com (optional)"
                className="h-11"
              />
              {errors.guestEmail && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {errors.guestEmail.message}
                </p>
              )}
            </div>

            {/* Check-In Date/Time */}
            <div className="space-y-2">
              <Label htmlFor="checkIn" className="text-sm font-medium">
                Check-In Date & Time <span className="text-red-500">*</span>
              </Label>
              <Input
                id="checkIn"
                type="datetime-local"
                {...register("checkIn", {
                  required: "Check-in date is required",
                })}
                className="h-11"
              />
              {errors.checkIn && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {errors.checkIn.message}
                </p>
              )}
            </div>

            <Separator />

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium">
                Special Requests / Notes
              </Label>
              <Textarea
                id="notes"
                {...register("notes")}
                placeholder="Any special requests, preferences, or notes about the guest..."
                rows={4}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button
                type="submit"
                size="lg"
                className="px-8"
                disabled={checkInLoading}
              >
                {checkInLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <LogIn className="mr-2 h-4 w-4" />
                )}
                Check In Guest
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* ── Confirmation Dialog ──────────────────────────── */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Check-In</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>Please confirm the following check-in details:</p>
                <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Guest:</span>
                    <span className="font-medium text-foreground">
                      {formData?.guestName}
                    </span>
                  </div>
                  {formData?.guestEmail && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="text-foreground">
                        {formData.guestEmail}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Room:</span>
                    <span className="font-medium text-foreground">
                      {room.roomNumber} ({room.roomType.name})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Check-In:</span>
                    <span className="text-foreground">
                      {formData
                        ? new Date(formData.checkIn).toLocaleString()
                        : ""}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rate:</span>
                    <span className="font-medium text-foreground">
                      {formatCurrency(room.roomType.basePrice)}/night
                    </span>
                  </div>
                </div>
                {formData?.notes && (
                  <div>
                    <span className="text-muted-foreground text-sm">
                      Notes:
                    </span>
                    <p className="text-sm text-foreground mt-1">
                      {formData.notes}
                    </p>
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Go Back</AlertDialogCancel>
            <AlertDialogAction
              onClick={executeCheckIn}
              disabled={checkInLoading}
            >
              {checkInLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Confirm Check-In
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
