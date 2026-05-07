import { useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowUpCircle,
  ArrowDownCircle,
  AlertTriangle,
  ArrowRightLeft,
  Settings2,
  Trash,
  X,
  ArrowLeftRight,
  ChevronLeft,
  ChevronRight,
  PackageSearch,
  Filter,
} from "lucide-react";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { useHotelItemStore } from "@/store/hotel/useHotelItemStore";
import type { StockMovementType } from "@/types/hotelItem-types";

// ── Type config ───────────────────────────────────────────────────────────────
const typeConfig: Record<
  StockMovementType,
  {
    icon: React.ReactNode;
    label: string;
    color: string;
    bg: string;
    border: string;
  }
> = {
  STOCK_IN: {
    icon: <ArrowUpCircle className="h-3.5 w-3.5" />,
    label: "Stock In",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
  },
  STOCK_OUT: {
    icon: <ArrowDownCircle className="h-3.5 w-3.5" />,
    label: "Stock Out",
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  DAMAGE: {
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
    label: "Damage",
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
  },
  TRANSFER: {
    icon: <ArrowRightLeft className="h-3.5 w-3.5" />,
    label: "Transfer",
    color: "text-purple-700",
    bg: "bg-purple-50",
    border: "border-purple-200",
  },
  ADJUSTMENT: {
    icon: <Settings2 className="h-3.5 w-3.5" />,
    label: "Adjustment",
    color: "text-stone-700",
    bg: "bg-stone-50",
    border: "border-stone-200",
  },
  WASTAGE: {
    icon: <Trash className="h-3.5 w-3.5" />,
    label: "Wastage",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
};

// ── Row skeleton ──────────────────────────────────────────────────────────────
function MovementRowSkeleton() {
  return (
    <TableRow>
      {[80, 120, 60, 80, 60, 80, 70, 90].map((w, i) => (
        <TableCell key={i}>
          <Skeleton className="h-4 rounded-lg" style={{ width: w }} />
        </TableCell>
      ))}
    </TableRow>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function StockMovementsPage() {
  const {
    movements,
    movementFilters,
    movementMeta,
    isMovementLoading,
    fetchMovements,
    setMovementFilters,
  } = useHotelItemStore();

  useEffect(() => {
    setMovementFilters({ hotelItemId: undefined });
    fetchMovements();
  }, []);

  useEffect(() => {
    fetchMovements();
  }, [movementFilters]);

  const hasFilters =
    movementFilters.type || movementFilters.dateFrom || movementFilters.dateTo;

  const clearFilters = () => {
    setMovementFilters({
      type: undefined,
      dateFrom: undefined,
      dateTo: undefined,
      hotelItemId: undefined,
    });
  };

  const totalMovements = movementMeta?.total ?? movements.length;
  const currentPage = movementMeta?.page ?? 1;
  const totalPages = movementMeta?.totalPages ?? 1;

  // Derive movement type counts for stat strip
  const countByType = (type: StockMovementType) =>
    movements.filter((m) => m.type === type).length;

  return (
    <div className="min-h-screen">
      {/* ── Hero header ───────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-linear-to-br from-stone-800 via-stone-700 to-stone-900 px-8 py-10">
        {/* Decorative blobs */}
        <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-20 -left-8 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute top-6 right-52 w-20 h-20 rounded-full bg-white/3 pointer-events-none" />

        <div className="relative flex items-start justify-between gap-6 flex-wrap">
          {/* Left: icon + title */}
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm shrink-0">
              <ArrowLeftRight className="w-6 h-6 text-white" />
            </div>

            <div>
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 mb-1">
                <p
                  className="uppercase tracking-widest font-semibold text-stone-400"
                  style={{ fontSize: "10px" }}
                >
                  Hotel Management
                </p>
                <span className="w-1 h-1 rounded-full bg-stone-500" />
                <p
                  className="uppercase tracking-widest font-semibold text-stone-400"
                  style={{ fontSize: "10px" }}
                >
                  Inventory
                </p>
                <span className="w-1 h-1 rounded-full bg-stone-500" />
                <p
                  className="uppercase tracking-widest font-semibold text-stone-400"
                  style={{ fontSize: "10px" }}
                >
                  Stock Movements
                </p>
              </div>

              <h1
                className="font-bold text-white leading-tight tracking-tight"
                style={{ fontSize: "22px" }}
              >
                Stock Movements
              </h1>
              <p
                className="text-stone-300 mt-1 leading-snug"
                style={{ fontSize: "13px" }}
              >
                Full history of all stock changes across hotel inventory items
              </p>
            </div>
          </div>
        </div>

        {/* ── Stat strip ────────────────────────────────────────────────── */}
        <div className="relative mt-7 flex items-center gap-3 flex-wrap">
          {[
            {
              label: "Total",
              value: totalMovements,
              icon: ArrowLeftRight,
            },
            {
              label: "Stock In",
              value: countByType("STOCK_IN"),
              icon: ArrowUpCircle,
            },
            {
              label: "Stock Out",
              value: countByType("STOCK_OUT"),
              icon: ArrowDownCircle,
            },
            {
              label: "Damage",
              value: countByType("DAMAGE"),
              icon: AlertTriangle,
            },
            {
              label: "Wastage",
              value: countByType("WASTAGE"),
              icon: Trash,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white/10 border border-white/15 backdrop-blur-sm"
            >
              <stat.icon className="w-3.5 h-3.5 text-stone-300 shrink-0" />
              <span
                className="font-bold text-white leading-none"
                style={{ fontSize: "15px" }}
              >
                {isMovementLoading ? "—" : stat.value}
              </span>
              <span
                className="text-stone-300 leading-none"
                style={{ fontSize: "11px" }}
              >
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────────────────── */}
      <div className="px-8 py-6 space-y-5">
        {/* Filter bar */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-gray-400 shrink-0">
              <Filter className="w-3.5 h-3.5" />
              <span className="font-medium" style={{ fontSize: "12px" }}>
                Filters
              </span>
            </div>

            {/* Movement type */}
            <Select
              value={movementFilters.type || "all"}
              onValueChange={(val) =>
                setMovementFilters({
                  type: val === "all" ? undefined : (val as StockMovementType),
                })
              }
            >
              <SelectTrigger
                className="w-44 h-9 rounded-xl border-gray-200 focus:ring-stone-400/30"
                style={{ fontSize: "13px" }}
              >
                <SelectValue placeholder="Movement Type" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-gray-100 shadow-lg">
                <SelectItem value="all" style={{ fontSize: "13px" }}>
                  All Types
                </SelectItem>
                {(
                  Object.entries(typeConfig) as [
                    StockMovementType,
                    (typeof typeConfig)[StockMovementType],
                  ][]
                ).map(([key, cfg]) => (
                  <SelectItem
                    key={key}
                    value={key}
                    style={{ fontSize: "13px" }}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={cn(
                          "inline-flex items-center justify-center w-4 h-4 rounded",
                          cfg.bg,
                          cfg.color,
                        )}
                      >
                        {cfg.icon}
                      </span>
                      {cfg.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Date range */}
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={movementFilters.dateFrom ?? ""}
                onChange={(e) =>
                  setMovementFilters({
                    dateFrom: e.target.value || undefined,
                  })
                }
                className="w-40 h-9 rounded-xl border-gray-200 text-sm focus-visible:ring-stone-400/30"
              />
              <span className="text-gray-400" style={{ fontSize: "12px" }}>
                to
              </span>
              <Input
                type="date"
                value={movementFilters.dateTo ?? ""}
                onChange={(e) =>
                  setMovementFilters({
                    dateTo: e.target.value || undefined,
                  })
                }
                className="w-40 h-9 rounded-xl border-gray-200 text-sm focus-visible:ring-stone-400/30"
              />
            </div>

            {/* Clear */}
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1 h-9 px-3 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
                style={{ fontSize: "12px" }}
              >
                <X className="w-3.5 h-3.5" />
                Clear
              </button>
            )}

            {/* Result count */}
            {!isMovementLoading && movements.length > 0 && (
              <span
                className="ml-auto text-gray-400 font-medium"
                style={{ fontSize: "12px" }}
              >
                {movements.length} of {totalMovements} movements
              </span>
            )}
          </div>
        </div>

        {/* Section label */}
        {!isMovementLoading && movements.length > 0 && (
          <div className="flex items-center gap-2">
            <p
              className="uppercase tracking-widest font-semibold text-gray-400"
              style={{ fontSize: "10px" }}
            >
              Movement History
            </p>
            <div className="flex-1 h-px bg-gray-200" />
            <span
              className="px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-400 font-medium shadow-sm"
              style={{ fontSize: "10px" }}
            >
              {totalMovements} records
            </span>
          </div>
        )}

        {/* Table / empty / loading */}
        {isMovementLoading ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/60 border-b border-gray-100">
                  {[
                    "Type",
                    "Item",
                    "Quantity",
                    "Before → After",
                    "Unit Cost",
                    "Reference",
                    "By",
                    "Date",
                  ].map((h) => (
                    <TableHead
                      key={h}
                      className="text-gray-500 font-semibold"
                      style={{ fontSize: "11px" }}
                    >
                      {h}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 8 }).map((_, i) => (
                  <MovementRowSkeleton key={i} />
                ))}
              </TableBody>
            </Table>
          </div>
        ) : movements.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-stone-100 border border-stone-200 mb-5">
              <PackageSearch className="w-7 h-7 text-stone-400" />
            </div>
            <h3
              className="font-semibold text-gray-800 mb-1"
              style={{ fontSize: "15px" }}
            >
              No movements found
            </h3>
            <p
              className="text-gray-400 max-w-xs leading-relaxed"
              style={{ fontSize: "12px" }}
            >
              {hasFilters
                ? "No movements match your current filters. Try clearing them to see all records."
                : "Stock movements will appear here when inventory changes are recorded."}
            </p>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="mt-5 h-9 px-5 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-stone-50 transition-colors font-medium shadow-sm"
                style={{ fontSize: "12px" }}
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/60 border-b border-gray-100 hover:bg-gray-50/60">
                  {[
                    "Type",
                    "Item",
                    "Quantity",
                    "Before → After",
                    "Unit Cost",
                    "Reference",
                    "By",
                    "Date",
                  ].map((h, i) => (
                    <TableHead
                      key={h}
                      className={cn(
                        "text-gray-500 font-semibold py-3",
                        i >= 2 && "text-right",
                        i === 5 || i === 6 || i === 7 ? "text-left" : "",
                      )}
                      style={{ fontSize: "11px" }}
                    >
                      {h}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.map((m) => {
                  const config = typeConfig[m.type];
                  const isInbound = ["STOCK_IN", "ADJUSTMENT"].includes(m.type);

                  return (
                    <TableRow
                      key={m.id}
                      className="border-b border-gray-50 hover:bg-stone-50/40 transition-colors"
                    >
                      {/* Type badge */}
                      <TableCell className="py-3.5">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border font-medium leading-none",
                            config.bg,
                            config.color,
                            config.border,
                          )}
                          style={{ fontSize: "10px" }}
                        >
                          {config.icon}
                          {config.label}
                        </span>
                      </TableCell>

                      {/* Item */}
                      <TableCell className="py-3.5">
                        <p
                          className="font-medium text-gray-800 leading-snug"
                          style={{ fontSize: "14px" }}
                        >
                          {m.hotelItem?.name}
                        </p>
                        {m.hotelItem?.sku && (
                          <p
                            className="text-gray-400 font-mono mt-0.5"
                            style={{ fontSize: "10px" }}
                          >
                            {m.hotelItem.sku}
                          </p>
                        )}
                      </TableCell>

                      {/* Quantity */}
                      <TableCell className="text-right py-3.5">
                        <span
                          className={cn(
                            "font-bold",
                            isInbound ? "text-emerald-600" : "text-red-500",
                          )}
                          style={{ fontSize: "14px" }}
                        >
                          {isInbound ? "+" : "-"}
                          {m.quantity}
                        </span>
                        <span
                          className="text-gray-400 ml-1"
                          style={{ fontSize: "12px" }}
                        >
                          {m.hotelItem?.unit?.abbreviation}
                        </span>
                      </TableCell>

                      {/* Before → After */}
                      <TableCell
                        className="text-right py-3.5"
                        style={{ fontSize: "14px" }}
                      >
                        <span className="text-gray-400">{m.previousStock}</span>
                        <span className="text-gray-300 mx-1">→</span>
                        <span className="font-medium text-gray-700">
                          {m.newStock}
                        </span>
                      </TableCell>

                      {/* Unit cost */}
                      <TableCell
                        className="text-right py-3.5 text-gray-600 font-medium"
                        style={{ fontSize: "14px" }}
                      >
                        {m.unitCost ? (
                          formatCurrency(m.unitCost)
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </TableCell>

                      {/* Reference */}
                      <TableCell
                        className="py-3.5 text-gray-400 font-mono"
                        style={{ fontSize: "14px" }}
                      >
                        {m.referenceId || (
                          <span className="text-gray-300">—</span>
                        )}
                      </TableCell>

                      {/* By */}
                      <TableCell className="py-3.5">
                        <span
                          className="font-medium text-gray-700"
                          style={{ fontSize: "14px" }}
                        >
                          {m.user?.name ?? (
                            <span className="text-gray-400 italic">System</span>
                          )}
                        </span>
                      </TableCell>

                      {/* Date */}
                      <TableCell
                        className="py-3.5 text-gray-400 whitespace-nowrap"
                        style={{ fontSize: "12px" }}
                      >
                        {formatDate(m.createdAt)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination */}
        {movementMeta && totalPages > 1 && (
          <div className="flex items-center justify-between flex-wrap gap-3 pt-1">
            <p className="text-gray-400" style={{ fontSize: "12px" }}>
              Page{" "}
              <span className="font-semibold text-gray-600">{currentPage}</span>{" "}
              of{" "}
              <span className="font-semibold text-gray-600">{totalPages}</span>{" "}
              ·{" "}
              <span className="font-semibold text-gray-600">
                {movementMeta.total}
              </span>{" "}
              total movements
            </p>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1 || isMovementLoading}
                onClick={() => fetchMovements(currentPage - 1)}
                className="h-8 px-3 rounded-xl border-gray-200 bg-white shadow-sm text-gray-600 hover:bg-stone-50 gap-1"
                style={{ fontSize: "12px" }}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Previous
              </Button>

              {/* Page number pills */}
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (p) =>
                      p === 1 ||
                      p === totalPages ||
                      Math.abs(p - currentPage) <= 1,
                  )
                  .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                    if (idx > 0 && p - (arr[idx - 1] as number) > 1)
                      acc.push("…");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, idx) =>
                    p === "…" ? (
                      <span
                        key={`ellipsis-${idx}`}
                        className="w-8 text-center text-gray-400"
                        style={{ fontSize: "12px" }}
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => fetchMovements(p as number)}
                        className={cn(
                          "w-8 h-8 rounded-lg font-medium transition-all",
                          currentPage === p
                            ? "bg-stone-800 text-white shadow-sm"
                            : "text-gray-500 hover:bg-stone-100",
                        )}
                        style={{ fontSize: "12px" }}
                      >
                        {p}
                      </button>
                    ),
                  )}
              </div>

              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages || isMovementLoading}
                onClick={() => fetchMovements(currentPage + 1)}
                className="h-8 px-3 rounded-xl border-gray-200 bg-white shadow-sm text-gray-600 hover:bg-stone-50 gap-1"
                style={{ fontSize: "12px" }}
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
