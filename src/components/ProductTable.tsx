import { useState, useEffect, useMemo } from "react";
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
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { StockBadge } from "@/components/shared/StockBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useProductStore } from "../store/productStore";
import { useSupplierStore } from "../store/supplierStore";
import {
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Search,
  MoreVertical,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
} from "lucide-react";

import { formatCurrency, debounce } from "@/lib/utils";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { DropdownOption } from "./shared/FilterDropDown";
import FilterDropdown from "./shared/FilterDropDown";
import { useCategoryStore } from "@/store/categoryStore";

type SortField =
  | "name"
  | "price"
  | "stockQuantity"
  | "category"
  | "supplier"
  | "sku";
type SortOrder = "asc" | "desc";

export function ProductTable() {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(
    null,
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );

  const {
    products,
    loading,
    error,
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    searchQuery,
    fetchProducts,
    deleteProduct,
    setPage,
    setPageSize,
    setSearchQuery,
  } = useProductStore();

  const { suppliers, fetchSuppliers } = useSupplierStore();
  const { categories, fetchCategories } = useCategoryStore();

  useEffect(() => {
    fetchProducts();
    fetchSuppliers();
    fetchCategories();
  }, []);

  useEffect(() => {
    const debouncedSearch = debounce(() => {
      setSearchQuery(searchInput);
      fetchProducts({ search: searchInput, page: 1 });
    }, 500);

    debouncedSearch();
  }, [searchInput]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [selectedCategoryId, selectedSupplierId, setPage]);

  /* ── Filter options with counts ── */
  const supplierOptions: DropdownOption[] = useMemo(() => {
    // Get all products for accurate counts
    const allProducts = useProductStore.getState().products;

    return suppliers.map((s) => ({
      id: s.supplierId,
      name: s.name,
      count: allProducts.filter((p) => p.supplier?.supplierId === s.supplierId)
        .length,
    }));
  }, [suppliers]);

  const categoryOptions: DropdownOption[] = useMemo(() => {
    // Get all products for accurate counts
    const allProducts = useProductStore.getState().products;

    return categories.map((c) => ({
      id: c.categoryId,
      name: c.name,
      count: allProducts.filter((p) => p.category.categoryId === c.categoryId)
        .length,
    }));
  }, [categories]);

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products];

    // Apply category filter
    if (selectedCategoryId) {
      filtered = filtered.filter(
        (p) => p.category.categoryId === selectedCategoryId,
      );
    }

    // Apply supplier filter
    if (selectedSupplierId) {
      filtered = filtered.filter(
        (p) => p.supplier?.supplierId === selectedSupplierId,
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (!sortField) return 0;

      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "sku":
          aValue = a.sku.toLowerCase();
          bValue = b.sku.toLowerCase();
          break;
        case "category":
          aValue = a.category.name.toLowerCase();
          bValue = b.category.name.toLowerCase();
          break;
        case "supplier":
          aValue = a.supplier?.name?.toLowerCase() || "";
          bValue = b.supplier?.name?.toLowerCase() || "";
          break;
        case "price":
          aValue = a.price;
          bValue = b.price;
          break;
        case "stockQuantity":
          aValue = a.stockQuantity;
          bValue = b.stockQuantity;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [products, selectedCategoryId, selectedSupplierId, sortField, sortOrder]);

  const handleDelete = async () => {
    if (!productToDelete) return;

    try {
      await deleteProduct(productToDelete);
      toast.success("Product deleted successfully");
    } catch (error) {
      toast.error("Failed to delete product");
    } finally {
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  const openDeleteDialog = (id: string) => {
    setProductToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="h-4 w-4" />
    ) : (
      <ArrowDown className="h-4 w-4" />
    );
  };

  const clearAllFilters = () => {
    setSelectedCategoryId(null);
    setSelectedSupplierId(null);
  };

  const hasActiveFilters = selectedCategoryId || selectedSupplierId;

  // Mobile sort select options
  const mobileSortOptions = [
    { value: "name-asc", label: "Name (A-Z)" },
    { value: "name-desc", label: "Name (Z-A)" },
    { value: "category-asc", label: "Category (A-Z)" },
    { value: "category-desc", label: "Category (Z-A)" },
    { value: "supplier-asc", label: "Supplier (A-Z)" },
    { value: "supplier-desc", label: "Supplier (Z-A)" },
    { value: "price-asc", label: "Price (Low to High)" },
    { value: "price-desc", label: "Price (High to Low)" },
    { value: "stockQuantity-asc", label: "Stock (Low to High)" },
    { value: "stockQuantity-desc", label: "Stock (High to Low)" },
  ];

  const handleMobileSort = (value: string) => {
    if (value === "default") {
      setSortField(null);
      setSortOrder("asc");
      return;
    }

    const [field, order] = value.split("-") as [SortField, SortOrder];
    setSortField(field);
    setSortOrder(order);
  };

  const getCurrentSortValue = () => {
    if (!sortField) return "default";
    return `${sortField}-${sortOrder}`;
  };

  if (error) {
    return (
      <div className="rounded-md bg-destructive/10 p-4 text-destructive">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters - Responsive */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap gap-2">
          <FilterDropdown
            label="Category"
            options={categoryOptions}
            selectedId={selectedCategoryId}
            onSelect={(id) => setSelectedCategoryId(id)}
            onClear={() => setSelectedCategoryId(null)}
          />

          <FilterDropdown
            label="Supplier"
            options={supplierOptions}
            selectedId={selectedSupplierId}
            onSelect={(id) => setSelectedSupplierId(id)}
            onClear={() => setSelectedSupplierId(null)}
          />
        </div>

        {/* Mobile Sort Dropdown */}
        <div className="flex sm:hidden items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort:</span>
          <Select
            value={getCurrentSortValue()}
            onValueChange={handleMobileSort}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select sorting" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              {mobileSortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            Show:
          </span>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => setPageSize(Number(value))}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {selectedCategoryId && (
            <Badge variant="secondary" className="gap-1">
              Category:{" "}
              {
                categories.find((c) => c.categoryId === selectedCategoryId)
                  ?.name
              }
              <button
                onClick={() => setSelectedCategoryId(null)}
                className="ml-1 rounded-full hover:bg-muted p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {selectedSupplierId && (
            <Badge variant="secondary" className="gap-1">
              Supplier:{" "}
              {suppliers.find((s) => s.supplierId === selectedSupplierId)?.name}
              <button
                onClick={() => setSelectedSupplierId(null)}
                className="ml-1 rounded-full hover:bg-muted p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="h-7 text-xs"
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Desktop Table */}
      <div className="hidden md:block rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Image</TableHead>
              <TableHead className="min-w-25">
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3 h-8 data-[state=open]:bg-accent"
                  onClick={() => handleSort("sku")}
                >
                  SKU
                  {getSortIcon("sku")}
                </Button>
              </TableHead>
              <TableHead className="min-w-50">
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3 h-8 data-[state=open]:bg-accent"
                  onClick={() => handleSort("name")}
                >
                  Name
                  {getSortIcon("name")}
                </Button>
              </TableHead>
              <TableHead className="min-w-30">
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3 h-8 data-[state=open]:bg-accent"
                  onClick={() => handleSort("category")}
                >
                  Category
                  {getSortIcon("category")}
                </Button>
              </TableHead>
              <TableHead className="min-w-30">
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3 h-8 data-[state=open]:bg-accent"
                  onClick={() => handleSort("supplier")}
                >
                  Suppliers
                  {getSortIcon("supplier")}
                </Button>
              </TableHead>
              <TableHead className="min-w-25">
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3 h-8 data-[state=open]:bg-accent"
                  onClick={() => handleSort("price")}
                >
                  Price
                  {getSortIcon("price")}
                </Button>
              </TableHead>
              <TableHead className="min-w-30">
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3 h-8 data-[state=open]:bg-accent"
                  onClick={() => handleSort("stockQuantity")}
                >
                  Stock
                  {getSortIcon("stockQuantity")}
                </Button>
              </TableHead>
              <TableHead className="text-right min-w-25">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: pageSize }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-12 w-12" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-20" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredAndSortedProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8}>
                  <EmptyState
                    title="No products found"
                    description={
                      searchQuery || hasActiveFilters
                        ? "Try adjusting your search or filters"
                        : "Get started by adding your first product"
                    }
                  />
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedProducts.map((product) => (
                <TableRow key={product.productId}>
                  <TableCell>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-12 w-12 rounded object-cover"
                    />
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {product.sku}
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category.name}</TableCell>
                  <TableCell>{product.supplier?.name || "-"}</TableCell>
                  <TableCell>{formatCurrency(product.price)}</TableCell>
                  <TableCell>
                    <StockBadge quantity={product.stockQuantity} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          navigate(
                            `/dashboard/products/${product.productId}/edit`,
                          )
                        }
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDeleteDialog(product.productId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))
        ) : filteredAndSortedProducts.length === 0 ? (
          <EmptyState
            title="No products found"
            description={
              searchQuery || hasActiveFilters
                ? "Try adjusting your search or filters"
                : "Get started by adding your first product"
            }
          />
        ) : (
          filteredAndSortedProducts.map((product) => (
            <Card key={product.productId}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-20 w-20 rounded object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">
                          {product.name}
                        </h3>
                        <p className="text-sm text-muted-foreground font-mono">
                          {product.sku}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="shrink-0"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              navigate(
                                `/dashboard/products/${product.productId}/edit`,
                              )
                            }
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openDeleteDialog(product.productId)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                      <span className="text-muted-foreground">
                        {product.category.name}
                      </span>
                      {product.supplier?.name && (
                        <>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-muted-foreground">
                            {product.supplier.name}
                          </span>
                        </>
                      )}
                      <span className="text-muted-foreground">•</span>
                      <span className="font-semibold">
                        {formatCurrency(product.price)}
                      </span>
                    </div>
                    <div className="mt-2">
                      <StockBadge quantity={product.stockQuantity} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Responsive Pagination */}
      {!loading && filteredAndSortedProducts.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground text-center sm:text-left">
            Showing {filteredAndSortedProducts.length} of {totalItems} products
            {hasActiveFilters && " (filtered)"}
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline ml-1">Previous</span>
            </Button>

            {/* Show page numbers on larger screens */}
            <div className="hidden sm:flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  return (
                    page === 1 ||
                    page === totalPages ||
                    Math.abs(page - currentPage) <= 1
                  );
                })
                .map((page, index, array) => {
                  const showEllipsis = index > 0 && page - array[index - 1] > 1;
                  return (
                    <div key={page} className="flex items-center">
                      {showEllipsis && <span className="px-2">...</span>}
                      <Button
                        variant={page === currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPage(page)}
                      >
                        {page}
                      </Button>
                    </div>
                  );
                })}
            </div>

            {/* Current page indicator on mobile */}
            <div className="sm:hidden">
              <span className="text-sm font-medium">
                {currentPage} / {totalPages}
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <span className="hidden sm:inline mr-1">Next</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Delete Product"
        description="Are you sure you want to delete this product? This action cannot be undone."
        confirmText="Delete"
      />
    </div>
  );
}
