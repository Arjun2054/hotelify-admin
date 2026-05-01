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
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useHotelItemStore } from "@/store/hotel/useHotelItemStore";
import type { StockMovementType } from "@/types/hotelItem-types";

const typeConfig: Record<
  StockMovementType,
  { icon: React.ReactNode; color: string; bg: string }
> = {
  STOCK_IN: {
    icon: <ArrowUpCircle className="h-4 w-4" />,
    color: "text-emerald-700",
    bg: "bg-emerald-100",
  },
  STOCK_OUT: {
    icon: <ArrowDownCircle className="h-4 w-4" />,
    color: "text-blue-700",
    bg: "bg-blue-100",
  },
  DAMAGE: {
    icon: <AlertTriangle className="h-4 w-4" />,
    color: "text-red-700",
    bg: "bg-red-100",
  },
  TRANSFER: {
    icon: <ArrowRightLeft className="h-4 w-4" />,
    color: "text-purple-700",
    bg: "bg-purple-100",
  },
  ADJUSTMENT: {
    icon: <Settings2 className="h-4 w-4" />,
    color: "text-gray-700",
    bg: "bg-gray-100",
  },
  WASTAGE: {
    icon: <Trash className="h-4 w-4" />,
    color: "text-amber-700",
    bg: "bg-amber-100",
  },
};

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
    // Clear item filter to show all movements
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Stock Movements</h1>
        <p className="text-muted-foreground mt-1">
          Full history of all stock changes across hotel items.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={movementFilters.type || "all"}
          onValueChange={(val) =>
            setMovementFilters({
              type: val === "all" ? undefined : (val as StockMovementType),
            })
          }
        >
          <SelectTrigger className="w-45">
            <SelectValue placeholder="Movement Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="STOCK_IN">Stock In</SelectItem>
            <SelectItem value="STOCK_OUT">Stock Out</SelectItem>
            <SelectItem value="DAMAGE">Damage</SelectItem>
            <SelectItem value="TRANSFER">Transfer</SelectItem>
            <SelectItem value="ADJUSTMENT">Adjustment</SelectItem>
            <SelectItem value="WASTAGE">Wastage</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={movementFilters.dateFrom ?? ""}
            onChange={(e) =>
              setMovementFilters({ dateFrom: e.target.value || undefined })
            }
            className="w-40"
            placeholder="From"
          />
          <span className="text-muted-foreground">to</span>
          <Input
            type="date"
            value={movementFilters.dateTo ?? ""}
            onChange={(e) =>
              setMovementFilters({ dateTo: e.target.value || undefined })
            }
            className="w-[160px]"
            placeholder="To"
          />
        </div>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="mr-1 h-4 w-4" /> Clear
          </Button>
        )}
      </div>

      {/* Table */}
      {isMovementLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : movements.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground">
          <p className="text-lg font-semibold">No movements found</p>
          <p className="text-sm mt-1">
            Stock movements will appear here when inventory changes are
            recorded.
          </p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Item</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Before → After</TableHead>
                <TableHead className="text-right">Unit Cost</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>By</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movements.map((m) => {
                const config = typeConfig[m.type];
                const isInbound = ["STOCK_IN", "ADJUSTMENT"].includes(m.type);

                return (
                  <TableRow key={m.id}>
                    <TableCell>
                      <div
                        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium ${config.bg} ${config.color}`}
                      >
                        {config.icon}
                        {m.type.replace("_", " ")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">
                          {m.hotelItem?.name}
                        </p>
                        {m.hotelItem?.sku && (
                          <p className="text-xs text-muted-foreground font-mono">
                            {m.hotelItem.sku}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={`font-semibold ${
                          isInbound ? "text-emerald-600" : "text-red-600"
                        }`}
                      >
                        {isInbound ? "+" : "-"}
                        {m.quantity}{" "}
                        <span className="text-xs font-normal text-muted-foreground">
                          {m.hotelItem?.unit?.abbreviation}
                        </span>
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {m.previousStock} → {m.newStock}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {m.unitCost ? `${formatCurrency(m.unitCost)}` : "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {m.referenceId || "—"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {m.user?.name ?? "System"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
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
      {movementMeta && movementMeta.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {movements.length} of {movementMeta.total} movements
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={movementMeta.page <= 1}
              onClick={() => fetchMovements(movementMeta.page - 1)}
            >
              Previous
            </Button>
            <span className="flex items-center px-2">
              Page {movementMeta.page} of {movementMeta.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={movementMeta.page >= movementMeta.totalPages}
              onClick={() => fetchMovements(movementMeta.page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
