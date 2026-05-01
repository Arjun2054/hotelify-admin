import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUpDown,
  Search,
  Download,
  MoreHorizontal,
  Eye,
  Trash2,
  X,
  Filter,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";
import type {
  Category,
  MovementType,
  StockMovement,
  Supplier,
  TransactionType,
} from "@/types/stock-movement.types";
import { useStockMovementStore } from "@/store/stock-movement.store";

interface StockMovementTableProps {
  movements: StockMovement[];
  isLoading: boolean;
  categories: Category[];
  suppliers: Supplier[];
  onViewDetails: (movement: StockMovement) => void;
  onDelete: (id: string) => void;
}

export function StockMovementTable({
  movements,
  isLoading,
  categories,
  suppliers,
  onViewDetails,
  onDelete,
}: StockMovementTableProps) {
  const {
    pagination,
    filters,
    searchQuery,
    sortBy,
    sortOrder,
    setPage,
    setLimit,
    setSearchQuery,
    setFilters,
    clearFilters,
    setSorting,
    exportMovements,
    isExporting,
  } = useStockMovementStore();

  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (value: string) => {
    setLocalSearch(value);
    // Debounce search
    const timer = setTimeout(() => {
      setSearchQuery(value);
    }, 500);
    return () => clearTimeout(timer);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSorting(field, sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSorting(field, "asc");
    }
  };

  const getMovementTypeBadge = (type: string) => {
    return type === "IN" ? (
      <Badge className="bg-green-500">IN</Badge>
    ) : (
      <Badge className="bg-red-500">OUT</Badge>
    );
  };

  const hasActiveFilters =
    filters.categoryId ||
    filters.supplierId ||
    filters.movementType ||
    filters.transactionType ||
    filters.startDate ||
    filters.endDate;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-gray-200 rounded animate-pulse" />
        <div className="h-64 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="space-y-3">
        {/* Search and Actions Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by product name or SKU..."
              value={localSearch}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {/* Mobile Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex-1 sm:flex-none"
            >
              <Filter className="mr-2 h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <Badge className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                  !
                </Badge>
              )}
            </Button>

            {/* Export */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  disabled={isExporting}
                  className="flex-1 sm:flex-none"
                >
                  <Download className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Export</span>
                  <span className="sm:hidden">Export</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Export Format</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => exportMovements("csv")}>
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportMovements("json")}>
                  Export as JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Filters Row - Desktop: Always visible, Mobile: Collapsible */}
        <div
          className={`${
            showFilters ? "flex" : "hidden"
          } md:flex flex-col sm:flex-row gap-2 flex-wrap`}
        >
          {/* Category Filter */}
          <Select
            value={filters.categoryId || "all"}
            onValueChange={(value) =>
              setFilters({
                categoryId: value === "all" ? undefined : value,
              })
            }
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.categoryId} value={cat.categoryId}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Supplier Filter */}
          <Select
            value={filters.supplierId || "all"}
            onValueChange={(value) =>
              setFilters({
                supplierId: value === "all" ? undefined : value,
              })
            }
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="All Suppliers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Suppliers</SelectItem>
              {suppliers.map((sup) => (
                <SelectItem key={sup.supplierId} value={sup.supplierId}>
                  {sup.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Movement Type Filter */}
          <Select
            value={filters.movementType || "all"}
            onValueChange={(value) =>
              setFilters({
                movementType:
                  value === "all" ? undefined : (value as MovementType),
              })
            }
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="IN">Stock In</SelectItem>
              <SelectItem value="OUT">Stock Out</SelectItem>
            </SelectContent>
          </Select>

          {/* Transaction Type Filter */}
          <Select
            value={filters.transactionType || "all"}
            onValueChange={(value) =>
              setFilters({
                transactionType:
                  value === "all" ? undefined : (value as TransactionType),
              })
            }
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="All Transactions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Transactions</SelectItem>
              <SelectItem value="PURCHASE">Purchase</SelectItem>
              <SelectItem value="SALE">Sale</SelectItem>
              <SelectItem value="ADJUSTMENT_IN">Adjustment</SelectItem>
              <SelectItem value="RETURN">Return</SelectItem>
              <SelectItem value="TRANSFER_IN">Transfer</SelectItem>
            </SelectContent>
          </Select>

          {/* Start Date Filter */}
          <div className="relative w-full sm:w-[180px]">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <Input
              type="date"
              placeholder="Start Date"
              value={filters.startDate || ""}
              onChange={(e) =>
                setFilters({
                  startDate: e.target.value || undefined,
                })
              }
              className="pl-10 w-full"
            />
          </div>

          {/* End Date Filter */}
          <div className="relative w-full sm:w-[180px]">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <Input
              type="date"
              placeholder="End Date"
              value={filters.endDate || ""}
              onChange={(e) =>
                setFilters({
                  endDate: e.target.value || undefined,
                })
              }
              className="pl-10 w-full"
            />
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="icon"
              onClick={clearFilters}
              className="w-full sm:w-auto"
            >
              <X className="h-4 w-4" />
              <span className="ml-2 sm:hidden">Clear Filters</span>
            </Button>
          )}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[120px]">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("createdAt")}
                    className="h-8 w-full justify-start"
                  >
                    Date
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="min-w-[200px]">Product</TableHead>
                <TableHead className="min-w-[120px]">Category</TableHead>
                <TableHead className="min-w-[80px]">Type</TableHead>
                <TableHead className="min-w-[120px]">Transaction</TableHead>
                <TableHead className="text-right min-w-[100px]">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("quantity")}
                    className="h-8 w-full justify-end"
                  >
                    Quantity
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-right min-w-[100px]">
                  Stock After
                </TableHead>
                <TableHead className="text-right min-w-[100px]">
                  Value
                </TableHead>
                <TableHead className="min-w-[120px]">Reference</TableHead>
                <TableHead className="text-right min-w-[80px]">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8">
                    No stock movements found
                  </TableCell>
                </TableRow>
              ) : (
                movements.map((movement) => (
                  <TableRow key={movement.stockMovementId}>
                    <TableCell>
                      {format(new Date(movement.createdAt), "MMM dd, yyyy")}
                      <br />
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(movement.createdAt), "HH:mm")}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{movement.product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {movement.product.sku}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {movement.product.category.name}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getMovementTypeBadge(movement.movementType)}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {movement.transactionType}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {movement.quantity}
                    </TableCell>
                    <TableCell className="text-right">
                      {movement.newQuantity}
                    </TableCell>
                    <TableCell className="text-right">
                      {movement.totalValue
                        ? `$${movement.totalValue.toFixed(2)}`
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {movement.reference || "-"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => onViewDetails(movement)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onDelete(movement.stockMovementId)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Tablet View (Medium screens) */}
      <div className="hidden md:block lg:hidden border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[120px]">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("createdAt")}
                    className="h-8 w-full justify-start"
                  >
                    Date
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="min-w-[200px]">Product</TableHead>
                <TableHead className="min-w-[80px]">Type</TableHead>
                <TableHead className="text-right min-w-[100px]">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("quantity")}
                    className="h-8 w-full justify-end"
                  >
                    Qty
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-right min-w-[100px]">
                  Value
                </TableHead>
                <TableHead className="text-right min-w-[80px]">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No stock movements found
                  </TableCell>
                </TableRow>
              ) : (
                movements.map((movement) => (
                  <TableRow key={movement.stockMovementId}>
                    <TableCell>
                      <div className="text-sm">
                        {format(new Date(movement.createdAt), "MMM dd, yyyy")}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(movement.createdAt), "HH:mm")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">
                          {movement.product.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {movement.product.sku}
                        </p>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {movement.product.category.name}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getMovementTypeBadge(movement.movementType)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="font-medium">{movement.quantity}</div>
                      <div className="text-xs text-muted-foreground">
                        → {movement.newQuantity}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {movement.totalValue
                        ? `$${movement.totalValue.toFixed(2)}`
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => onViewDetails(movement)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onDelete(movement.stockMovementId)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {movements.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border rounded-lg">
            No stock movements found
          </div>
        ) : (
          movements.map((movement) => (
            <div
              key={movement.stockMovementId}
              className="border rounded-lg p-4 space-y-3 bg-white shadow-sm"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">
                    {movement.product.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {movement.product.sku}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="ml-2">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onViewDetails(movement)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(movement.stockMovementId)}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                {getMovementTypeBadge(movement.movementType)}
                <Badge variant="outline">
                  {movement.product.category.name}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {movement.transactionType}
                </Badge>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Date</p>
                  <p className="font-medium">
                    {format(new Date(movement.createdAt), "MMM dd, yyyy")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(movement.createdAt), "HH:mm")}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Quantity</p>
                  <p className="font-medium text-lg">{movement.quantity}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Stock After</p>
                  <p className="font-medium">{movement.newQuantity}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Value</p>
                  <p className="font-medium">
                    {movement.totalValue
                      ? `$${movement.totalValue.toFixed(2)}`
                      : "-"}
                  </p>
                </div>
              </div>

              {/* Reference */}
              {movement.reference && (
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground">Reference</p>
                  <p className="text-sm">{movement.reference}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
        {/* Results Info */}
        <div className="text-sm text-muted-foreground order-2 sm:order-1">
          Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
          {Math.min(pagination.page * pagination.limit, pagination.totalItems)}{" "}
          of {pagination.totalItems} results
        </div>

        {/* Pagination Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto order-1 sm:order-2">
          <Select
            value={pagination.limit.toString()}
            onValueChange={(value) => setLimit(parseInt(value))}
          >
            <SelectTrigger className="w-full sm:w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 / page</SelectItem>
              <SelectItem value="25">25 / page</SelectItem>
              <SelectItem value="50">50 / page</SelectItem>
              <SelectItem value="100">100 / page</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(pagination.page - 1)}
              disabled={!pagination.hasPrevPage}
              className="flex-1 sm:flex-none"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(pagination.page + 1)}
              disabled={!pagination.hasNextPage}
              className="flex-1 sm:flex-none"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
