import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
  ArrowUpCircle,
  ArrowDownCircle,
  Power,
  AlertTriangle,
  PackageOpen,
} from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import type { HotelItem, StockMovementType } from "@/types/hotelItem-types";

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface Props {
  items: HotelItem[];
  isLoading: boolean;
  onView: (item: HotelItem) => void;
  onEdit: (item: HotelItem) => void;
  onDelete: (item: HotelItem) => void;
  onStockMovement: (item: HotelItem, type: StockMovementType) => void;
  onToggleActive: (item: HotelItem) => void;
}

/* ------------------------------------------------------------------ */
/*  Shared helpers                                                     */
/* ------------------------------------------------------------------ */

function getStockStatus(item: HotelItem) {
  if (item.isOutOfStock) return "out";
  if (item.isLowStock) return "low";
  return "ok";
}

function StockIndicator({ item }: { item: HotelItem }) {
  const status = getStockStatus(item);

  const config = {
    out: {
      bar: "bg-red-500",
      text: "text-red-600 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-950/40",
      border: "border-red-200 dark:border-red-900",
      label: "Out of stock",
      labelColor: "text-red-600 dark:text-red-400",
    },
    low: {
      bar: "bg-amber-500",
      text: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950/40",
      border: "border-amber-200 dark:border-amber-900",
      label: "Low stock",
      labelColor: "text-amber-600 dark:text-amber-400",
    },
    ok: {
      bar: "bg-emerald-500",
      text: "text-foreground",
      bg: "bg-muted/30",
      border: "border-border",
      label: null,
      labelColor: "",
    },
  }[status];

  return { config, status };
}

function StockPill({ item }: { item: HotelItem }) {
  const { config, status } = StockIndicator({ item });
  if (status === "ok") return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        status === "out"
          ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400"
          : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
      )}
    >
      <AlertTriangle className="h-2.5 w-2.5" />
      {config.label}
    </span>
  );
}

function ActiveBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium",
        isActive
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
          : "bg-muted text-muted-foreground",
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          isActive ? "bg-emerald-500" : "bg-muted-foreground/50",
        )}
      />
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}

function ItemAvatar({
  name,
  imageUrl,
  size = "sm",
}: {
  name: string;
  imageUrl?: string | null;
  size?: "sm" | "md";
}) {
  const dim = size === "md" ? "h-11 w-11 text-sm" : "h-9 w-9 text-xs";

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className={cn(
          dim,
          "shrink-0 rounded-xl border border-border/50 object-cover shadow-sm",
        )}
      />
    );
  }

  const colors = [
    "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
    "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
    "bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300",
  ];
  const color = colors[name.charCodeAt(0) % colors.length];

  return (
    <span
      className={cn(
        dim,
        color,
        "flex shrink-0 items-center justify-center rounded-xl font-bold",
      )}
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Actions menu                                                       */
/* ------------------------------------------------------------------ */

function ActionsMenu({
  item,
  onView,
  onEdit,
  onDelete,
  onStockMovement,
  onToggleActive,
  className,
}: {
  item: HotelItem;
  className?: string;
} & Pick<
  Props,
  "onView" | "onEdit" | "onDelete" | "onStockMovement" | "onToggleActive"
>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-8 w-8 shrink-0 rounded-lg text-muted-foreground hover:text-foreground",
            className,
          )}
        >
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-52 rounded-xl p-1.5 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenuLabel className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Manage
        </DropdownMenuLabel>

        <DropdownMenuItem className="rounded-lg" onClick={() => onView(item)}>
          <Eye className="mr-2.5 h-4 w-4 text-muted-foreground" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem className="rounded-lg" onClick={() => onEdit(item)}>
          <Pencil className="mr-2.5 h-4 w-4 text-muted-foreground" />
          Edit Item
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-1" />
        <DropdownMenuLabel className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Stock Movement
        </DropdownMenuLabel>

        <DropdownMenuItem
          className="rounded-lg"
          onClick={() => onStockMovement(item, "STOCK_IN")}
        >
          <ArrowUpCircle className="mr-2.5 h-4 w-4 text-emerald-500" />
          Stock In
        </DropdownMenuItem>
        <DropdownMenuItem
          className="rounded-lg"
          onClick={() => onStockMovement(item, "STOCK_OUT")}
        >
          <ArrowDownCircle className="mr-2.5 h-4 w-4 text-blue-500" />
          Stock Out
        </DropdownMenuItem>
        <DropdownMenuItem
          className="rounded-lg"
          onClick={() => onStockMovement(item, "DAMAGE")}
        >
          <AlertTriangle className="mr-2.5 h-4 w-4 text-amber-500" />
          Report Damage
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-1" />

        <DropdownMenuItem
          className="rounded-lg"
          onClick={() => onToggleActive(item)}
        >
          <Power className="mr-2.5 h-4 w-4 text-muted-foreground" />
          {item.isActive ? "Deactivate" : "Activate"}
        </DropdownMenuItem>
        <DropdownMenuItem
          className="rounded-lg text-red-600 focus:bg-red-50 focus:text-red-600 dark:focus:bg-red-950/50"
          onClick={() => onDelete(item)}
        >
          <Trash2 className="mr-2.5 h-4 w-4" />
          Delete Item
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ------------------------------------------------------------------ */
/*  Empty state                                                        */
/* ------------------------------------------------------------------ */

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/10 px-4 py-24 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
        <PackageOpen
          className="h-7 w-7 text-muted-foreground/50"
          strokeWidth={1.5}
        />
      </div>
      <h3 className="text-base font-semibold text-foreground">
        No items found
      </h3>
      <p className="mt-1.5 max-w-[280px] text-sm leading-relaxed text-muted-foreground">
        Try adjusting your search or filters, or add a new inventory item to get
        started.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Skeleton loaders                                                   */
/* ------------------------------------------------------------------ */

function MobileCardSkeleton() {
  return (
    <div className="grid gap-3 sm:hidden">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="overflow-hidden rounded-2xl border-border/50">
          <CardContent className="space-y-4 p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-11 w-11 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[...Array(3)].map((_, j) => (
                <Skeleton key={j} className="h-16 rounded-xl" />
              ))}
            </div>
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-3.5 w-28" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function TabletSkeleton() {
  return (
    <div className="hidden sm:block lg:hidden overflow-hidden rounded-2xl border border-border/50">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-b border-border/50">
            {["Item", "Stock", "Cost", "Value", "Status", ""].map((h) => (
              <TableHead key={h}>
                <Skeleton className="h-3.5 w-14" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i} className="hover:bg-transparent">
              <TableCell>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-xl" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-3.5 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              </TableCell>
              {[...Array(3)].map((_, j) => (
                <TableCell key={j}>
                  <Skeleton className="ml-auto h-3.5 w-14" />
                </TableCell>
              ))}
              <TableCell>
                <Skeleton className="mx-auto h-6 w-16 rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-8 w-8 rounded-lg" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function DesktopSkeleton() {
  return (
    <div className="hidden lg:block overflow-hidden rounded-2xl border border-border/50">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-b border-border/50">
            {[
              "Item",
              "SKU",
              "Category",
              "Stock",
              "Min / Reorder",
              "Unit Cost",
              "Value",
              "Status",
              "",
            ].map((h) => (
              <TableHead key={h}>
                <Skeleton className="h-3.5 w-16" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 6 }).map((_, i) => (
            <TableRow key={i} className="hover:bg-transparent">
              <TableCell>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-xl" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-3.5 w-28" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-3.5 w-16" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-20 rounded-lg" />
              </TableCell>
              {[...Array(2)].map((_, j) => (
                <TableCell key={j}>
                  <Skeleton className="ml-auto h-3.5 w-12" />
                </TableCell>
              ))}
              {[...Array(2)].map((_, j) => (
                <TableCell key={j}>
                  <Skeleton className="ml-auto h-3.5 w-16" />
                </TableCell>
              ))}
              <TableCell>
                <Skeleton className="mx-auto h-6 w-16 rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-8 w-8 rounded-lg" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Mobile card                                                        */
/* ------------------------------------------------------------------ */

function MobileCard({
  item,
  onView,
  onEdit,
  onDelete,
  onStockMovement,
  onToggleActive,
}: { item: HotelItem } & Pick<
  Props,
  "onView" | "onEdit" | "onDelete" | "onStockMovement" | "onToggleActive"
>) {
  const { config } = StockIndicator({ item });

  return (
    <Card
      className={cn(
        "group overflow-hidden rounded-2xl border-border/50 cursor-pointer",
        "transition-all duration-200 hover:border-border hover:shadow-md",
        !item.isActive && "opacity-60",
      )}
      onClick={() => onView(item)}
    >
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex items-start gap-3 p-4 pb-3">
          <ItemAvatar name={item.name} imageUrl={item.imageUrl} size="md" />

          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-semibold leading-snug text-foreground">
              {item.name}
            </p>
            {item.supplier && (
              <p className="truncate text-xs text-muted-foreground mt-0.5">
                {item.supplier.name}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              <Badge
                variant="secondary"
                className="rounded-lg text-[10px] font-medium px-2 py-0.5 bg-muted text-muted-foreground border-0"
              >
                {item.category.name}
              </Badge>
              {item.sku && (
                <span className="font-mono text-[10px] text-muted-foreground/70">
                  #{item.sku}
                </span>
              )}
            </div>
          </div>

          <div
            className="flex items-center gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            <ActiveBadge isActive={item.isActive} />
            <ActionsMenu
              item={item}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
              onStockMovement={onStockMovement}
              onToggleActive={onToggleActive}
            />
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-border/40 mx-4" />

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 p-4 pt-3">
          <div
            className={cn(
              "rounded-xl border px-3 py-2.5",
              config.bg,
              config.border,
            )}
          >
            <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
              Stock
            </p>
            <div className="flex items-baseline gap-1 mt-1">
              <span
                className={cn(
                  "text-lg font-bold tabular-nums leading-none",
                  config.text,
                )}
              >
                {item.stockQuantity}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium">
                {item.unit.abbreviation}
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-border/50 bg-muted/20 px-3 py-2.5">
            <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
              Cost
            </p>
            <p className="text-sm font-bold tabular-nums mt-1 leading-none text-foreground">
              {formatCurrency(item.costPrice)}
            </p>
          </div>

          <div className="rounded-xl border border-border/50 bg-muted/20 px-3 py-2.5">
            <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
              Value
            </p>
            <p className="text-sm font-bold tabular-nums mt-1 leading-none text-foreground">
              {formatCurrency(item.stockValue)}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 pb-3 -mt-1">
          <StockPill item={item} />
          <p className="text-[11px] text-muted-foreground tabular-nums">
            Min{" "}
            <span className="font-medium text-foreground">
              {item.minimumStock}
            </span>{" "}
            · Reorder{" "}
            <span className="font-medium text-foreground">
              {item.reorderPoint}
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Tablet table                                                       */
/* ------------------------------------------------------------------ */

function TabletTable({
  items,
  onView,
  onEdit,
  onDelete,
  onStockMovement,
  onToggleActive,
}: Omit<Props, "isLoading">) {
  return (
    <div className="hidden sm:block lg:hidden overflow-hidden rounded-2xl border border-border/50 shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30 border-b border-border/50">
            <TableHead className="min-w-[200px] text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Item
            </TableHead>
            <TableHead className="text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Stock
            </TableHead>
            <TableHead className="text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Cost
            </TableHead>
            <TableHead className="text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Value
            </TableHead>
            <TableHead className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Status
            </TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>

        <TableBody>
          {items.map((item) => {
            const { config } = StockIndicator({ item });
            return (
              <TableRow
                key={item.id}
                className={cn(
                  "group cursor-pointer border-b border-border/30 transition-colors hover:bg-muted/20",
                  !item.isActive && "opacity-60",
                )}
                onClick={() => onView(item)}
              >
                <TableCell className="py-3">
                  <div className="flex items-center gap-3">
                    <ItemAvatar name={item.name} imageUrl={item.imageUrl} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {item.name}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Badge
                          variant="secondary"
                          className="rounded-md text-[10px] font-medium px-1.5 py-0 bg-muted text-muted-foreground border-0"
                        >
                          {item.category.name}
                        </Badge>
                        {item.sku && (
                          <span className="font-mono text-[10px] text-muted-foreground/70">
                            #{item.sku}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="text-right py-3">
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-baseline gap-1">
                      <span
                        className={cn(
                          "tabular-nums font-bold text-sm",
                          config.text,
                        )}
                      >
                        {item.stockQuantity}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {item.unit.abbreviation}
                      </span>
                    </div>
                    <StockPill item={item} />
                  </div>
                </TableCell>

                <TableCell className="text-right tabular-nums text-sm py-3 text-muted-foreground">
                  {formatCurrency(item.costPrice)}
                </TableCell>

                <TableCell className="text-right tabular-nums text-sm font-semibold py-3">
                  {formatCurrency(item.stockValue)}
                </TableCell>

                <TableCell className="text-center py-3">
                  <ActiveBadge isActive={item.isActive} />
                </TableCell>

                <TableCell
                  className="py-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ActionsMenu
                    item={item}
                    onView={onView}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onStockMovement={onStockMovement}
                    onToggleActive={onToggleActive}
                    className="opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100"
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Desktop table                                                      */
/* ------------------------------------------------------------------ */

function DesktopTable({
  items,
  onView,
  onEdit,
  onDelete,
  onStockMovement,
  onToggleActive,
}: Omit<Props, "isLoading">) {
  return (
    <TooltipProvider delayDuration={200}>
      <div className="hidden lg:block overflow-hidden rounded-2xl border border-border/50 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30 border-b border-border/50">
              {[
                { label: "Item", className: "min-w-[220px]" },
                { label: "SKU", className: "min-w-[90px]" },
                { label: "Category", className: "" },
                { label: "Stock", className: "text-right" },
                { label: "Min / Reorder", className: "text-right" },
                { label: "Unit Cost", className: "text-right" },
                { label: "Value", className: "text-right" },
                { label: "Status", className: "text-center" },
                { label: "", className: "w-12" },
              ].map(({ label, className }) => (
                <TableHead
                  key={label}
                  className={cn(
                    "text-xs font-semibold uppercase tracking-wider text-muted-foreground py-3.5",
                    className,
                  )}
                >
                  {label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {items.map((item) => {
              const { config } = StockIndicator({ item });
              return (
                <TableRow
                  key={item.id}
                  className={cn(
                    "group cursor-pointer border-b border-border/30 transition-colors hover:bg-muted/20",
                    !item.isActive && "opacity-60",
                  )}
                  onClick={() => onView(item)}
                >
                  {/* Name + Supplier */}
                  <TableCell className="py-3.5">
                    <div className="flex items-center gap-3">
                      <ItemAvatar name={item.name} imageUrl={item.imageUrl} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground leading-snug">
                          {item.name}
                        </p>
                        {item.supplier && (
                          <p className="truncate text-xs text-muted-foreground mt-0.5">
                            {item.supplier.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  {/* SKU */}
                  <TableCell className="py-3.5">
                    <span className="font-mono text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md">
                      {item.sku || "—"}
                    </span>
                  </TableCell>

                  {/* Category */}
                  <TableCell className="py-3.5">
                    <Badge
                      variant="secondary"
                      className="rounded-lg text-xs font-medium bg-muted text-muted-foreground border-0 px-2.5"
                    >
                      {item.category.name}
                    </Badge>
                  </TableCell>

                  {/* Stock */}
                  <TableCell className="text-right py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      <StockPill item={item} />
                      <div className="flex items-baseline gap-1">
                        <span
                          className={cn(
                            "tabular-nums font-bold text-sm",
                            config.text,
                          )}
                        >
                          {item.stockQuantity}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {item.unit.abbreviation}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Min / Reorder */}
                  <TableCell className="text-right tabular-nums text-sm py-3.5">
                    <span className="text-foreground font-medium">
                      {item.minimumStock}
                    </span>
                    <span className="mx-1 text-border">/</span>
                    <span className="text-foreground font-medium">
                      {item.reorderPoint}
                    </span>
                  </TableCell>

                  {/* Cost */}
                  <TableCell className="text-right tabular-nums text-sm py-3.5 text-muted-foreground">
                    {formatCurrency(item.costPrice)}
                  </TableCell>

                  {/* Value */}
                  <TableCell className="text-right tabular-nums text-sm font-semibold py-3.5">
                    {formatCurrency(item.stockValue)}
                  </TableCell>

                  {/* Status */}
                  <TableCell className="text-center py-3.5">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="inline-flex">
                          <ActiveBadge isActive={item.isActive} />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent
                        side="left"
                        className="text-xs rounded-lg"
                      >
                        Click menu to{" "}
                        {item.isActive ? "deactivate" : "activate"}
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>

                  {/* Actions */}
                  <TableCell
                    className="py-3.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ActionsMenu
                      item={item}
                      onView={onView}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onStockMovement={onStockMovement}
                      onToggleActive={onToggleActive}
                      className="opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100 transition-opacity"
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
}

/* ------------------------------------------------------------------ */
/*  Main export                                                        */
/* ------------------------------------------------------------------ */

export function HotelItemTable({
  items,
  isLoading,
  onView,
  onEdit,
  onDelete,
  onStockMovement,
  onToggleActive,
}: Props) {
  if (isLoading) {
    return (
      <>
        <MobileCardSkeleton />
        <TabletSkeleton />
        <DesktopSkeleton />
      </>
    );
  }

  if (items.length === 0) return <EmptyState />;

  const shared = {
    items,
    onView,
    onEdit,
    onDelete,
    onStockMovement,
    onToggleActive,
  };

  return (
    <div className="space-y-3">
      {/* Mobile cards (< 640px) */}
      <div className="grid gap-3 sm:hidden">
        {items.map((item) => (
          <MobileCard
            key={item.id}
            item={item}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
            onStockMovement={onStockMovement}
            onToggleActive={onToggleActive}
          />
        ))}
      </div>

      {/* Tablet table (640px – 1024px) */}
      <TabletTable {...shared} />

      {/* Desktop table (≥ 1024px) */}
      <DesktopTable {...shared} />
    </div>
  );
}
