/**
 * Sales Report Generation Utilities
 * Contains business logic for generating and formatting sales reports
 */

import type { Sale } from "@/lib/types";

/**
 * Generates HTML content for printing a sales report
 * @param sale - The sale object to generate report for
 * @returns HTML string ready for printing
 */
export const generatePrintableReport = (sale: Sale): string => {
  if (!sale) return "";

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Sales Report - ${sale.invoiceNumber}</title>
        <style>
          ${getPrintStyles()}
        </style>
      </head>
      <body>
        ${getReportContent(sale)}
        <script>
          window.onload = function() {
            window.print();
            // Optionally close window after print
            // window.onafterprint = function() { window.close(); }
          }
        </script>
      </body>
    </html>
  `;
};

/**
 * Opens a print dialog with the formatted report
 * @param sale - The sale to print
 * @returns boolean indicating success
 */
export const printSalesReport = (sale: Sale): boolean => {
  try {
    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      return false;
    }

    const printContent = generatePrintableReport(sale);
    printWindow.document.write(printContent);
    printWindow.document.close();

    return true;
  } catch (error) {
    console.error("Error printing report:", error);
    return false;
  }
};

/**
 * Formats a payment method string for display
 * @param method - Payment method enum value
 * @returns Formatted string
 */
export const formatPaymentMethod = (method: string): string => {
  return method.replace(/_/g, " ");
};

/**
 * Gets CSS styles for print layout
 * @returns CSS string
 */
const getPrintStyles = (): string => {
  return `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      padding: 20px;
      color: #1a1a1a;
      line-height: 1.6;
      font-size: 14px;
    }
    
    .container {
      max-width: 800px;
      margin: 0 auto;
    }
    
    /* Header Section */
    .header {
      border-bottom: 3px solid #000;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    
    .company-name {
      font-size: 32px;
      font-weight: bold;
      margin-bottom: 5px;
      color: #000;
    }
    
    .report-title {
      font-size: 18px;
      color: #666;
      font-weight: 500;
    }
    
    /* Invoice Info Grid */
    .invoice-info {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 8px;
    }
    
    .info-section {
      min-width: 0;
    }
    
    .info-label {
      font-weight: 600;
      color: #666;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 5px;
    }
    
    .info-value {
      font-size: 16px;
      font-weight: 600;
      color: #000;
      word-wrap: break-word;
    }
    
    /* Section Headers */
    .section-title {
      font-size: 18px;
      font-weight: bold;
      margin: 30px 0 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #e0e0e0;
      color: #000;
    }
    
    /* Customer and Sale Details */
    .detail-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 20px;
    }
    
    .detail-item {
      padding: 10px 0;
    }
    
    /* Items Table */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    
    thead {
      background: #f8f9fa;
    }
    
    th {
      padding: 12px;
      text-align: left;
      font-weight: 700;
      border-bottom: 2px solid #dee2e6;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      color: #000;
    }
    
    td {
      padding: 12px;
      border-bottom: 1px solid #e9ecef;
    }
    
    .text-right {
      text-align: right;
    }
    
    /* Totals Section */
    .totals-section {
      margin-top: 30px;
      display: flex;
      justify-content: flex-end;
    }
    
    .totals-table {
      width: 100%;
      max-width: 400px;
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
    
    .total-row.subtotal {
      padding-top: 0;
    }
    
    .total-row.grand-total {
      border-top: 2px solid #000;
      margin-top: 10px;
      padding-top: 15px;
      font-size: 20px;
      font-weight: bold;
      color: #000;
    }
    
    .total-row.payment-info {
      border-top: 1px solid #dee2e6;
      margin-top: 8px;
      padding-top: 12px;
    }
    
    /* Status Badges */
    .status-badge {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .status-completed {
      background: #d4edda;
      color: #155724;
    }
    
    .status-pending {
      background: #fff3cd;
      color: #856404;
    }
    
    .status-cancelled {
      background: #f8d7da;
      color: #721c24;
    }
    
    .status-refunded {
      background: #e2e3e5;
      color: #383d41;
    }
    
    .status-paid {
      background: #d4edda;
      color: #155724;
    }
    
    .status-partial {
      background: #fff3cd;
      color: #856404;
    }
    
    .status-unpaid {
      background: #f8d7da;
      color: #721c24;
    }
    
    /* Notes Section */
    .notes-section {
      margin-top: 30px;
      padding: 20px;
      background: #f8f9fa;
      border-left: 4px solid #007bff;
      border-radius: 4px;
    }
    
    .notes-content {
      margin-top: 10px;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    
    /* Footer */
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 2px solid #e0e0e0;
      text-align: center;
      color: #666;
      font-size: 11px;
    }
    
    /* Color Classes */
    .text-success {
      color: #28a745;
    }
    
    .text-danger {
      color: #dc3545;
    }
    
    .text-muted {
      color: #6c757d;
    }
    
    /* Print Specific */
    @media print {
      body {
        padding: 10mm;
      }
      
      .no-print {
        display: none;
      }
      
      .page-break {
        page-break-after: always;
      }
    }
    
    /* Responsive for small screens if printed from mobile */
    @media screen and (max-width: 600px) {
      .invoice-info,
      .detail-grid {
        grid-template-columns: 1fr;
      }
      
      .totals-table {
        max-width: 100%;
      }
    }
  `;
};

/**
 * Gets the main report content HTML
 * @param sale - Sale object
 * @returns HTML string
 */
const getReportContent = (sale: Sale): string => {
  const formattedDate = new Date(sale.saleDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const itemsHtml = sale.items
    ?.map(
      (item) => `
    <tr>
      <td><strong>${item.product?.name || "Unknown Product"}</strong></td>
      <td class="text-muted">${item.product?.sku || "N/A"}</td>
      <td class="text-right">${item.quantity}</td>
      <td class="text-right">$${item.unitPrice.toFixed(2)}</td>
      <td class="text-right"><strong>$${item.totalPrice.toFixed(2)}</strong></td>
    </tr>
  `,
    )
    .join("");

  const notesSection = sale.notes
    ? `
    <div class="notes-section">
      <div class="info-label">Notes</div>
      <div class="notes-content">${escapeHtml(sale.notes)}</div>
    </div>
  `
    : "";

  return `
    <div class="container">
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
          <div class="info-value">${formattedDate}</div>
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
      <div class="detail-grid">
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
          <div class="info-value">${formatPaymentMethod(sale.paymentMethod)}</div>
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
          ${itemsHtml}
        </tbody>
      </table>

      <div class="totals-section">
        <div class="totals-table">
          <div class="total-row subtotal">
            <span>Subtotal:</span>
            <span>$${sale.subtotal.toFixed(2)}</span>
          </div>
          <div class="total-row">
            <span>Discount:</span>
            <span class="text-danger">-$${sale.discount.toFixed(2)}</span>
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
          <div class="total-row payment-info">
            <span>Amount Paid:</span>
            <span class="text-success"><strong>$${sale.amountPaid.toFixed(2)}</strong></span>
          </div>
          <div class="total-row">
            <span>Amount Due:</span>
            <span class="${sale.amountDue > 0 ? "text-danger" : "text-muted"}">
              <strong>$${sale.amountDue.toFixed(2)}</strong>
            </span>
          </div>
        </div>
      </div>

      ${notesSection}

      <div class="footer">
        <p><strong>Generated on ${new Date().toLocaleString("en-US", { dateStyle: "long", timeStyle: "short" })}</strong></p>
        <p style="margin-top: 5px;">This is a computer-generated report</p>
      </div>
    </div>
  `;
};

/**
 * Escapes HTML special characters to prevent XSS
 * @param text - Text to escape
 * @returns Escaped text
 */
const escapeHtml = (text: string): string => {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
};

/**
 * Formats currency for display
 * @param amount - Amount to format
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

/**
 * Formats date for display
 * @param date - Date to format
 * @returns Formatted date string
 */
export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};
