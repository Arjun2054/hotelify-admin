import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Printer } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { printSalesReport } from "@/utils/reportGenerator";
import { toast } from "sonner";
import type { Sale, SaleStatus, PaymentStatus } from "@/lib/types";

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sale: Sale | null;
}

export function ReportDialog({ open, onOpenChange, sale }: ReportDialogProps) {
  if (!sale) return null;

  const handlePrint = () => {
    const success = printSalesReport(sale);
    if (!success) {
      toast.error("Please allow popups to print the report");
    }
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
      <Badge variant={variants[status]} className="text-xs">
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
      <Badge variant={variants[status]} className="text-xs">
        {status}
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[90vw] lg:max-w-4xl max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="px-4 pt-6 sm:px-6">
          <DialogTitle className="text-lg sm:text-xl">Sales Report</DialogTitle>
          <DialogDescription className="text-sm">
            Complete sale information for {sale.invoiceNumber}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-180px)] px-4 sm:px-6">
          <div className="space-y-4 sm:space-y-6 pb-6">
            {/* Header Summary - 4 columns on desktop, 2 on mobile */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 p-3 sm:p-4 bg-muted/50 rounded-lg">
              <div>
                <div className="text-xs text-muted-foreground mb-1">
                  Invoice
                </div>
                <div className="font-mono font-semibold text-sm sm:text-base truncate">
                  {sale.invoiceNumber}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Date</div>
                <div className="font-medium text-sm sm:text-base">
                  {formatDate(sale.saleDate)}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Status</div>
                <div>{getStatusBadge(sale.status)}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">
                  Payment
                </div>
                <div>{getPaymentBadge(sale.paymentStatus)}</div>
              </div>
            </div>

            {/* Customer Information */}
            <div>
              <h3 className="font-semibold text-sm mb-3">
                Customer Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Name</div>
                  <div className="font-medium text-sm sm:text-base">
                    {sale.customerName || "Walk-in Customer"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    Email
                  </div>
                  <div className="font-medium text-sm sm:text-base truncate">
                    {sale.customerEmail || "N/A"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    Phone
                  </div>
                  <div className="font-medium text-sm sm:text-base">
                    {sale.customerPhone || "N/A"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    Payment Method
                  </div>
                  <div className="font-medium text-sm sm:text-base">
                    {sale.paymentMethod}
                  </div>
                </div>
              </div>
            </div>

            {/* Items - Responsive Table */}
            <div>
              <h3 className="font-semibold text-sm mb-3">Items</h3>

              {/* Desktop Table */}
              <div className="hidden sm:block border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sale.items?.map((item) => (
                      <TableRow key={item.saleItemId}>
                        <TableCell className="font-medium">
                          {item.product?.name || "Unknown Product"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {item.product?.sku || "N/A"}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.unitPrice)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(item.totalPrice)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="sm:hidden space-y-3">
                {sale.items?.map((item) => (
                  <div
                    key={item.saleItemId}
                    className="border rounded-lg p-3 space-y-2"
                  >
                    <div className="font-medium text-sm">
                      {item.product?.name || "Unknown Product"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      SKU: {item.product?.sku || "N/A"}
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <div className="text-xs text-muted-foreground">Qty</div>
                        <div className="font-medium">{item.quantity}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">
                          Price
                        </div>
                        <div className="font-medium">
                          {formatCurrency(item.unitPrice)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">
                          Total
                        </div>
                        <div className="font-semibold">
                          {formatCurrency(item.totalPrice)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div>
              <h3 className="font-semibold text-sm mb-3">Financial Summary</h3>
              <div className="border rounded-lg p-3 sm:p-4 space-y-2">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-medium">
                    {formatCurrency(sale.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-muted-foreground">Discount:</span>
                  <span className="font-medium text-destructive">
                    -{formatCurrency(sale.discount)}
                  </span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-muted-foreground">Tax:</span>
                  <span className="font-medium">
                    {formatCurrency(sale.tax)}
                  </span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-muted-foreground">Shipping:</span>
                  <span className="font-medium">
                    {formatCurrency(sale.shippingCost)}
                  </span>
                </div>
                <div className="flex justify-between text-sm sm:text-base font-bold border-t pt-2 mt-2">
                  <span>Total Amount:</span>
                  <span>{formatCurrency(sale.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm mt-3 pt-3 border-t">
                  <span className="text-muted-foreground">Amount Paid:</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(sale.amountPaid)}
                  </span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-muted-foreground">Amount Due:</span>
                  <span
                    className={`font-medium ${sale.amountDue > 0 ? "text-destructive" : "text-muted-foreground"}`}
                  >
                    {formatCurrency(sale.amountDue)}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {sale.notes && (
              <div>
                <h3 className="font-semibold text-sm mb-3">Notes</h3>
                <div className="border rounded-lg p-3 sm:p-4 bg-muted/30">
                  <p className="text-xs sm:text-sm whitespace-pre-wrap wrap-break-word">
                    {sale.notes}
                  </p>
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="text-xs text-muted-foreground pt-4 border-t">
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-2">
                <div className="truncate">
                  Created: {new Date(sale.createdAt).toLocaleString()}
                </div>
                <div className="truncate">
                  Updated: {new Date(sale.updatedAt).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="px-4 pb-6 sm:px-6 flex-col-reverse sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Close
          </Button>
          <Button
            type="button"
            onClick={handlePrint}
            className="w-full sm:w-auto gap-2"
          >
            <Printer className="h-4 w-4" />
            Print Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
