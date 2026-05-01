import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/EmptyState";
import { useStockStore } from "@/store/stockStore";
import { useDebounce } from "@/hooks/useDebounce";
import { toast } from "sonner";

// Components
import { MovementFilters } from "./MovementFilters";
import { MovementCard } from "./MovementCard";
import { MovementTableRow } from "./MovementTableRow";
import { MovementPagination } from "./MovementPagination";
import { MovementError } from "./MovementError";
import {
  MovementCardSkeleton,
  MovementTableSkeleton,
} from "./MovementSkeletons";

// Types
import type { StockMovementType } from "@/lib/types";
import type { StockMovement } from "@/types/stockMovement.types";

const DEBOUNCE_DELAY = 500;
const SKELETON_COUNT_MOBILE = 3;

export function StockMovementsTable() {
  // Local state
  const [searchInput, setSearchInput] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  // Store state with safe defaults
  const {
    movements,
    loading,
    error,
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    filters,
    fetchMovements,
    exportReport,
    setPage,
    setPageSize,
    setFilters,
    clearFilters,
  } = useStockStore();

  // Debounced search value
  const debouncedSearch = useDebounce(searchInput, DEBOUNCE_DELAY);

  // Memoized movement list with type safety
  const movementList = useMemo<StockMovement[]>(() => {
    return Array.isArray(movements) ? movements : [];
  }, [movements]);

  // Initial data fetch
  useEffect(() => {
    fetchMovements();
  }, [fetchMovements]);

  // Handle debounced search
  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      setFilters({ ...filters, search: debouncedSearch, page: 1 });
    }
  }, [debouncedSearch, filters, setFilters]);

  // Handlers
  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      await exportReport(filters);
      toast.success("Report exported successfully");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to export report";
      toast.error(message);
    } finally {
      setIsExporting(false);
    }
  }, [exportReport, filters]);

  const handleMovementTypeChange = useCallback(
    (type: StockMovementType | undefined) => {
      setFilters({ ...filters, movementType: type, page: 1 });
    },
    [filters, setFilters],
  );

  const handleClearFilters = useCallback(() => {
    setSearchInput("");
    clearFilters();
  }, [clearFilters]);

  const handlePageSizeChange = useCallback(
    (size: number) => {
      setPageSize(size);
    },
    [setPageSize],
  );

  const handleRetry = useCallback(() => {
    fetchMovements();
  }, [fetchMovements]);

  // Render error state
  if (error) {
    return <MovementError error={error} onRetry={handleRetry} />;
  }

  const isEmpty = !loading && movementList.length === 0;
  const showPagination = !loading && movementList.length > 0;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <MovementFilters
        searchValue={searchInput}
        movementType={filters.movementType}
        pageSize={pageSize}
        isExporting={isExporting}
        onSearchChange={setSearchInput}
        onMovementTypeChange={handleMovementTypeChange}
        onPageSizeChange={handlePageSizeChange}
        onClearFilters={handleClearFilters}
        onExport={handleExport}
      />

      {/* Mobile Card View */}
      <div
        className="md:hidden space-y-4"
        role="list"
        aria-label="Stock movements"
      >
        {loading ? (
          <MovementCardSkeleton count={SKELETON_COUNT_MOBILE} />
        ) : isEmpty ? (
          <EmptyState
            title="No stock movements found"
            description="Stock movements will appear here once you add or remove stock"
          />
        ) : (
          movementList.map((movement) => (
            <MovementCard key={movement.stockMovementId} movement={movement} />
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div
        className="hidden md:block rounded-md border"
        role="region"
        aria-label="Stock movements table"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Movement</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">Stock Before</TableHead>
              <TableHead className="text-right">Stock After</TableHead>
              <TableHead>Reference</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <MovementTableSkeleton count={pageSize} />
            ) : isEmpty ? (
              <TableRow>
                <TableCell colSpan={8}>
                  <EmptyState
                    title="No stock movements found"
                    description="Stock movements will appear here once you add or remove stock"
                  />
                </TableCell>
              </TableRow>
            ) : (
              movementList.map((movement) => (
                <MovementTableRow
                  key={movement.stockMovementId}
                  movement={movement}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {showPagination && (
        <MovementPagination
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={totalItems}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}

export default StockMovementsTable;
