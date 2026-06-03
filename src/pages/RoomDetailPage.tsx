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
  Hash,
  History,
  MoreVertical,
  Building2,
  Shield,
  TrendingUp,
  Star,
  CheckCircle2,
  Sparkles,
  Wrench,
  AlertTriangle,
  Users,
  MapPin,
  Mail,
  CalendarDays,
  Moon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn, formatCurrency } from "@/lib/utils";
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

/* ─── Status palette ─────────────────────────────────────────── */
const STATUS_THEME = {
  AVAILABLE: {
    gradient: "from-emerald-500/90 via-teal-500/80 to-emerald-600/90",
    glow: "shadow-emerald-500/20",
    icon: Sparkles,
    tint: "text-emerald-50",
    dot: "bg-emerald-500",
  },
  OCCUPIED: {
    gradient: "from-blue-600/90 via-indigo-600/85 to-blue-700/90",
    glow: "shadow-blue-500/20",
    icon: User,
    tint: "text-blue-50",
    dot: "bg-blue-500",
  },
  CLEANING: {
    gradient: "from-amber-500/90 via-yellow-500/80 to-orange-500/90",
    glow: "shadow-amber-500/20",
    icon: Sparkles,
    tint: "text-amber-50",
    dot: "bg-amber-500",
  },
  MAINTENANCE: {
    gradient: "from-orange-500/90 via-red-500/80 to-orange-600/90",
    glow: "shadow-orange-500/20",
    icon: Wrench,
    tint: "text-orange-50",
    dot: "bg-orange-500",
  },
  OUT_OF_ORDER: {
    gradient: "from-red-600/90 via-rose-600/85 to-red-700/90",
    glow: "shadow-red-500/20",
    icon: AlertTriangle,
    tint: "text-red-50",
    dot: "bg-red-500",
  },
} as const;

/* ─── Detail row used in spec tables ──────────────────────────── */
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
    <div className="flex items-center justify-between gap-4 py-2.5">
      <span className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5 shrink-0" />
        {label}
      </span>
      <span className="text-right text-xs font-medium text-foreground">
        {value}
      </span>
    </div>
  );
}

/* ─── Sidebar section card ────────────────────────────────────── */
function SidebarCard({
  title,
  action,
  children,
  className,
}: {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border/60 bg-card overflow-hidden",
        className,
      )}
    >
      {title && (
        <div className="flex items-center justify-between gap-2 border-b border-border/60 bg-muted/30 px-4 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {title}
          </p>
          {action}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}

/* ─── Main content section card ───────────────────────────────── */
function SectionCard({
  title,
  description,
  action,
  children,
  bodyClassName,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  bodyClassName?: string;
}) {
  return (
    <Card className="border-border/60 shadow-none">
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 px-5 pt-4 pb-3">
        <div className="min-w-0">
          <CardTitle className="text-sm font-semibold tracking-tight">
            {title}
          </CardTitle>
          {description && (
            <CardDescription className="mt-0.5 text-xs">
              {description}
            </CardDescription>
          )}
        </div>
        {action}
      </CardHeader>
      <CardContent className={cn("px-5 pb-4", bodyClassName)}>
        {children}
      </CardContent>
    </Card>
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (id && activeTab === "history") fetchHistory(id, historyPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      navigate("/rooms");
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
              size="sm"
              onClick={() => navigate("/hotel/rooms")}
              className="gap-1.5"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to rooms
            </Button>
          }
        />
      </div>
    );

  const room = selectedRoom as any;
  const existingItemIds =
    room.roomItems?.map((ri: any) => ri.hotelItemId) ?? [];
  const theme =
    STATUS_THEME[room.status as keyof typeof STATUS_THEME] ??
    STATUS_THEME.AVAILABLE;
  const StatusIcon = theme.icon;

  if (!activeOrg)
    return (
      <GuardScreen
        icon={Building2}
        title="No organization selected"
        description="Please select an organization to continue."
      />
    );

  if (!hasAccess)
    return (
      <GuardScreen
        icon={Shield}
        title="Access restricted"
        description={
          <>
            You don't have access to this section.
            {isStaff && department && (
              <>
                {" "}
                Your department is{" "}
                <span className="font-medium text-foreground">
                  {department}
                </span>
                . Only Front Desk staff can access this.
              </>
            )}
          </>
        }
      />
    );

  /* ─── Stay duration for current guest ─────────────────────────── */
  const stayNights = room.currentGuest
    ? Math.max(
        1,
        Math.ceil(
          (Date.now() - new Date(room.currentGuest.checkIn).getTime()) /
            86_400_000,
        ),
      )
    : 0;

  /* ─── Render ──────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-muted/20 dark:bg-background">
      {/* ── PREMIUM HERO ── */}
      <header className="relative overflow-hidden border-b border-border/60 bg-card">
        {/* Color wash backdrop */}
        <div
          aria-hidden
          className={cn(
            "absolute inset-x-0 top-0 h-64 bg-linear-to-r from-primary via-primary/90 to-primary/75 opacity-95",
          )}
        />
        {/* Decorative pattern overlay */}
        <div className="pointer-events-none absolute -top-10 -right-10 h-48 w-48 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-8 right-24 h-32 w-32 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute top-4 right-64 h-16 w-16 rounded-full bg-white/5" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-5 pb-6">
          {/* Back + breadcrumb */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/room")}
              className="-ml-2 h-7 gap-1 text-xs text-white/80 hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to rooms
            </Button>

            <nav
              aria-label="Breadcrumb"
              className="hidden items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-white/70 sm:flex"
            >
              <span>Hotel</span>
              <span aria-hidden>/</span>
              <span>Rooms</span>
              <span aria-hidden>/</span>
              <span className="text-white tabular-nums">{room.roomNumber}</span>
            </nav>
          </div>

          {/* Identity row */}
          <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex items-end gap-5">
              {/* Big visual: room number + icon */}
              <div
                className={cn(
                  "relative flex h-28 w-28 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur-sm shadow-2xl",
                )}
              >
                <span
                  aria-hidden
                  className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-foreground ring-4 ring-white/30 shadow-lg"
                >
                  <StatusIcon className="h-4 w-4" />
                </span>
                <BedDouble className="absolute top-3 left-3 h-5 w-5 text-white/40" />
                <span className="text-5xl font-bold tabular-nums tracking-tight text-white drop-shadow-sm">
                  {room.roomNumber}
                </span>
              </div>

              {/* Title block */}
              <div className="min-w-0 pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">
                    {room.roomType.name}
                  </p>
                  <span
                    aria-hidden
                    className="h-1 w-1 rounded-full bg-white/40"
                  />
                  <p className="flex items-center gap-1 text-[11px] font-medium text-white/70">
                    <MapPin className="h-3 w-3" />
                    Floor {room.floor}
                  </p>
                </div>
                <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">
                  Room {room.roomNumber}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <RoomStatusBadge status={room.status} showDot />
                  {room.viewType && (
                    <Badge
                      variant="outline"
                      className="gap-1 border-white/30 bg-white/10 text-[11px] font-normal text-white backdrop-blur-sm hover:bg-white/15"
                    >
                      <Eye className="h-3 w-3" />
                      {room.viewType} view
                    </Badge>
                  )}
                  {room.isAccessible && (
                    <Badge
                      variant="outline"
                      className="gap-1 border-white/30 bg-white/10 text-[11px] font-normal text-white backdrop-blur-sm hover:bg-white/15"
                    >
                      <Accessibility className="h-3 w-3" />
                      Accessible
                    </Badge>
                  )}
                  {room.isCorner && (
                    <Badge
                      variant="outline"
                      className="border-white/30 bg-white/10 text-[11px] font-normal text-white backdrop-blur-sm hover:bg-white/15"
                    >
                      Corner
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {room.status === "AVAILABLE" && (
                <Button
                  size="sm"
                  onClick={() => setCheckInOpen(true)}
                  className="gap-1.5 bg-white text-foreground shadow-lg hover:bg-white/90"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  Check in guest
                </Button>
              )}
              {room.status === "OCCUPIED" && room.currentGuest && (
                <Button
                  size="sm"
                  onClick={() => setCheckOutOpen(true)}
                  className="gap-1.5 bg-white text-foreground shadow-lg hover:bg-white/90"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Check out
                </Button>
              )}
              {isManager && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 border-white/30 bg-white/10 p-0 text-white backdrop-blur-sm hover:bg-white/20 hover:text-white"
                    >
                      <MoreVertical className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {room.status !== "OCCUPIED" && (
                      <DropdownMenuItem
                        onClick={() => setStatusOpen(true)}
                        className="gap-2 text-xs"
                      >
                        <Settings2 className="h-3.5 w-3.5" /> Update status
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => setEditOpen(true)}
                      className="gap-2 text-xs"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Edit room
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setDeleteOpen(true)}
                      className="gap-2 text-xs text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete room
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── BODY: Sidebar + Main ── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
          {/* ─────────────── SIDEBAR ─────────────── */}
          <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
            {/* Pricing */}
            <SidebarCard title="Pricing">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold tracking-tight tabular-nums">
                  {formatCurrency(room.roomType.basePrice)}
                </span>
                <span className="text-xs text-muted-foreground">/ night</span>
              </div>
              <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Users className="h-3 w-3" />
                Sleeps up to {room.roomType.maxOccupancy} guests
              </p>
            </SidebarCard>

            {/* Current guest — only when OCCUPIED */}
            {room.currentGuest && (
              <SidebarCard
                title="Current guest"
                action={
                  <span className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    Active
                  </span>
                }
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-base font-semibold text-white ring-2 ring-background shadow-md">
                    {room.currentGuest.guestName.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold leading-tight">
                      {room.currentGuest.guestName}
                    </p>
                    {room.currentGuest.guestEmail && (
                      <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        {room.currentGuest.guestEmail}
                      </p>
                    )}
                  </div>
                </div>

                {/* Stay timeline */}
                <div className="mt-4 grid grid-cols-2 gap-3 rounded-md border border-border/60 bg-muted/30 px-3 py-2.5">
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      Checked in
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-xs font-semibold tabular-nums">
                      <CalendarDays className="h-3 w-3 text-muted-foreground" />
                      {new Date(room.currentGuest.checkIn).toLocaleDateString(
                        undefined,
                        { month: "short", day: "numeric" },
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      Stay length
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-xs font-semibold tabular-nums">
                      <Moon className="h-3 w-3 text-muted-foreground" />
                      {stayNights} {stayNights === 1 ? "night" : "nights"}
                    </p>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCheckOutOpen(true)}
                  className="mt-3 h-8 w-full gap-1.5 text-xs"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Check out guest
                </Button>
              </SidebarCard>
            )}

            {/* At-a-glance stats */}
            <SidebarCard title="At a glance">
              <div className="grid grid-cols-2 gap-3">
                <MiniStat
                  icon={Package}
                  label="Items"
                  value={room.roomItems?.length ?? 0}
                />
                <MiniStat
                  icon={TrendingUp}
                  label="Stays"
                  value={history.length || 0}
                />
                <MiniStat
                  icon={Sparkles}
                  label="Cleanings"
                  value={room.housekeepingLogs?.length ?? 0}
                />
                <MiniStat
                  icon={Star}
                  label="Amenities"
                  value={room.roomType?.amenities?.length ?? 0}
                />
              </div>
            </SidebarCard>

            {/* Quick actions (manager only) */}
            {isManager && (
              <SidebarCard title="Quick actions">
                <div className="space-y-1.5">
                  {room.status !== "OCCUPIED" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-full justify-start gap-2 text-xs"
                      onClick={() => setStatusOpen(true)}
                    >
                      <Settings2 className="h-3.5 w-3.5 text-muted-foreground" />
                      Update status
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-full justify-start gap-2 text-xs"
                    onClick={() => setEditOpen(true)}
                  >
                    <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                    Edit room details
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-full justify-start gap-2 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => setDeleteOpen(true)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete room
                  </Button>
                </div>
              </SidebarCard>
            )}
          </aside>

          {/* ─────────────── MAIN ─────────────── */}
          <main className="min-w-0">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-5"
            >
              <TabsList className="h-9 bg-muted/40 p-1">
                <TabsTrigger
                  value="overview"
                  className="h-7 gap-1.5 text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm"
                >
                  <BedDouble className="h-3.5 w-3.5" />
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="h-7 gap-1.5 text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm"
                >
                  <History className="h-3.5 w-3.5" />
                  History
                </TabsTrigger>
                <TabsTrigger
                  value="items"
                  className="h-7 gap-1.5 text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm"
                >
                  <Package className="h-3.5 w-3.5" />
                  Items
                  {room.roomItems?.length > 0 && (
                    <span className="ml-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-muted px-1 text-[10px] font-medium text-muted-foreground">
                      {room.roomItems.length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              {/* ── OVERVIEW ── */}
              <TabsContent value="overview" className="mt-0 space-y-5">
                <SectionCard title="Room information">
                  <div className="divide-y divide-border/60">
                    <DetailRow
                      icon={Hash}
                      label="Room number"
                      value={room.roomNumber}
                    />
                    <DetailRow
                      icon={Layers}
                      label="Floor"
                      value={`Floor ${room.floor}`}
                    />
                    <DetailRow
                      icon={BedDouble}
                      label="Room type"
                      value={room.roomType.name}
                    />
                    <DetailRow
                      icon={BedDouble}
                      label="Base rate"
                      value={
                        <span className="tabular-nums">
                          {formatCurrency(room.roomType.basePrice)}
                          <span className="ml-0.5 font-normal text-muted-foreground">
                            /night
                          </span>
                        </span>
                      }
                    />
                    <DetailRow
                      icon={User}
                      label="Max occupancy"
                      value={`${room.roomType.maxOccupancy} guests`}
                    />
                    {room.viewType && (
                      <DetailRow
                        icon={Eye}
                        label="View"
                        value={`${room.viewType} view`}
                      />
                    )}
                  </div>

                  {room.notes && (
                    <div className="mt-4 rounded-md border-l-2 border-primary/40 bg-muted/30 px-3.5 py-2.5">
                      <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        Notes
                      </p>
                      <p className="text-xs leading-relaxed text-foreground/90">
                        {room.notes}
                      </p>
                    </div>
                  )}
                </SectionCard>

                <SectionCard title="Amenities">
                  {(room.roomType?.amenities ?? []).length === 0 ? (
                    <EmptyState
                      icon={Star}
                      title="No amenities listed"
                      size="sm"
                    />
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {(room.roomType.amenities as string[]).map((a) => (
                        <Badge
                          key={a}
                          variant="secondary"
                          className="gap-1 text-xs font-normal"
                        >
                          <Star className="h-3 w-3 text-amber-500" />
                          {a}
                        </Badge>
                      ))}
                    </div>
                  )}
                </SectionCard>

                <SectionCard
                  title="Housekeeping log"
                  description="Recent cleaning activity"
                >
                  {(room.housekeepingLogs ?? []).length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-6">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
                        <Clock className="h-4 w-4" />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        No records yet
                      </p>
                    </div>
                  ) : (
                    <div className="relative space-y-4 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-px before:bg-border/60">
                      {(room.housekeepingLogs as any[])
                        .slice(0, 5)
                        .map((log) => (
                          <div
                            key={log.id}
                            className="relative flex items-start gap-3 pl-0"
                          >
                            <div
                              className={cn(
                                "relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ring-4 ring-card",
                                log.status === "COMPLETED"
                                  ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400"
                                  : "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400",
                              )}
                            >
                              <CheckCircle2 className="h-3 w-3" />
                            </div>
                            <div className="min-w-0 flex-1 pt-0.5">
                              <p className="text-xs font-medium">
                                {log.status.replace("_", " ")}
                              </p>
                              <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {new Date(log.scheduledAt).toLocaleDateString()}
                                {log.user?.name && ` · ${log.user.name}`}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </SectionCard>
              </TabsContent>

              {/* ── HISTORY ── */}
              <TabsContent value="history" className="mt-0">
                <SectionCard
                  title="Guest history"
                  description="All check-in / check-out records for this room"
                  bodyClassName="p-0"
                >
                  {isLoading && history.length === 0 ? (
                    <div className="space-y-2 px-5 pb-4">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div
                          key={i}
                          className="h-14 animate-pulse rounded-md bg-muted"
                        />
                      ))}
                    </div>
                  ) : history.length === 0 ? (
                    <div className="px-5 pb-5">
                      <EmptyState
                        icon={History}
                        title="No guest history"
                        description="Check-in records will appear here once guests stay in this room"
                      />
                    </div>
                  ) : (
                    <>
                      <ScrollArea className="h-105">
                        <div className="divide-y divide-border/60">
                          {history.map((assignment) => {
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
                                  "flex items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/30",
                                  isActive &&
                                    "bg-blue-50/40 dark:bg-blue-950/10",
                                )}
                              >
                                <span
                                  className={cn(
                                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ring-2 ring-background",
                                    isActive
                                      ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-sm"
                                      : "bg-muted text-foreground/70",
                                  )}
                                >
                                  {assignment.guestName.charAt(0).toUpperCase()}
                                </span>

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <p className="truncate text-xs font-semibold">
                                      {assignment.guestName}
                                    </p>
                                    {isActive && (
                                      <span className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-blue-600 dark:text-blue-400">
                                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                        Active
                                      </span>
                                    )}
                                  </div>
                                  <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[11px] text-muted-foreground">
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

                                <span className="shrink-0 text-xs font-medium tabular-nums text-muted-foreground">
                                  {stayDays}n
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </ScrollArea>

                      {historyMeta && (historyMeta as any).totalPages > 1 && (
                        <div className="flex items-center justify-between border-t border-border/60 px-5 py-3">
                          <p className="text-[11px] text-muted-foreground">
                            Page{" "}
                            <span className="font-medium text-foreground tabular-nums">
                              {historyPage}
                            </span>{" "}
                            of{" "}
                            <span className="font-medium text-foreground tabular-nums">
                              {(historyMeta as any).totalPages}
                            </span>
                          </p>
                          <div className="flex gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2.5 text-xs"
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
                              className="h-7 px-2.5 text-xs"
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
                </SectionCard>
              </TabsContent>

              {/* ── ITEMS ── */}
              <TabsContent value="items" className="mt-0">
                <SectionCard
                  title="Room items"
                  description="Inventory items assigned to this room"
                  action={
                    isManager && (
                      <Button
                        size="sm"
                        onClick={() => setAddItemOpen(true)}
                        className="gap-1.5"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add item
                      </Button>
                    )
                  }
                  bodyClassName="p-0"
                >
                  {(room.roomItems ?? []).length === 0 ? (
                    <div className="px-5 pb-5">
                      <EmptyState
                        icon={Package}
                        title="No items assigned"
                        description="Assign inventory items that belong in this room"
                        action={
                          isManager ? (
                            <Button
                              size="sm"
                              onClick={() => setAddItemOpen(true)}
                              className="gap-1.5"
                            >
                              <Plus className="h-3.5 w-3.5" />
                              Add item
                            </Button>
                          ) : undefined
                        }
                      />
                    </div>
                  ) : (
                    <div className="divide-y divide-border/60">
                      {(room.roomItems as any[]).map((ri) => (
                        <div
                          key={ri.id}
                          className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/30"
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border/60 bg-muted/40 text-muted-foreground">
                            <Package className="h-3.5 w-3.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-semibold">
                              {ri.hotelItem?.name ?? "Unknown"}
                            </p>
                            <p className="mt-0.5 text-[11px] text-muted-foreground">
                              {ri.hotelItem?.category?.name}
                              {" · "}
                              Std: {Number(ri.standardQty).toFixed(1)}{" "}
                              {ri.hotelItem?.unit?.abbreviation}
                            </p>
                          </div>
                          <div className="flex shrink-0 items-center gap-3">
                            <div className="hidden text-right sm:block">
                              <p className="text-xs font-semibold tabular-nums">
                                {Number(
                                  ri.hotelItem?.stockQuantity ?? 0,
                                ).toFixed(1)}
                              </p>
                              <p className="text-[10px] text-muted-foreground">
                                in stock
                              </p>
                            </div>
                            {isManager && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => setRemoveItemId(ri.id)}
                                aria-label="Remove item"
                              >
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </SectionCard>
              </TabsContent>
            </Tabs>
          </main>
        </div>
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
            <AlertDialogTitle className="text-base">
              Remove room item
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
              className="h-8 bg-destructive text-xs text-destructive-foreground hover:bg-destructive/90"
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
            <AlertDialogTitle className="text-base">
              Delete room {room.roomNumber}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              This will permanently delete room {room.roomNumber} and all
              associated data. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-8 text-xs" disabled={isDeleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="h-8 bg-destructive text-xs text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting…" : "Delete room"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ─── Mini stat used in the sidebar grid ──────────────────────── */
function MiniStat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-md border border-border/60 bg-muted/20 px-3 py-2.5">
      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      <p className="mt-1.5 text-lg font-semibold tabular-nums leading-none">
        {value}
      </p>
      <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

/* ─── Guard screen ────────────────────────────────────────────── */
function GuardScreen({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm space-y-4 rounded-lg border border-border/60 bg-card p-8 text-center">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Icon className="h-5 w-5" />
        </div>
        <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}
