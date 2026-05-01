import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X, AlertTriangle } from "lucide-react";
import type {
  HotelItemFilters as Filters,
  Category,
  Supplier,
} from "@/types/hotelItem-types";

interface Props {
  filters: Filters;
  categories: Category[];
  suppliers: Supplier[];
  onFilterChange: (filters: Partial<Filters>) => void;
  onClear: () => void;
}

export function HotelItemFilters({
  filters,
  categories,
  suppliers,
  onFilterChange,
  onClear,
}: Props) {
  const hasFilters =
    filters.categoryId ||
    filters.supplierId ||
    filters.isActive !== undefined ||
    filters.lowStock ||
    filters.search;

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative flex-1 min-w-[220px] max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search items by name, SKU, barcode..."
          value={filters.search ?? ""}
          onChange={(e) => onFilterChange({ search: e.target.value })}
          className="pl-9"
        />
      </div>

      {/* Category */}
      <Select
        value={filters.categoryId ?? "all"}
        onValueChange={(val) =>
          onFilterChange({
            categoryId: val === "all" ? undefined : val,
          })
        }
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {categories.map((c) => (
            <SelectItem key={c.categoryId} value={c.categoryId}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Supplier */}
      <Select
        value={filters.supplierId ?? "all"}
        onValueChange={(val) =>
          onFilterChange({
            supplierId: val === "all" ? undefined : val,
          })
        }
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Supplier" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Suppliers</SelectItem>
          {suppliers.map((s) => (
            <SelectItem key={s.supplierId} value={s.supplierId}>
              {s.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Active Status */}
      <Select
        value={
          filters.isActive === true
            ? "active"
            : filters.isActive === false
              ? "inactive"
              : "all"
        }
        onValueChange={(val) =>
          onFilterChange({
            isActive:
              val === "active" ? true : val === "inactive" ? false : undefined,
          })
        }
      >
        <SelectTrigger className="w-[130px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
        </SelectContent>
      </Select>

      {/* Low Stock Toggle */}
      <Button
        variant={filters.lowStock ? "default" : "outline"}
        size="sm"
        onClick={() => onFilterChange({ lowStock: !filters.lowStock })}
        className="gap-1"
      >
        <AlertTriangle className="h-4 w-4" />
        Low Stock
      </Button>

      {/* Clear */}
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={onClear}>
          <X className="mr-1 h-4 w-4" /> Clear
        </Button>
      )}
    </div>
  );
}
