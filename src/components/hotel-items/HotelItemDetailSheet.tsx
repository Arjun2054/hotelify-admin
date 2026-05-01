import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ArrowUpCircle,
  ArrowDownCircle,
  AlertTriangle,
  Package,
  DollarSign,
  Barcode,
  Truck,
  Hash,
  TrendingUp,
  TrendingDown,
  RotateCcw,
  Activity,
  DoorOpen,
  Clock,
  CircleDot,
  Info,
  BoxIcon,
  ShieldAlert,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { HotelItem, StockMovementType } from "@/types/hotelItem-types";
import { useHotelItemStore } from "@/store/hotel/useHotelItemStore";
import { StockMovementHistory } from "./StockMovementHistory";
import { cn } from "@/lib/utils";

interface Props {
  item: HotelItem | null;
  open: boolean;
  onClose: () => void;
  onStockMovement: (item: HotelItem, type: StockMovementType) => void;
}

const movementTypeConfig: Record<
  string,
  { icon: React.ReactNode; color: string; bg: string }
> = {
  STOCK_IN: {
    icon: <TrendingUp className="h-3.5 w-3.5" />,
    color: "text-emerald-700",
    bg: "bg-emerald-50 border-emerald-200",
  },
  STOCK_OUT: {
    icon: <TrendingDown className="h-3.5 w-3.5" />,
    color: "text-blue-700",
    bg: "bg-blue-50 border-blue-200",
  },
  DAMAGE: {
    icon: <ShieldAlert className="h-3.5 w-3.5" />,
    color: "text-red-700",
    bg: "bg-red-50 border-red-200",
  },
  ADJUSTMENT: {
    icon: <RotateCcw className="h-3.5 w-3.5" />,
    color: "text-amber-700",
    bg: "bg-amber-50 border-amber-200",
  },
  RETURN: {
    icon: <RotateCcw className="h-3.5 w-3.5" />,
    color: "text-violet-700",
    bg: "bg-violet-50 border-violet-200",
  },
};

export function HotelItemDetailSheet({
  item,
  open,
  onClose,
  onStockMovement,
}: Props) {
  const { selectedItem, fetchItemById, movementSummary, fetchMovementSummary } =
    useHotelItemStore();
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (item && open) {
      fetchItemById(item.id);
      fetchMovementSummary(item.id);
      setActiveTab("overview");
    }
  }, [item, open]);

  const detail = selectedItem?.id === item?.id ? selectedItem : item;
  if (!detail) return null;

  const stockPercentage = detail.reorderPoint
    ? Math.min((detail.stockQuantity / (detail.reorderPoint * 2)) * 100, 100)
    : 50;

  const stockStatus = detail.isOutOfStock
    ? "out"
    : detail.isLowStock
      ? "low"
      : "healthy";

  const stockStatusConfig = {
    out: {
      label: "Out of Stock",
      color: "text-red-700",
      bg: "bg-red-50",
      border: "border-red-200",
      badgeBg: "bg-red-100 text-red-800 border-red-200",
      progressBar: "[&>div]:bg-red-500",
      icon: <AlertTriangle className="h-4 w-4 text-red-500" />,
    },
    low: {
      label: "Low Stock",
      color: "text-amber-700",
      bg: "bg-amber-50",
      border: "border-amber-200",
      badgeBg: "bg-amber-100 text-amber-800 border-amber-200",
      progressBar: "[&>div]:bg-amber-500",
      icon: <AlertTriangle className="h-4 w-4 text-amber-500" />,
    },
    healthy: {
      label: "In Stock",
      color: "text-emerald-700",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      badgeBg: "bg-emerald-100 text-emerald-800 border-emerald-200",
      progressBar: "[&>div]:bg-emerald-500",
      icon: <CircleDot className="h-4 w-4 text-emerald-500" />,
    },
  };

  const currentStockConfig = stockStatusConfig[stockStatus];

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto p-0">
        {/* Header Section */}
        <div className="sticky top-0 z-10 bg-background border-b">
          <div className="px-6 pt-6 pb-4">
            <SheetHeader className="space-y-1">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <SheetTitle className="text-lg font-semibold leading-tight truncate">
                    {detail.name}
                  </SheetTitle>
                  <SheetDescription className="flex items-center gap-2 mt-1.5 flex-wrap">
                    {detail.sku && (
                      <span className="inline-flex items-center gap-1 font-mono text-xs bg-muted px-2 py-0.5 rounded-md">
                        <Hash className="h-3 w-3" />
                        {detail.sku}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {detail.category.name}
                    </span>
                  </SheetDescription>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs font-medium",
                      detail.isActive
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-gray-50 text-gray-600 border-gray-200",
                    )}
                  >
                    <span
                      className={cn(
                        "mr-1.5 h-1.5 w-1.5 rounded-full inline-block",
                        detail.isActive ? "bg-emerald-500" : "bg-gray-400",
                      )}
                    />
                    {detail.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </SheetHeader>

            {/* Quick Actions */}
            <div className="flex gap-2 mt-4">
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      onClick={() => onStockMovement(detail, "STOCK_IN")}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 shadow-sm"
                    >
                      <ArrowUpCircle className="mr-1.5 h-4 w-4" />
                      Stock In
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Add stock inventory</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onStockMovement(detail, "STOCK_OUT")}
                      className="flex-1 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
                    >
                      <ArrowDownCircle className="mr-1.5 h-4 w-4" />
                      Stock Out
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Remove stock inventory</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onStockMovement(detail, "DAMAGE")}
                      className="flex-1 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                    >
                      <AlertTriangle className="mr-1.5 h-4 w-4" />
                      Damage
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Report damaged stock</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-5">
          {/* Stock Level Card */}
          <div
            className={cn(
              "rounded-xl border p-4 transition-colors",
              currentStockConfig.bg,
              currentStockConfig.border,
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {currentStockConfig.icon}
                <span className="text-sm font-medium">Stock Level</span>
              </div>
              <Badge
                variant="outline"
                className={cn("text-xs", currentStockConfig.badgeBg)}
              >
                {currentStockConfig.label}
              </Badge>
            </div>

            <div className="flex items-baseline gap-1.5 mb-3">
              <span
                className={cn(
                  "text-3xl font-bold tracking-tight",
                  currentStockConfig.color,
                )}
              >
                {detail.stockQuantity}
              </span>
              <span className="text-sm text-muted-foreground font-medium">
                {detail.unit.abbreviation}
              </span>
            </div>

            <Progress
              value={stockPercentage}
              className={cn(
                "h-2.5 rounded-full",
                currentStockConfig.progressBar,
              )}
            />

            <div className="flex justify-between mt-2.5">
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">
                  Min:{" "}
                  <span className="font-semibold text-foreground">
                    {detail.minimumStock}
                  </span>
                </span>
                <span className="text-muted-foreground/40">•</span>
                <span className="text-xs text-muted-foreground">
                  Reorder:{" "}
                  <span className="font-semibold text-foreground">
                    {detail.reorderPoint}
                  </span>
                </span>
              </div>
            </div>

            {(detail.isLowStock || detail.isOutOfStock) && (
              <div
                className={cn(
                  "mt-3 flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium",
                  detail.isOutOfStock
                    ? "bg-red-100 text-red-800"
                    : "bg-amber-100 text-amber-800",
                )}
              >
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                {detail.isOutOfStock
                  ? "This item is out of stock. Restock immediately."
                  : "Stock is below the reorder point. Consider restocking."}
              </div>
            )}
          </div>

          {/* Key Metrics Row */}
          <div className="grid grid-cols-2 gap-3">
            <MetricCard
              icon={<DollarSign className="h-4 w-4 text-emerald-600" />}
              label="Cost Price"
              value={formatCurrency(detail.costPrice)}
              bgColor="bg-emerald-50/60"
            />
            <MetricCard
              icon={<BoxIcon className="h-4 w-4 text-blue-600" />}
              label="Stock Value"
              value={formatCurrency(detail.stockValue)}
              bgColor="bg-blue-50/60"
            />
          </div>

          {/* Tabs Section */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-4"
          >
            <TabsList className="w-full grid grid-cols-3 h-10">
              <TabsTrigger
                value="overview"
                className="text-xs font-medium gap-1.5"
              >
                <Info className="h-3.5 w-3.5" />
                Details
              </TabsTrigger>
              <TabsTrigger
                value="movements"
                className="text-xs font-medium gap-1.5"
              >
                <Activity className="h-3.5 w-3.5" />
                History
              </TabsTrigger>
              <TabsTrigger
                value="rooms"
                className="text-xs font-medium gap-1.5"
              >
                <DoorOpen className="h-3.5 w-3.5" />
                Rooms
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-4 space-y-4">
              {/* Item Details */}
              <div className="rounded-xl border bg-card overflow-hidden">
                <div className="px-4 py-3 bg-muted/40 border-b">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    Item Information
                  </h4>
                </div>
                <div className="p-4 space-y-3">
                  <DetailRow label="Category" value={detail.category.name} />
                  <Separator className="my-1" />
                  <DetailRow
                    label="Unit"
                    value={`${detail.unit.name} (${detail.unit.abbreviation})`}
                  />
                  <Separator className="my-1" />
                  <DetailRow
                    label="Cost Price"
                    value={formatCurrency(detail.costPrice)}
                  />
                  <Separator className="my-1" />
                  <DetailRow
                    label="Stock Value"
                    value={formatCurrency(detail.stockValue)}
                    highlight
                  />
                  {detail.barcode && (
                    <>
                      <Separator className="my-1" />
                      <DetailRow
                        label="Barcode"
                        value={detail.barcode}
                        mono
                        icon={<Barcode className="h-3.5 w-3.5" />}
                      />
                    </>
                  )}
                  {detail.supplier && (
                    <>
                      <Separator className="my-1" />
                      <DetailRow
                        label="Supplier"
                        value={detail.supplier.name}
                        icon={<Truck className="h-3.5 w-3.5" />}
                      />
                    </>
                  )}
                </div>
              </div>

              {/* Description */}
              {detail.description && (
                <div className="rounded-xl border bg-card overflow-hidden">
                  <div className="px-4 py-3 bg-muted/40 border-b">
                    <h4 className="text-sm font-semibold">Description</h4>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {detail.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Movement Summary */}
              {movementSummary && movementSummary.itemId === detail.id && (
                <div className="rounded-xl border bg-card overflow-hidden">
                  <div className="px-4 py-3 bg-muted/40 border-b">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      Movement Summary
                    </h4>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-2 gap-2.5">
                      {Object.entries(movementSummary.movements).map(
                        ([type, data]) => {
                          const config = movementTypeConfig[type] || {
                            icon: <Activity className="h-3.5 w-3.5" />,
                            color: "text-gray-700",
                            bg: "bg-gray-50 border-gray-200",
                          };
                          return (
                            <div
                              key={type}
                              className={cn(
                                "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                                config.bg,
                              )}
                            >
                              <div
                                className={cn(
                                  "flex items-center justify-center h-9 w-9 rounded-full bg-white/80 border shrink-0",
                                  config.color,
                                )}
                              >
                                {config.icon}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs text-muted-foreground truncate">
                                  {type.replace(/_/g, " ")}
                                </p>
                                <p
                                  className={cn(
                                    "text-lg font-bold leading-tight",
                                    config.color,
                                  )}
                                >
                                  {data.totalQuantity}
                                </p>
                                <p className="text-[10px] text-muted-foreground">
                                  {data.count}{" "}
                                  {data.count === 1 ? "record" : "records"}
                                </p>
                              </div>
                            </div>
                          );
                        },
                      )}
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Movements Tab */}
            <TabsContent value="movements" className="mt-4">
              <div className="rounded-xl border bg-card overflow-hidden">
                <div className="px-4 py-3 bg-muted/40 border-b">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    Stock Movement History
                  </h4>
                </div>
                <div className="p-4">
                  <StockMovementHistory itemId={detail.id} />
                </div>
              </div>
            </TabsContent>

            {/* Rooms Tab */}
            <TabsContent value="rooms" className="mt-4">
              <div className="rounded-xl border bg-card overflow-hidden">
                <div className="px-4 py-3 bg-muted/40 border-b flex items-center justify-between">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <DoorOpen className="h-4 w-4 text-muted-foreground" />
                    Room Assignments
                  </h4>
                  {detail.roomItems && detail.roomItems.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {detail.roomItems.length}{" "}
                      {detail.roomItems.length === 1 ? "room" : "rooms"}
                    </Badge>
                  )}
                </div>
                <div className="p-4">
                  {detail.roomItems && detail.roomItems.length > 0 ? (
                    <ul className="space-y-2">
                      {detail.roomItems.map((ri: any) => (
                        <li
                          key={ri.id}
                          className="group flex items-center justify-between p-3 rounded-lg border bg-muted/30 hover:bg-muted/60 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-blue-50 border border-blue-200 text-blue-700">
                              <DoorOpen className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold">
                                Room {ri.room.roomNumber}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Floor {ri.room.floor}
                              </p>
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className="font-mono text-xs bg-white"
                          >
                            {ri.standardQty} {detail.unit.abbreviation}
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <div className="flex items-center justify-center h-12 w-12 rounded-full bg-muted mb-3">
                        <DoorOpen className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Not assigned to any rooms
                      </p>
                      <p className="text-xs text-muted-foreground/70 mt-1">
                        This item hasn&apos;t been linked to a room yet.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function MetricCard({
  icon,
  label,
  value,
  bgColor = "bg-muted/50",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  bgColor?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3.5 rounded-xl border transition-colors",
        bgColor,
      )}
    >
      <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-white border shrink-0 shadow-sm">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-bold truncate">{value}</p>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  highlight = false,
  mono = false,
  icon,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  mono?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className="text-sm text-muted-foreground flex items-center gap-1.5">
        {icon}
        {label}
      </span>
      <span
        className={cn(
          "text-sm text-right",
          highlight ? "font-bold text-foreground" : "font-medium",
          mono && "font-mono text-xs bg-muted px-2 py-0.5 rounded",
        )}
      >
        {value}
      </span>
    </div>
  );
}
