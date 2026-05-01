/**
 * Sales Action Utilities
 * Contains business logic for determining available actions and status badges
 */

import type { Sale, SaleStatus, PaymentStatus } from "@/lib/types";

export interface AvailableActions {
  canView: boolean;
  canPay: boolean;
  canComplete: boolean;
  canCancel: boolean;
  canRefund: boolean;
}

/**
 * Determines which actions are available for a sale based on its status
 * @param sale - The sale object to check
 * @returns Object with boolean flags for each action
 */
export function getAvailableActions(sale: Sale): AvailableActions {
  const actions: AvailableActions = {
    canView: true,
    canPay: false,
    canComplete: false,
    canCancel: false,
    canRefund: false,
  };

  // View is always available
  actions.canView = true;

  // Payment actions - only if sale is not cancelled or refunded
  if (sale.status !== "CANCELLED" && sale.status !== "REFUNDED") {
    if (sale.paymentStatus === "UNPAID" || sale.paymentStatus === "PARTIAL") {
      actions.canPay = true;
    }
  }

  // Complete action - only for pending sales that are fully paid
  if (sale.status === "PENDING" && sale.paymentStatus === "PAID") {
    actions.canComplete = true;
  }

  // Cancel action - only for pending or completed sales
  if (sale.status === "PENDING" || sale.status === "COMPLETED") {
    actions.canCancel = true;
  }

  // Refund action - only for completed sales that are fully paid
  if (sale.status === "COMPLETED" && sale.paymentStatus === "PAID") {
    actions.canRefund = true;
  }

  return actions;
}

/**
 * Gets the appropriate badge variant for a sale status
 * @param status - The sale status
 * @returns Badge variant
 */
export function getStatusBadgeVariant(
  status: SaleStatus,
): "default" | "secondary" | "destructive" | "outline" {
  const variants: Record<
    SaleStatus,
    "default" | "secondary" | "destructive" | "outline"
  > = {
    COMPLETED: "default",
    PENDING: "secondary",
    CANCELLED: "destructive",
    REFUNDED: "outline",
  };
  return variants[status];
}

/**
 * Gets the appropriate badge variant for a payment status
 * @param status - The payment status
 * @returns Badge variant
 */
export function getPaymentBadgeVariant(
  status: PaymentStatus,
): "default" | "secondary" | "destructive" {
  const variants: Record<
    PaymentStatus,
    "default" | "secondary" | "destructive"
  > = {
    PAID: "default",
    PARTIAL: "secondary",
    UNPAID: "destructive",
  };
  return variants[status];
}

/**
 * Calculates payment preview for a given amount
 * @param sale - The sale object
 * @param paymentAmount - The payment amount to preview
 * @returns Payment preview data
 */
export function calculatePaymentPreview(sale: Sale, paymentAmount: string) {
  const amount = parseFloat(paymentAmount);

  if (isNaN(amount) || amount <= 0) {
    return null;
  }

  const newAmountPaid = sale.amountPaid + amount;
  const remainingBalance = Math.max(0, sale.amountDue - amount);
  const newStatus = remainingBalance <= 0.01 ? "PAID" : "PARTIAL";

  return {
    newAmountPaid,
    remainingBalance,
    newStatus,
    isValid: amount <= sale.amountDue && amount > 0,
  };
}

/**
 * Formats payment method for display
 * @param method - Payment method string
 * @returns Formatted string
 */
export function formatPaymentMethod(method: string): string {
  return method.replace(/_/g, " ");
}

/**
 * Validates payment amount
 * @param amount - Payment amount string
 * @param maxAmount - Maximum allowed amount
 * @returns Validation result
 */
export function validatePaymentAmount(
  amount: string,
  maxAmount: number,
): { isValid: boolean; error?: string } {
  const parsedAmount = parseFloat(amount);

  if (!amount || amount.trim() === "") {
    return { isValid: false, error: "Amount is required" };
  }

  if (isNaN(parsedAmount)) {
    return { isValid: false, error: "Invalid amount" };
  }

  if (parsedAmount <= 0) {
    return { isValid: false, error: "Amount must be greater than zero" };
  }

  if (parsedAmount > maxAmount) {
    return { isValid: false, error: "Amount exceeds amount due" };
  }

  return { isValid: true };
}
