import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Wallet } from "lucide-react";
import { toast } from "sonner";
import { useFnbStore } from "@/store/fnb/fnb.store";

interface Props {
  orderId: string;
  onClose: () => void;
}

const PAYMENT_METHODS = [
  { value: "CASH", label: "Cash", icon: "💵" },
  { value: "CREDIT_CARD", label: "Credit Card", icon: "💳" },
  { value: "DEBIT_CARD", label: "Debit Card", icon: "💳" },
  { value: "ROOM_CHARGE", label: "Room Charge", icon: "🏨" },
  { value: "BANK_TRANSFER", label: "Bank Transfer", icon: "🏦" },
];

export function PaymentModal({ orderId, onClose }: Props) {
  const { activeOrder, fetchOrderById, processPayment } = useFnbStore();
  const [method, setMethod] = useState("CASH");
  const [amountTendered, setAmountTendered] = useState("");
  const [reference, setReference] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchOrderById(orderId);
  }, [orderId]);

  if (!activeOrder) return null;

  const totalAmount = Number(activeOrder.totalAmount);
  const amountPaid = Number(activeOrder.totalAmount);
  const remaining = totalAmount - amountPaid;
  const tendered = parseFloat(amountTendered || "0");
  const change = Math.max(0, tendered - remaining);

  const handleProcess = async () => {
    if (tendered < remaining) {
      toast.error("Amount tendered is less than the balance due");
      return;
    }

    setIsProcessing(true);
    try {
      await processPayment(orderId, {
        method,
        amount: Math.min(tendered, remaining),
        reference,
      });
      toast.success("Payment processed successfully!");
      onClose();
    } catch {
      toast.error("Payment failed");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-green-600" />
            Process Payment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Amount Summary */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Order Total</span>
              <span>${totalAmount.toFixed(2)}</span>
            </div>
            {amountPaid > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Amount Paid</span>
                <span className="text-green-600">${amountPaid.toFixed(2)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Balance Due</span>
              <span className="text-primary">${remaining.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label>Payment Method</Label>
            <div className="grid grid-cols-3 gap-2">
              {PAYMENT_METHODS.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setMethod(m.value)}
                  className={`flex flex-col items-center p-3 rounded-lg border-2 transition-colors text-sm font-medium ${
                    method === m.value
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border hover:border-muted-foreground"
                  }`}
                >
                  <span className="text-xl mb-1">{m.icon}</span>
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Amount Tendered */}
          <div className="space-y-2">
            <Label>Amount Tendered</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-muted-foreground">
                $
              </span>
              <Input
                type="number"
                placeholder="0.00"
                className="pl-7"
                value={amountTendered}
                onChange={(e) => setAmountTendered(e.target.value)}
              />
            </div>
            {/* Quick amount buttons */}
            <div className="flex gap-2 flex-wrap">
              {[
                remaining,
                Math.ceil(remaining / 10) * 10,
                Math.ceil(remaining / 50) * 50,
              ].map((amt, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => setAmountTendered(amt.toFixed(2))}
                >
                  ${amt.toFixed(2)}
                </Button>
              ))}
            </div>
          </div>

          {/* Reference */}
          {method !== "CASH" && (
            <div className="space-y-2">
              <Label>Reference / Transaction ID</Label>
              <Input
                placeholder="e.g. last 4 digits, transaction ID"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />
            </div>
          )}

          {/* Change */}
          {change > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-green-700">
                <Wallet className="h-4 w-4" />
                <span className="font-semibold">Change to give</span>
              </div>
              <span className="text-xl font-bold text-green-700">
                ${change.toFixed(2)}
              </span>
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleProcess}
              disabled={isProcessing || tendered < remaining}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              {isProcessing
                ? "Processing..."
                : `Collect $${Math.min(tendered, remaining).toFixed(2)}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
