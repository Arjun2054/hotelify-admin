import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { EmptyState } from "@/components/ui/empty-state";
import { PageLoader } from "@/components/ui/page-loader";
import type { RoomStatus, CheckInPayload } from "@/types/room-types";
import type { AddRoomItemPayload } from "@/types/hotelItem-types";
import {
  ArrowLeft,
  BedDouble,
  User,
  Layers,
  Eye,
  Accessibility,
  LogIn,
  LogOut,
  Settings2,
  Pencil,
  Trash2,
  Package,
  Plus,
  Clock,
  Calendar,
  X,
  DollarSign,
  Hash,
  Wrench,
  History,
  MoreVertical,
  Building2,
  Shield,
  TrendingUp,
  Star,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRoomStore } from "@/store/room/useRoomStore";
import { useHotelItemStore } from "@/store/hotel/useHotelItemStore";
import { useRoomAssignmentStore } from "@/store/room/useRoomAssignmentStore";
import { useRoomTypeStore } from "@/store/room/roomTypeStore";
import { CheckOutModal } from "@/components/room/updates/CheckOutModal";
import { RoomStatusModal } from "@/components/room/updates/RoomStatusModal";
import { CreateRoomModal } from "@/components/room/updates/CreateRoomModal";
import { AddRoomItemModal } from "@/components/room/updates/AddRoomItemModal";
import { CheckInModal } from "@/components/room/updates/CheckInModal";
import { RoomStatusBadge } from "@/components/room/RoomStatusBadge";
import { useAuthStore } from "@/store/useAuthStore";

/* ─── Status config ─────────────────────────────────────────── */
const STATUS_CONFIG = {
  AVAILABLE: {
    gradient: "from-emerald-500 to-teal-500",
    softBg: "bg-emerald-50 dark:bg-emerald-950/40",
    iconBg:
      "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400",
    ring: "ring-emerald-200 dark:ring-emerald-800",
    text: "text-emerald-700 dark:text-emerald-300",
    Icon: Sparkles,
  },
  OCCUPIED: {
    gradient: "from-blue-500 to-indigo-500",
    softBg: "bg-blue-50 dark:bg-blue-950/40",
    iconBg: "bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400",
    ring: "ring-blue-200 dark:ring-blue-800",
    text: "text-blue-700 dark:text-blue-300",
    Icon: User,
  },
  CLEANING: {
    gradient: "from-amber-500 to-yellow-400",
    softBg: "bg-amber-50 dark:bg-amber-950/40",
    iconBg:
      "bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400",
    ring: "ring-amber-200 dark:ring-amber-800",
    text: "text-amber-700 dark:text-amber-300",
    Icon: Sparkles,
  },
  MAINTENANCE: {
    gradient: "from-orange-500 to-red-400",
    softBg: "bg-orange-50 dark:bg-orange-950/40",
    iconBg:
      "bg-orange-100 dark:bg-orange-900/60 text-orange-600 dark:text-orange-400",
    ring: "ring-orange-200 dark:ring-orange-800",
    text: "text-orange-700 dark:text-orange-300",
    Icon: Wrench,
  },
  OUT_OF_ORDER: {
    gradient: "from-red-500 to-rose-500",
    softBg: "bg-red-50 dark:bg-red-950/40",
    iconBg: "bg-red-100 dark:bg-red-900/60 text-red-600 dark:text-red-400",
    ring: "ring-red-200 dark:ring-red-800",
    text: "text-red-700 dark:text-red-300",
    Icon: AlertTriangle,
  },
} as const;

/* ─── Small reusable detail row ─────────────────────────────── */
function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5 shrink-0" />
        {label}
      </span>
      <span className="text-xs font-semibold text-foreground">{value}</span>
    </div>
  );
}

/* ─── Stat card ─────────────────────────────────────────────── */
function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-4 flex items-start gap-3">
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
          color,
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </p>
        <p className="mt-0.5 text-sm font-bold text-foreground leading-none">
          {value}
        </p>
        {sub && (
          <p className="mt-0.5 text-[11px] text-muted-foreground">{sub}</p>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════════ */
export default function RoomDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    getActiveOrganization,
    getActiveRole,
    getActiveDepartment,
    canPerformAction,
    isInDepartment,
  } = useAuthStore();

  const {
    selectedRoom,
    fetchRoomById,
    isLoading,
    updateRoom,
    updateRoomStatus,
    deleteRoom,
    addRoomItem,
    removeRoomItem,
  } = useRoomStore();

  const { roomTypes, fetchRoomTypes } = useRoomTypeStore();
  const { items, fetchItems } = useHotelItemStore();
  const { history, historyMeta, fetchHistory, checkIn, checkOut } =
    useRoomAssignmentStore();

  const [historyPage, setHistoryPage] = useState(1);
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [checkOutOpen, setCheckOutOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [removeItemId, setRemoveItemId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const activeOrg = getActiveOrganization();
  const role = getActiveRole();
  const department = getActiveDepartment();
  const isManager = canPerformAction(["OWNER", "ADMIN"]);
  const isStaff = role === "STAFF";
  const hasAccess = isManager || isInDepartment("FRONT_DESK");

  useEffect(() => {
    if (id) {
      fetchRoomById(id);
      fetchRoomTypes();
      fetchItems();
    }
  }, [id]);

  useEffect(() => {
    if (id && activeTab === "history") fetchHistory(id, historyPage);
  }, [id, activeTab, historyPage]);

  /* handlers */
  const handleCheckIn = async (roomId: string, data: CheckInPayload) => {
    await checkIn(roomId, data);
    toast.success("Guest checked in successfully");
    fetchRoomById(roomId);
  };
  const handleCheckOut = async (assignmentId: string, notes?: string) => {
    await checkOut(assignmentId, notes);
    toast.success("Guest checked out successfully");
    if (id) fetchRoomById(id);
  };
  const handleStatusChange = async (_: string, status: RoomStatus) => {
    if (!id) return;
    await updateRoomStatus(id, status);
    toast.success("Room status updated");
    fetchRoomById(id);
  };
  const handleUpdate = async (roomId: string, data: Partial<any>) => {
    await updateRoom(roomId, data);
    toast.success("Room updated");
    fetchRoomById(roomId);
  };
  const handleDelete = async () => {
    if (!id) return;
    setIsDeleting(true);
    try {
      await deleteRoom(id);
      toast.success("Room deleted");
      navigate("/hotel/rooms");
    } finally {
      setIsDeleting(false);
    }
  };
  const handleAddItem = async (data: AddRoomItemPayload) => {
    if (!id) return;
    await addRoomItem(id, data);
    toast.success("Item added to room");
  };
  const handleRemoveItem = async (roomItemId: string) => {
    await removeRoomItem(roomItemId);
    toast.success("Item removed");
    setRemoveItemId(null);
  };

  /* guards */
  if (isLoading && !selectedRoom)
    return <PageLoader label="Loading room details..." />;

  if (!selectedRoom)
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <EmptyState
          icon={BedDouble}
          title="Room not found"
          action={
            <Button
              variant="outline"
              onClick={() => navigate("/hotel/rooms")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Rooms
            </Button>
          }
        />
      </div>
    );

  const room = selectedRoom as any;
  const existingItemIds =
    room.roomItems?.map((ri: any) => ri.hotelItemId) ?? [];
  const cfg = STATUS_CONFIG[room.status as keyof typeof STATUS_CONFIG];
  const StatusIcon = cfg.Icon;

  if (!activeOrg)
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="max-w-sm w-full rounded-2xl border bg-card p-10 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-100 dark:bg-yellow-900/30">
            <Building2 className="h-7 w-7 text-yellow-600" />
          </div>
          <h2 className="text-base font-bold">No Organization Selected</h2>
          <p className="text-xs text-muted-foreground">
            Please select an organization to continue.
          </p>
        </div>
      </div>
    );

  if (!hasAccess)
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="max-w-sm w-full rounded-2xl border bg-card p-10 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-900/30">
            <Shield className="h-7 w-7 text-red-500" />
          </div>
          <h2 className="text-base font-bold">Access Restricted</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            You don't have access to this section.
            {isStaff && department && (
              <>
                {" "}
                Your department is{" "}
                <span className="font-semibold text-foreground">
                  {department}
                </span>
                . Only Front Desk staff can access this.
              </>
            )}
          </p>
        </div>
      </div>
    );

  /* ─── Render ──────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-muted/20 dark:bg-background">
      {/* ── Hero / Header strip ── */}
      <div className="relative overflow-hidden bg-card border-b border-border/60">
        {/* gradient bar */}
        <div
          className={cn(
            "absolute inset-x-0 top-0 h-[3px] bg-linear-to-r",
            cfg.gradient,
          )}
        />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-5 pb-6 space-y-5">
          {/* Back */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/hotel/rooms")}
            className="-ml-2 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Rooms
          </Button>

          {/* Identity + actions */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            {/* Left */}
            <div className="flex items-start gap-4">
              {/* status icon */}
              <div
                className={cn(
                  "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ring-1",
                  cfg.iconBg,
                  cfg.ring,
                )}
              >
                <StatusIcon className="h-6 w-6" />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold tracking-tight">
                    Room {room.roomNumber}
                  </h1>
                  <RoomStatusBadge status={room.status} showDot />
                  {room.isAccessible && (
                    <Badge variant="outline" className="gap-1 text-[11px]">
                      <Accessibility className="h-3 w-3" />
                      Accessible
                    </Badge>
                  )}
                  {room.isCorner && (
                    <Badge variant="outline" className="text-[11px]">
                      Corner
                    </Badge>
                  )}
                </div>
                <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <BedDouble className="h-3 w-3" />
                    {room.roomType.name}
                  </span>
                  <span className="text-border">·</span>
                  <span className="flex items-center gap-1">
                    <Layers className="h-3 w-3" />
                    Floor {room.floor}
                  </span>
                  {room.viewType && (
                    <>
                      <span className="text-border">·</span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {room.viewType} View
                      </span>
                    </>
                  )}
                  <span className="text-border">·</span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />$
                    {Number(room.roomType.basePrice).toFixed(0)}/night
                  </span>
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {room.status === "AVAILABLE" && (
                <Button
                  size="sm"
                  className="h-8 gap-1.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-200 dark:shadow-emerald-900/30"
                  onClick={() => setCheckInOpen(true)}
                >
                  <LogIn className="h-3.5 w-3.5" />
                  Check In
                </Button>
              )}
              {room.status === "OCCUPIED" && room.currentGuest && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 gap-1.5 text-xs font-medium"
                  onClick={() => setCheckOutOpen(true)}
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Check Out
                </Button>
              )}
              {isManager && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    {room.status !== "OCCUPIED" && (
                      <DropdownMenuItem
                        onClick={() => setStatusOpen(true)}
                        className="gap-2 text-xs"
                      >
                        <Settings2 className="h-3.5 w-3.5" /> Update Status
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => setEditOpen(true)}
                      className="gap-2 text-xs"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Edit Room
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setDeleteOpen(true)}
                      className="gap-2 text-xs text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete Room
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          {/* ── Quick-stat strip ── */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              label="Base Rate"
              value={`$${Number(room.roomType.basePrice).toFixed(0)}`}
              sub="per night"
              icon={DollarSign}
              color="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400"
            />
            <StatCard
              label="Max Occupancy"
              value={`${room.roomType.maxOccupancy} guests`}
              icon={User}
              color="bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
            />
            <StatCard
              label="Room Items"
              value={room.roomItems?.length ?? 0}
              sub="assigned"
              icon={Package}
              color="bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400"
            />
            <StatCard
              label="Total Stays"
              value={history.length || "—"}
              sub="recorded"
              icon={TrendingUp}
              color="bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400"
            />
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-5">
        {/* Current-guest banner */}
        {room.currentGuest && (
          <div className="flex flex-col gap-3 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/60 dark:bg-blue-950/20 p-4 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-200 dark:bg-blue-800 ring-2 ring-blue-100 dark:ring-blue-900">
                <span className="text-sm font-bold text-blue-700 dark:text-blue-300">
                  {room.currentGuest.guestName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 truncate">
                  {room.currentGuest.guestName}
                </p>
                <div className="flex flex-wrap items-center gap-x-3 text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                  {room.currentGuest.guestEmail && (
                    <span className="truncate">
                      {room.currentGuest.guestEmail}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Checked in{" "}
                    {new Date(room.currentGuest.checkIn).toLocaleDateString(
                      undefined,
                      {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      },
                    )}
                  </span>
                </div>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1.5 text-xs font-medium shrink-0 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40"
              onClick={() => setCheckOutOpen(true)}
            >
              <LogOut className="h-3.5 w-3.5" />
              Check Out
            </Button>
          </div>
        )}

        {/* ── Tabs ── */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-5"
        >
          <TabsList className="h-9 bg-muted/60 p-1">
            <TabsTrigger
              value="overview"
              className="h-7 gap-1.5 text-xs data-[state=active]:bg-card"
            >
              <BedDouble className="h-3.5 w-3.5" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="h-7 gap-1.5 text-xs data-[state=active]:bg-card"
            >
              <History className="h-3.5 w-3.5" />
              History
            </TabsTrigger>
            <TabsTrigger
              value="items"
              className="h-7 gap-1.5 text-xs data-[state=active]:bg-card"
            >
              <Package className="h-3.5 w-3.5" />
              Items
              {room.roomItems?.length > 0 && (
                <span className="ml-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                  {room.roomItems.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* ── OVERVIEW ── */}
          <TabsContent value="overview" className="mt-0">
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
              {/* Left — main details */}
              <div className="lg:col-span-2 space-y-5">
                {/* Room Info */}
                <Card className="border-border/60">
                  <CardHeader className="pb-2 pt-4 px-5">
                    <CardTitle className="text-sm font-semibold">
                      Room Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-5 pb-4">
                    <div className="divide-y divide-border/60">
                      <DetailRow
                        icon={Hash}
                        label="Room Number"
                        value={room.roomNumber}
                      />
                      <DetailRow
                        icon={Layers}
                        label="Floor"
                        value={`Floor ${room.floor}`}
                      />
                      <DetailRow
                        icon={BedDouble}
                        label="Room Type"
                        value={room.roomType.name}
                      />
                      <DetailRow
                        icon={DollarSign}
                        label="Base Rate"
                        value={`$${Number(room.roomType.basePrice).toFixed(2)} / night`}
                      />
                      <DetailRow
                        icon={User}
                        label="Max Occupancy"
                        value={`${room.roomType.maxOccupancy} guests`}
                      />
                      {room.viewType && (
                        <DetailRow
                          icon={Eye}
                          label="View"
                          value={`${room.viewType} View`}
                        />
                      )}
                    </div>

                    {(room.isAccessible || room.isCorner) && (
                      <>
                        <Separator className="my-3" />
                        <div className="flex flex-wrap gap-2">
                          {room.isAccessible && (
                            <Badge
                              variant="outline"
                              className="gap-1.5 text-xs"
                            >
                              <Accessibility className="h-3 w-3" />
                              Wheelchair Accessible
                            </Badge>
                          )}
                          {room.isCorner && (
                            <Badge variant="outline" className="text-xs">
                              Corner Room
                            </Badge>
                          )}
                        </div>
                      </>
                    )}

                    {room.notes && (
                      <div className="mt-4 rounded-lg bg-muted/50 border border-border/50 px-3.5 py-3">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                          Notes
                        </p>
                        <p className="text-xs leading-relaxed">{room.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Amenities */}
                <Card className="border-border/60">
                  <CardHeader className="pb-2 pt-4 px-5">
                    <CardTitle className="text-sm font-semibold">
                      Amenities
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-5 pb-4">
                    {(room.roomType?.amenities ?? []).length === 0 ? (
                      <EmptyState
                        icon={Star}
                        title="No amenities listed"
                        size="sm"
                      />
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {(room.roomType.amenities as string[]).map((a) => (
                          <Badge
                            key={a}
                            variant="secondary"
                            className="text-xs"
                          >
                            {a}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right — housekeeping */}
              <div className="space-y-5">
                <Card className="border-border/60">
                  <CardHeader className="pb-2 pt-4 px-5">
                    <CardTitle className="text-sm font-semibold">
                      Housekeeping Log
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Recent cleaning activity
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-5 pb-4">
                    {(room.housekeepingLogs ?? []).length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-6 gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          No records yet
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {(room.housekeepingLogs as any[])
                          .slice(0, 5)
                          .map((log) => (
                            <div
                              key={log.id}
                              className="flex items-start gap-3"
                            >
                              <div
                                className={cn(
                                  "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                                  log.status === "COMPLETED"
                                    ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600"
                                    : "bg-blue-100 dark:bg-blue-900/40 text-blue-600",
                                )}
                              >
                                <CheckCircle2 className="h-3 w-3" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium">
                                  {log.status.replace("_", " ")}
                                </p>
                                <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                  <Clock className="h-3 w-3" />
                                  {new Date(
                                    log.scheduledAt,
                                  ).toLocaleDateString()}
                                  {log.user?.name && ` · ${log.user.name}`}
                                </p>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick actions for manager */}
                {isManager && (
                  <Card className="border-border/60">
                    <CardHeader className="pb-2 pt-4 px-5">
                      <CardTitle className="text-sm font-semibold">
                        Quick Actions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 pb-4 space-y-2">
                      {room.status !== "OCCUPIED" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start gap-2 h-8 text-xs"
                          onClick={() => setStatusOpen(true)}
                        >
                          <Settings2 className="h-3.5 w-3.5" />
                          Update Status
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start gap-2 h-8 text-xs"
                        onClick={() => setEditOpen(true)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit Room Details
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start gap-2 h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30"
                        onClick={() => setDeleteOpen(true)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete Room
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* ── HISTORY ── */}
          <TabsContent value="history" className="mt-0">
            <Card className="border-border/60">
              <CardHeader className="px-5 pt-4 pb-3 flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold">
                    Guest History
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    All check-in / check-out records for this room
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading && history.length === 0 ? (
                  <div className="px-5 pb-4 space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-14 animate-pulse rounded-xl bg-muted"
                      />
                    ))}
                  </div>
                ) : history.length === 0 ? (
                  <EmptyState
                    icon={History}
                    title="No guest history"
                    description="Check-in records will appear here once guests stay in this room"
                  />
                ) : (
                  <>
                    <ScrollArea className="h-[420px]">
                      <div className="px-5 pb-2 space-y-1">
                        {history.map((assignment, idx) => {
                          const isActive = !assignment.checkOut;
                          const stayDays = assignment.checkOut
                            ? Math.ceil(
                                (new Date(assignment.checkOut).getTime() -
                                  new Date(assignment.checkIn).getTime()) /
                                  86400000,
                              )
                            : Math.ceil(
                                (Date.now() -
                                  new Date(assignment.checkIn).getTime()) /
                                  86400000,
                              );

                          return (
                            <div
                              key={assignment.id}
                              className={cn(
                                "flex items-center gap-3 rounded-xl px-3 py-3 transition-colors",
                                isActive
                                  ? "bg-blue-50/60 dark:bg-blue-950/20"
                                  : "hover:bg-muted/50",
                              )}
                            >
                              {/* avatar */}
                              <div
                                className={cn(
                                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                                  isActive
                                    ? "bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-300"
                                    : "bg-muted text-muted-foreground",
                                )}
                              >
                                {assignment.guestName.charAt(0).toUpperCase()}
                              </div>

                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold truncate">
                                  {assignment.guestName}
                                </p>
                                <div className="flex flex-wrap items-center gap-x-2 text-[11px] text-muted-foreground mt-0.5">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(
                                      assignment.checkIn,
                                    ).toLocaleDateString()}
                                  </span>
                                  {assignment.checkOut && (
                                    <span>
                                      →{" "}
                                      {new Date(
                                        assignment.checkOut,
                                      ).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="shrink-0 flex flex-col items-end gap-1">
                                {isActive ? (
                                  <Badge className="text-[10px] h-5 px-1.5 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 hover:bg-blue-100">
                                    Active
                                  </Badge>
                                ) : (
                                  <Badge className="text-[10px] h-5 px-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50">
                                    Done
                                  </Badge>
                                )}
                                <span className="text-[10px] text-muted-foreground">
                                  {stayDays}n
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>

                    {historyMeta && (historyMeta as any).totalPages > 1 && (
                      <div className="flex items-center justify-between border-t border-border/60 px-5 py-3">
                        <p className="text-[11px] text-muted-foreground">
                          Page {historyPage} of{" "}
                          {(historyMeta as any).totalPages}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() =>
                              setHistoryPage((p) => Math.max(1, p - 1))
                            }
                            disabled={historyPage === 1}
                          >
                            Previous
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => setHistoryPage((p) => p + 1)}
                            disabled={
                              historyPage === (historyMeta as any).totalPages
                            }
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── ITEMS ── */}
          <TabsContent value="items" className="mt-0">
            <Card className="border-border/60">
              <CardHeader className="px-5 pt-4 pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold">
                      Room Items
                    </CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      Inventory items assigned to this room
                    </CardDescription>
                  </div>
                  {isManager && (
                    <Button
                      size="sm"
                      className="h-8 gap-1.5 text-xs"
                      onClick={() => setAddItemOpen(true)}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Item
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {(room.roomItems ?? []).length === 0 ? (
                  <EmptyState
                    icon={Package}
                    title="No items assigned"
                    description="Assign inventory items that belong in this room"
                    action={
                      isManager ? (
                        <Button
                          size="sm"
                          className="h-8 gap-1.5 text-xs"
                          onClick={() => setAddItemOpen(true)}
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Add Item
                        </Button>
                      ) : undefined
                    }
                  />
                ) : (
                  <div className="px-5 pb-4 space-y-2">
                    {(room.roomItems as any[]).map((ri) => (
                      <div
                        key={ri.id}
                        className="flex items-center gap-3 rounded-xl border border-border/50 bg-muted/30 px-3.5 py-3 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-background border border-border/60">
                          <Package className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold truncate">
                            {ri.hotelItem?.name ?? "Unknown"}
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {ri.hotelItem?.category?.name}
                            {" · "}
                            Std: {Number(ri.standardQty).toFixed(1)}{" "}
                            {ri.hotelItem?.unit?.abbreviation}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="hidden sm:block text-right">
                            <p className="text-xs font-bold tabular-nums">
                              {Number(ri.hotelItem?.stockQuantity ?? 0).toFixed(
                                1,
                              )}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              in stock
                            </p>
                          </div>
                          {isManager && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              onClick={() => setRemoveItemId(ri.id)}
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* ── Modals ── */}
      <CheckInModal
        isOpen={checkInOpen}
        onClose={() => setCheckInOpen(false)}
        room={selectedRoom}
        onConfirm={handleCheckIn}
      />
      <CheckOutModal
        isOpen={checkOutOpen}
        onClose={() => setCheckOutOpen(false)}
        room={selectedRoom}
        onConfirm={handleCheckOut}
      />
      <RoomStatusModal
        isOpen={statusOpen}
        onClose={() => setStatusOpen(false)}
        room={selectedRoom}
        onConfirm={handleStatusChange}
      />
      <CreateRoomModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        roomTypes={roomTypes}
        onConfirm={async () => {}}
        editMode
        roomId={id}
        onUpdate={handleUpdate}
        initialData={{
          roomTypeId: room.roomTypeId,
          roomNumber: room.roomNumber,
          floor: room.floor,
          isCorner: room.isCorner,
          isAccessible: room.isAccessible,
          viewType: room.viewType ?? "",
          notes: room.notes ?? "",
        }}
      />
      <AddRoomItemModal
        isOpen={addItemOpen}
        onClose={() => setAddItemOpen(false)}
        hotelItems={items}
        existingItemIds={existingItemIds}
        onConfirm={handleAddItem}
      />

      {/* Remove item */}
      <AlertDialog
        open={!!removeItemId}
        onOpenChange={(o) => !o && setRemoveItemId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm">
              Remove Room Item
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Are you sure you want to remove this item from the room? This
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-8 text-xs">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="h-8 text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => removeItemId && handleRemoveItem(removeItemId)}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete room */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm">
              Delete Room {room.roomNumber}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              This will permanently delete Room {room.roomNumber} and all
              associated data. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-8 text-xs" disabled={isDeleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="h-8 text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting…" : "Delete Room"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
