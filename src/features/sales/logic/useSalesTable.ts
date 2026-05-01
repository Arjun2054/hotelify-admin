import { useEffect, useState } from "react";
import { toast } from "sonner";
import { debounce, formatCurrency } from "@/lib/utils";
import { useSalesStore } from "@/store/salesStore";

export function useSalesTable() {
  const [searchInput, setSearchInput] = useState("");
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [saleToCancel, setSaleToCancel] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Payment dialog states
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedSaleForPayment, setSelectedSaleForPayment] =
    useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Complete dialog states
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [saleToComplete, setSaleToComplete] = useState<string | null>(null);

  // Report dialog states
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [selectedSaleForReport, setSelectedSaleForReport] =
    useState<any>(null);

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

  useEffect(() => {
    const debouncedSearch = debounce(() => {
      setFilters({ ...filters, search: searchInput, page: 1 });
    }, 500);

    debouncedSearch();
  }, [filters, searchInput, setFilters]);

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

  const handleOpenPaymentDialog = (sale: any) => {
    setSelectedSaleForPayment(sale);
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
      const newAmountPaid = selectedSaleForPayment.amountPaid + amount;

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

  const handleOpenReportDialog = (sale: any) => {
    setSelectedSaleForReport(sale);
    setReportDialogOpen(true);
  };

  const handlePrintReport = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Please allow popups to print the report");
      return;
    }

    const sale = selectedSaleForReport;
    if (!sale) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Sales Report - ${sale.invoiceNumber}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              padding: 40px;
              color: #333;
              line-height: 1.6;
            }
            .header {
              border-bottom: 3px solid #000;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .company-name {
              font-size: 28px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .report-title {
              font-size: 20px;
              color: #666;
            }
            .invoice-info {
              display: flex;
              justify-content: space-between;
              margin-bottom: 30px;
              padding: 20px;
              background: #f5f5f5;
              border-radius: 8px;
            }
            .info-section {
              flex: 1;
            }
            .info-label {
              font-weight: 600;
              color: #666;
              font-size: 12px;
              text-transform: uppercase;
              margin-bottom: 5px;
            }
            .info-value {
              font-size: 16px;
              font-weight: 500;
            }
            .section-title {
              font-size: 18px;
              font-weight: bold;
              margin: 30px 0 15px;
              padding-bottom: 10px;
              border-bottom: 2px solid #e0e0e0;
            }
            .customer-details, .sale-details {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 20px;
              margin-bottom: 20px;
            }
            .detail-item {
              padding: 10px 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            th {
              background: #f8f9fa;
              padding: 12px;
              text-align: left;
              font-weight: 600;
              border-bottom: 2px solid #dee2e6;
              font-size: 14px;
            }
            td {
              padding: 12px;
              border-bottom: 1px solid #e9ecef;
            }
            .text-right { text-align: right; }
            .totals-section {
              margin-top: 30px;
              display: flex;
              justify-content: flex-end;
            }
            .totals-table {
              width: 400px;
              border: 2px solid #e0e0e0;
              border-radius: 8px;
              padding: 20px;
              background: #f8f9fa;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              font-size: 15px;
            }
            .total-row.grand-total {
              border-top: 2px solid #333;
              margin-top: 10px;
              padding-top: 15px;
              font-size: 20px;
              font-weight: bold;
            }
            .status-badge {
              display: inline-block;
              padding: 6px 12px;
              border-radius: 6px;
              font-size: 12px;
              font-weight: 600;
              text-transform: uppercase;
            }
            .status-completed { background: #d4edda; color: #155724; }
            .status-pending { background: #fff3cd; color: #856404; }
            .status-cancelled { background: #f8d7da; color: #721c24; }
            .status-paid { background: #d4edda; color: #155724; }
            .status-partial { background: #fff3cd; color: #856404; }
            .status-unpaid { background: #f8d7da; color: #721c24; }
            .footer {
              margin-top: 50px;
              padding-top: 20px;
              border-top: 2px solid #e0e0e0;
              text-align: center;
              color: #666;
              font-size: 12px;
            }
            .notes-section {
              margin-top: 30px;
              padding: 20px;
              background: #f8f9fa;
              border-left: 4px solid #007bff;
              border-radius: 4px;
            }
            @media print {
              body { padding: 20px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">Sales Report</div>
            <div class="report-title">Invoice #${sale.invoiceNumber}</div>
          </div>

          <div class="invoice-info">
            <div class="info-section">
              <div class="info-label">Invoice Number</div>
              <div class="info-value">${sale.invoiceNumber}</div>
            </div>
            <div class="info-section">
              <div class="info-label">Date</div>
              <div class="info-value">${new Date(sale.saleDate).toLocaleDateString()}</div>
            </div>
            <div class="info-section">
              <div class="info-label">Status</div>
              <div class="info-value">
                <span class="status-badge status-${sale.status.toLowerCase()}">${sale.status}</span>
              </div>
            </div>
            <div class="info-section">
              <div class="info-label">Payment Status</div>
              <div class="info-value">
                <span class="status-badge status-${sale.paymentStatus.toLowerCase()}">${sale.paymentStatus}</span>
              </div>
            </div>
          </div>

          <div class="section-title">Customer Information</div>
          <div class="customer-details">
            <div class="detail-item">
              <div class="info-label">Customer Name</div>
              <div class="info-value">${sale.customerName || "Walk-in Customer"}</div>
            </div>
            <div class="detail-item">
              <div class="info-label">Email</div>
              <div class="info-value">${sale.customerEmail || "N/A"}</div>
            </div>
            <div class="detail-item">
              <div class="info-label">Phone</div>
              <div class="info-value">${sale.customerPhone || "N/A"}</div>
            </div>
            <div class="detail-item">
              <div class="info-label">Payment Method</div>
              <div class="info-value">${sale.paymentMethod.replace(/_/g, " ")}</div>
            </div>
          </div>

          <div class="section-title">Items</div>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th class="text-right">Quantity</th>
                <th class="text-right">Unit Price</th>
                <th class="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${sale.items
                .map(
                  (item: any) => `
                <tr>
                  <td>${item.product?.name || "Unknown Product"}</td>
                  <td>${item.product?.sku || "N/A"}</td>
                  <td class="text-right">${item.quantity}</td>
                  <td class="text-right">$${item.unitPrice.toFixed(2)}</td>
                  <td class="text-right">$${item.totalPrice.toFixed(2)}</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>

          <div class="totals-section">
            <div class="totals-table">
              <div class="total-row">
                <span>Subtotal:</span>
                <span>$${sale.subtotal.toFixed(2)}</span>
              </div>
              <div class="total-row">
                <span>Discount:</span>
                <span>-$${sale.discount.toFixed(2)}</span>
              </div>
              <div class="total-row">
                <span>Tax:</span>
                <span>$${sale.tax.toFixed(2)}</span>
              </div>
              <div class="total-row">
                <span>Shipping:</span>
                <span>$${sale.shippingCost.toFixed(2)}</span>
              </div>
              <div class="total-row grand-total">
                <span>Total Amount:</span>
                <span>$${sale.totalAmount.toFixed(2)}</span>
              </div>
              <div class="total-row">
                <span>Amount Paid:</span>
                <span style="color: #28a745;">$${sale.amountPaid.toFixed(2)}</span>
              </div>
              <div class="total-row">
                <span>Amount Due:</span>
                <span style="color: ${sale.amountDue > 0 ? "#dc3545" : "#666"};">$${sale.amountDue.toFixed(2)}</span>
              </div>
            </div>
          </div>

          ${
            sale.notes
              ? `
            <div class="notes-section">
              <div class="info-label">Notes</div>
              <div style="margin-top: 10px; white-space: pre-wrap;">${sale.notes}</div>
            </div>
          `
              : ""
          }

          <div class="footer">
            <p>Generated on ${new Date().toLocaleString()}</p>
            <p style="margin-top: 5px;">This is a computer-generated report</p>
          </div>

          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  const getAvailableActions = (sale: any) => {
    const actions = {
      canView: true,
      canPay: false,
      canComplete: false,
      canCancel: false,
      canRefund: false,
    };

    if (sale.status !== "CANCELLED" && sale.status !== "REFUNDED") {
      if (sale.paymentStatus === "UNPAID" || sale.paymentStatus === "PARTIAL") {
        actions.canPay = true;
      }
    }

    if (sale.status === "PENDING" && sale.paymentStatus === "PAID") {
      actions.canComplete = true;
    }

    if (sale.status === "PENDING" || sale.status === "COMPLETED") {
      actions.canCancel = true;
    }

    if (sale.status === "COMPLETED" && sale.paymentStatus === "PAID") {
      actions.canRefund = true;
    }

    return actions;
  };

  return {
    searchInput,
    setSearchInput,
    cancelDialogOpen,
    setCancelDialogOpen,
    saleToCancel,
    setSaleToCancel,
    showFilters,
    setShowFilters,
    paymentDialogOpen,
    setPaymentDialogOpen,
    selectedSaleForPayment,
    setSelectedSaleForPayment,
    paymentAmount,
    setPaymentAmount,
    isProcessingPayment,
    completeDialogOpen,
    setCompleteDialogOpen,
    saleToComplete,
    setSaleToComplete,
    reportDialogOpen,
    setReportDialogOpen,
    selectedSaleForReport,
    sales,
    loading,
    error,
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    filters,
    setPage,
    setPageSize,
    setFilters,
    clearFilters,
    handleCancelSale,
    handleExport,
    handleOpenPaymentDialog,
    handleProcessPayment,
    handleCompleteSale,
    handleOpenReportDialog,
    handlePrintReport,
    getAvailableActions,
  };
}
