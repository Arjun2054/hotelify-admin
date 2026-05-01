import { useState, useEffect } from "react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useSalesStore } from "../store/salesStore";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Download,
  Eye,
  Filter,
  MoreVertical,
  DollarSign,
  CheckCircle,
  Ban,
  RefreshCw,
  FileText,
} from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils"; // Removed debounce import (handled natively in useEffect)
import { toast } from "sonner";
import type { PaymentStatus, SaleStatus, Sale } from "@/lib/types"; // Added Sale type
import { ReportDialog } from "./Reportdialog ";
// Fixed typo in import path

interface SalesTableProps {
  onViewInvoice?: (saleId: string) => void;
}

export function SalesTable({ onViewInvoice }: SalesTableProps) {
  const [searchInput, setSearchInput] = useState("");
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [saleToCancel, setSaleToCancel] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Payment dialog states
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedSaleForPayment, setSelectedSaleForPayment] =
    useState<Sale | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Complete dialog states
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [saleToComplete, setSaleToComplete] = useState<string | null>(null);

  // Report dialog states
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [selectedSaleForReport, setSelectedSaleForReport] =
    useState<Sale | null>(null);

  const {
    sales,
    loading,
    error,
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    filters,
    fetchSales,
    cancelSale,
    updateSale,
    exportSales,
    setPage,
    setPageSize,
    setFilters,
    clearFilters,
  } = useSalesStore();

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  // FIX: Proper debounce logic using setTimeout inside useEffect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Only trigger if the search actually changed to prevent loops
      if (filters.search !== searchInput) {
        setFilters({ ...filters, search: searchInput, page: 1 });
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchInput, filters, setFilters]);

  const handleCancelSale = async () => {
    if (!saleToCancel) return;

    try {
      await cancelSale(saleToCancel, "Cancelled by user");
      toast.success("Sale cancelled successfully");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to cancel sale";
      toast.error(errorMessage);
      console.error("Cancel sale error:", error);
    } finally {
      setCancelDialogOpen(false);
      setSaleToCancel(null);
    }
  };

  const handleExport = async () => {
    try {
      await exportSales(filters);
      toast.success("Sales exported successfully");
    } catch (error) {
      toast.error("Failed to export sales");
    }
  };

  const handleOpenPaymentDialog = (sale: Sale) => {
    setSelectedSaleForPayment(sale);
    // Default to the full remaining amount
    setPaymentAmount(sale.amountDue.toString());
    setPaymentDialogOpen(true);
  };

  const handleProcessPayment = async () => {
    if (!selectedSaleForPayment) return;

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }

    if (amount > selectedSaleForPayment.amountDue) {
      toast.error("Payment amount cannot exceed amount due");
      return;
    }

    setIsProcessingPayment(true);
    try {
      // Calculate new payment values
      const newAmountPaid = (selectedSaleForPayment.amountPaid || 0) + amount;

      await updateSale(selectedSaleForPayment.saleId, {
        amountPaid: newAmountPaid,
      });

      toast.success(
        `Payment of ${formatCurrency(amount)} processed successfully`,
      );
      setPaymentDialogOpen(false);
      setSelectedSaleForPayment(null);
      setPaymentAmount("");
      await fetchSales();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to process payment";
      toast.error(errorMessage);
      console.error("Payment error:", error);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleCompleteSale = async () => {
    if (!saleToComplete) return;

    try {
      await updateSale(saleToComplete, { status: "COMPLETED" });
      toast.success("Sale marked as completed");
      setCompleteDialogOpen(false);
      setSaleToComplete(null);
      await fetchSales();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to complete sale";
      toast.error(errorMessage);
      console.error("Complete sale error:", error);
    }
  };

  // Determine available actions based on status and payment
  const getAvailableActions = (sale: Sale) => {
    const actions = {
      canView: true,
      canPay: false,
      canComplete: false,
      canCancel: false,
      canRefund: false,
    };

    // View is always available
    actions.canView = true;

    // Payment actions
    if (sale.status !== "CANCELLED" && sale.status !== "REFUNDED") {
      if (sale.paymentStatus === "UNPAID" || sale.paymentStatus === "PARTIAL") {
        actions.canPay = true;
      }
    }

    // Complete action - only for PENDING sales that are PAID
    if (sale.status === "PENDING" && sale.paymentStatus === "PAID") {
      actions.canComplete = true;
    }

    // Cancel action - only for PENDING or COMPLETED sales (not already cancelled/refunded)
    if (sale.status === "PENDING" || sale.status === "COMPLETED") {
      actions.canCancel = true;
    }

    // Refund action - only for COMPLETED sales that are PAID
    if (sale.status === "COMPLETED" && sale.paymentStatus === "PAID") {
      actions.canRefund = true;
    }

    return actions;
  };

  const getStatusBadge = (status: SaleStatus) => {
    const variants: Record<
      SaleStatus,
      "default" | "secondary" | "destructive"
    > = {
      PENDING: "secondary",
      COMPLETED: "default",
      CANCELLED: "destructive",
      REFUNDED: "secondary",
    };
    return (
      <Badge variant={variants[status] || "default"} className="text-xs">
        {status}
      </Badge>
    );
  };

  const getPaymentBadge = (status: PaymentStatus) => {
    const variants: Record<
      PaymentStatus,
      "default" | "secondary" | "destructive"
    > = {
      PAID: "default",
      PARTIAL: "secondary",
      UNPAID: "destructive",
    };
    return (
      <Badge variant={variants[status] || "default"} className="text-xs">
        {status}
      </Badge>
    );
  };

  const handleOpenReportDialog = (sale: Sale) => {
    setSelectedSaleForReport(sale);
    setReportDialogOpen(true);
  };

  if (error) {
    return (
      <div className="rounded-md bg-destructive/10 p-4 text-destructive">
        <p className="text-sm sm:text-base">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Primary Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row  gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by invoice, customer..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className="sm:hidden"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              onClick={handleExport}
              className="gap-2 flex-1 sm:flex-none"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </div>
        </div>

        {/* Advanced Filters */}
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 ${
            showFilters ? "block" : "hidden sm:grid"
          }`}
        >
          <Select
            value={filters.status || "all"}
            onValueChange={(value) =>
              setFilters({
                ...filters,
                status: value === "all" ? undefined : (value as SaleStatus),
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
              <SelectItem value="REFUNDED">Refunded</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.paymentStatus || "all"}
            onValueChange={(value) =>
              setFilters({
                ...filters,
                paymentStatus:
                  value === "all" ? undefined : (value as PaymentStatus),
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Payment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payments</SelectItem>
              <SelectItem value="PAID">Paid</SelectItem>
              <SelectItem value="PARTIAL">Partial</SelectItem>
              <SelectItem value="UNPAID">Unpaid</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={pageSize.toString()}
            onValueChange={(value) => setPageSize(Number(value))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">Show 10</SelectItem>
              <SelectItem value="20">Show 20</SelectItem>
              <SelectItem value="50">Show 50</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => {
              clearFilters();
              setSearchInput("");
            }}
            className="w-full"
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-center">Items</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Amount Due</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: pageSize }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-12 mx-auto" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20 ml-auto" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20 ml-auto" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-24 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : sales.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10}>
                  <EmptyState
                    title="No sales found"
                    description="Sales will appear here once you create them"
                  />
                </TableCell>
              </TableRow>
            ) : (
              sales.map((sale) => (
                <TableRow key={sale.saleId}>
                  <TableCell className="font-mono text-sm">
                    {sale.invoiceNumber}
                  </TableCell>
                  <TableCell>
                    <div className="max-w-50">
                      <div className="font-medium truncate">
                        {sale.customerName || "Walk-in Customer"}
                      </div>
                      {sale.customerEmail && (
                        <div className="text-sm text-muted-foreground truncate">
                          {sale.customerEmail}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-45">
                      {sale.items && sale.items.length > 0 ? (
                        <>
                          <div className="text-sm truncate">
                            {sale.items[0].product?.name || "Unknown Product"}
                          </div>
                          {sale.items.length > 1 && (
                            <div className="text-xs text-muted-foreground">
                              +{sale.items.length - 1} more
                            </div>
                          )}
                        </>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          No items
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {formatDate(sale.saleDate)}
                  </TableCell>
                  <TableCell className="text-center">
                    {sale.items?.length || 0}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(sale.totalAmount)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {sale.amountDue > 0 ? (
                      <span className="text-destructive">
                        {formatCurrency(sale.amountDue)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">
                        {formatCurrency(0)}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(sale.status)}</TableCell>
                  <TableCell>{getPaymentBadge(sale.paymentStatus)}</TableCell>
                  <TableCell className="text-right">
                    {(() => {
                      const actions = getAvailableActions(sale);
                      return (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            {actions.canView && onViewInvoice && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => onViewInvoice(sale.saleId)}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Invoice
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                              </>
                            )}

                            <DropdownMenuItem
                              onClick={() => handleOpenReportDialog(sale)}
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              Generate Report
                            </DropdownMenuItem>
                            {(actions.canPay ||
                              actions.canComplete ||
                              actions.canCancel ||
                              actions.canRefund) && <DropdownMenuSeparator />}

                            {actions.canPay && (
                              <DropdownMenuItem
                                onClick={() => handleOpenPaymentDialog(sale)}
                              >
                                <DollarSign className="h-4 w-4 mr-2" />
                                Record Payment
                              </DropdownMenuItem>
                            )}

                            {actions.canComplete && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setSaleToComplete(sale.saleId);
                                  setCompleteDialogOpen(true);
                                }}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Mark as Completed
                              </DropdownMenuItem>
                            )}

                            {actions.canCancel && (
                              <>
                                {(actions.canPay || actions.canComplete) && (
                                  <DropdownMenuSeparator />
                                )}
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSaleToCancel(sale.saleId);
                                    setCancelDialogOpen(true);
                                  }}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Ban className="h-4 w-4 mr-2" />
                                  Cancel Sale
                                </DropdownMenuItem>
                              </>
                            )}

                            {actions.canRefund && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() =>
                                    toast.info("Refund feature coming soon")
                                  }
                                  className="text-orange-600 focus:text-orange-600"
                                >
                                  <RefreshCw className="h-4 w-4 mr-2" />
                                  Process Refund
                                </DropdownMenuItem>
                              </>
                            )}

                            {!actions.canPay &&
                              !actions.canComplete &&
                              !actions.canCancel &&
                              !actions.canRefund && (
                                <DropdownMenuItem disabled>
                                  No actions available
                                </DropdownMenuItem>
                              )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      );
                    })()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {loading ? (
          Array.from({ length: pageSize }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))
        ) : sales.length === 0 ? (
          <EmptyState
            title="No sales found"
            description="Sales will appear here once you create them"
          />
        ) : (
          sales.map((sale) => (
            <Card key={sale.saleId}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="font-mono text-sm font-medium truncate">
                      {sale.invoiceNumber}
                    </div>
                    <div className="text-sm text-muted-foreground truncate">
                      {sale.customerName || "Walk-in Customer"}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {getStatusBadge(sale.status)}
                    {getPaymentBadge(sale.paymentStatus)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Date:</span>
                    <div className="font-medium">
                      {formatDate(sale.saleDate)}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Items:</span>
                    <div className="font-medium">{sale.items?.length || 0}</div>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Products:</span>
                    <div className="font-medium text-sm truncate">
                      {sale.items && sale.items.length > 0 ? (
                        <>
                          {sale.items[0].product?.name || "Unknown Product"}
                          {sale.items.length > 1 && (
                            <span className="text-muted-foreground">
                              {" "}
                              +{sale.items.length - 1} more
                            </span>
                          )}
                        </>
                      ) : (
                        "No items"
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total:</span>
                    <div className="text-lg font-bold">
                      {formatCurrency(sale.totalAmount)}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Amount Due:</span>
                    <div className="text-lg font-bold">
                      {sale.amountDue > 0 ? (
                        <span className="text-destructive">
                          {formatCurrency(sale.amountDue)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">
                          {formatCurrency(0)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {(() => {
                  const actions = getAvailableActions(sale);
                  return (
                    <div className="flex flex-col gap-2 pt-2 border-t">
                      {/* Primary Actions Row */}
                      <div className="flex gap-2">
                        {actions.canView && onViewInvoice && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onViewInvoice(sale.saleId)}
                            className="flex-1"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        )}

                        {actions.canPay && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleOpenPaymentDialog(sale)}
                            className="flex-1"
                          >
                            <DollarSign className="h-4 w-4 mr-2" />
                            Pay
                          </Button>
                        )}

                        {actions.canComplete && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => {
                              setSaleToComplete(sale.saleId);
                              setCompleteDialogOpen(true);
                            }}
                            className="flex-1"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Complete
                          </Button>
                        )}
                      </div>

                      {/* Secondary Actions Row */}
                      {(actions.canCancel || actions.canRefund) && (
                        <div className="flex gap-2">
                          {actions.canCancel && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSaleToCancel(sale.saleId);
                                setCancelDialogOpen(true);
                              }}
                              className="flex-1 text-destructive hover:text-destructive"
                            >
                              <Ban className="h-4 w-4 mr-2" />
                              Cancel
                            </Button>
                          )}

                          {actions.canRefund && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                toast.info("Refund feature coming soon")
                              }
                              className="flex-1 text-orange-600 hover:text-orange-600"
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Refund
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {!loading && sales.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground text-center sm:text-left">
            Showing {(currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, totalItems)} of {totalItems}{" "}
            results
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">Previous</span>
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const pageNumber = i + 1;
                return (
                  <Button
                    key={pageNumber}
                    variant={pageNumber === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPage(pageNumber)}
                    className="h-8 w-8 p-0"
                  >
                    {pageNumber}
                  </Button>
                );
              })}
              {totalPages > 5 && (
                <>
                  <span className="px-2 text-muted-foreground">...</span>
                  <Button
                    variant={currentPage === totalPages ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPage(totalPages)}
                    className="h-8 w-8 p-0"
                  >
                    {totalPages}
                  </Button>
                </>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <span className="hidden sm:inline mr-2">Next</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        onConfirm={handleCancelSale}
        title="Cancel Sale"
        description="Are you sure you want to cancel this sale? Stock will be restored."
        confirmText="Cancel Sale"
      />

      <ConfirmDialog
        open={completeDialogOpen}
        onOpenChange={setCompleteDialogOpen}
        onConfirm={handleCompleteSale}
        title="Complete Sale"
        description="Mark this sale as completed? This action confirms the sale is finalized."
        confirmText="Mark as Completed"
      />

      {/* FIXED: Completed Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Process a payment for invoice{" "}
              <span className="font-mono font-medium text-foreground">
                {selectedSaleForPayment?.invoiceNumber}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs">
                  Total Amount
                </Label>
                <div className="font-medium">
                  {selectedSaleForPayment &&
                    formatCurrency(selectedSaleForPayment.totalAmount)}
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs">
                  Amount Due
                </Label>
                <div className="font-medium text-destructive">
                  {selectedSaleForPayment &&
                    formatCurrency(selectedSaleForPayment.amountDue)}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Payment Amount</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  max={selectedSaleForPayment?.amountDue}
                  step="0.01"
                  className="pl-9"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPaymentDialogOpen(false)}
              disabled={isProcessingPayment}
            >
              Cancel
            </Button>
            <Button
              onClick={handleProcessPayment}
              disabled={isProcessingPayment || !paymentAmount}
            >
              {isProcessingPayment ? "Processing..." : "Confirm Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* FIXED: Added Report Dialog */}
      {selectedSaleForReport && (
        <ReportDialog
          open={reportDialogOpen}
          onOpenChange={setReportDialogOpen}
          sale={selectedSaleForReport}
        />
      )}
    </div>
  );
}
