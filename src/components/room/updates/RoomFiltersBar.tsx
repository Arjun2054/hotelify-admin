// src/components/room/RoomFiltersBar.tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { RoomFilters, RoomStatus, RoomType } from "@/types/room-types";
import {
  Search,
  SlidersHorizontal,
  X,
  LayoutGrid,
  List,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";

interface RoomFiltersBarProps {
  filters: RoomFilters;
  onFiltersChange: (filters: Partial<RoomFilters>) => void;
  onReset: () => void;
  roomTypes: RoomType[];
  floors: number[];
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  totalCount?: number;
}

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "ALL", label: "All Statuses" },
  { value: "AVAILABLE", label: "Available" },
  { value: "OCCUPIED", label: "Occupied" },
  { value: "CLEANING", label: "Cleaning" },
  { value: "MAINTENANCE", label: "Maintenance" },
  { value: "OUT_OF_ORDER", label: "Out of Order" },
];

export function RoomFiltersBar({
  filters,
  onFiltersChange,
  onReset,
  roomTypes,
  floors,
  viewMode,
  onViewModeChange,
  totalCount,
}: RoomFiltersBarProps) {
  const [searchValue, setSearchValue] = useState(filters.search ?? "");
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    setSearchValue(filters.search ?? "");
  }, [filters.search]);

  const handleSearchChange = (val: string) => {
    setSearchValue(val);
    clearTimeout(timerRef.current || 0);
    timerRef.current = setTimeout(
      () => onFiltersChange({ search: val || undefined }),
      300,
    );
  };

  const activeFilterCount = [
    filters.status,
    filters.roomTypeId,
    filters.floor,
  ].filter(Boolean).length;

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by room number or notes..."
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9 pr-9"
          />
          {searchValue && (
            <button
              onClick={() => handleSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Filter popover */}
          <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "gap-2",
                  activeFilterCount > 0 &&
                    "border-primary text-primary hover:text-primary",
                )}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge className="h-4 w-4 rounded-full p-0 flex items-center justify-center text-[10px]">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">Filters</h4>
                  {activeFilterCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        onReset();
                        setFiltersOpen(false);
                      }}
                      className="h-7 gap-1.5 text-xs text-muted-foreground"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Clear all
                    </Button>
                  )}
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Status
                    </label>
                    <Select
                      value={filters.status ?? "ALL"}
                      onValueChange={(val) =>
                        onFiltersChange({
                          status:
                            val === "ALL" ? undefined : (val as RoomStatus),
                        })
                      }
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="All Statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Room Type
                    </label>
                    <Select
                      value={filters.roomTypeId ?? "ALL"}
                      onValueChange={(val) =>
                        onFiltersChange({
                          roomTypeId: val === "ALL" ? undefined : val,
                        })
                      }
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Types</SelectItem>
                        {roomTypes.map((rt) => (
                          <SelectItem key={rt.id} value={rt.id}>
                            {rt.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Floor
                    </label>
                    <Select
                      value={String(filters.floor ?? "ALL")}
                      onValueChange={(val) =>
                        onFiltersChange({
                          floor: val === "ALL" ? undefined : Number(val),
                        })
                      }
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="All Floors" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Floors</SelectItem>
                        {floors.map((f) => (
                          <SelectItem key={f} value={String(f)}>
                            Floor {f}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {totalCount !== undefined && (
                  <p className="text-xs text-muted-foreground border-t pt-3">
                    Showing{" "}
                    <span className="font-semibold text-foreground">
                      {totalCount}
                    </span>{" "}
                    rooms
                  </p>
                )}
              </div>
            </PopoverContent>
          </Popover>

          {/* View toggle */}
          <div className="flex rounded-lg border bg-background p-0.5">
            <button
              onClick={() => onViewModeChange("grid")}
              className={cn(
                "rounded-md p-1.5 transition-all",
                viewMode === "grid"
                  ? "bg-muted text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => onViewModeChange("list")}
              className={cn(
                "rounded-md p-1.5 transition-all",
                viewMode === "list"
                  ? "bg-muted text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Active filter chips */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {filters.status && (
            <Badge variant="secondary" className="gap-1.5 pr-1.5">
              Status: {filters.status.replace("_", " ")}
              <button
                onClick={() => onFiltersChange({ status: undefined })}
                className="hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.roomTypeId && (
            <Badge variant="secondary" className="gap-1.5 pr-1.5">
              Type: {roomTypes.find((t) => t.id === filters.roomTypeId)?.name}
              <button
                onClick={() => onFiltersChange({ roomTypeId: undefined })}
                className="hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.floor && (
            <Badge variant="secondary" className="gap-1.5 pr-1.5">
              Floor {filters.floor}
              <button
                onClick={() => onFiltersChange({ floor: undefined })}
                className="hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          <button
            onClick={onReset}
            className="text-xs text-muted-foreground underline-offset-2 hover:underline"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
