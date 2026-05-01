import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Download, Loader2 } from "lucide-react";
import { PAGE_SIZE_OPTIONS } from "@/types/stockMovement.types";
import type { StockMovementType } from "@/lib/types";

interface MovementFiltersProps {
  searchValue: string;
  movementType: StockMovementType | undefined;
  pageSize: number;
  isExporting: boolean;
  onSearchChange: (value: string) => void;
  onMovementTypeChange: (type: StockMovementType | undefined) => void;
  onPageSizeChange: (size: number) => void;
  onClearFilters: () => void;
  onExport: () => void;
}

export function MovementFilters({
  searchValue,
  movementType,
  pageSize,
  isExporting,
  onSearchChange,
  onMovementTypeChange,
  onPageSizeChange,
  onClearFilters,
  onExport,
}: MovementFiltersProps) {
  const handleMovementTypeChange = useCallback(
    (value: string) => {
      onMovementTypeChange(
        value === "all" ? undefined : (value as StockMovementType),
      );
    },
    [onMovementTypeChange],
  );

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Search and Filter */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:min-w-[280px]">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            placeholder="Search products..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
            aria-label="Search products"
          />
        </div>

        <Select
          value={movementType || "all"}
          onValueChange={handleMovementTypeChange}
        >
          <SelectTrigger
            className="w-full sm:w-[160px]"
            aria-label="Filter by movement type"
          >
            <SelectValue placeholder="Movement Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Movements</SelectItem>
            <SelectItem value="IN">Stock In</SelectItem>
            <SelectItem value="OUT">Stock Out</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          onClick={onClearFilters}
          className="flex-1 sm:flex-none"
        >
          Clear Filters
        </Button>

        <Button
          variant="outline"
          onClick={onExport}
          disabled={isExporting}
          className="flex-1 sm:flex-none gap-2"
        >
          {isExporting ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Download className="h-4 w-4" aria-hidden="true" />
          )}
          <span className="hidden sm:inline">Export</span>
        </Button>

        <div className="ml-auto flex items-center gap-2">
          <label
            htmlFor="page-size-select"
            className="text-sm text-muted-foreground hidden sm:inline"
          >
            Show:
          </label>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger
              id="page-size-select"
              className="w-20"
              aria-label="Items per page"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
