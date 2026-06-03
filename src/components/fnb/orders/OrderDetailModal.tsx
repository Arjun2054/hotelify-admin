import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChefHat, Clock, MapPin, User } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useFnbStore } from "@/store/fnb/fnb.store";

interface Props {
  orderId: string;
  onClose: () => void;
}

export function OrderDetailModal({ orderId, onClose }: Props) {
  const { activeOrder, fetchOrderById, sendToKitchen, updateOrderStatus } =
    useFnbStore();

  useEffect(() => {
    fetchOrderById(orderId);
  }, [orderId]);

  const handleSendToKitchen = async () => {
    try {
      await sendToKitchen(orderId);
      toast.success("Order sent to kitchen!");
      await fetchOrderById(orderId);
    } catch {
      toast.error("Failed to send to kitchen");
    }
  };

  const handleStatusUpdate = async (status: string) => {
    try {
      await updateOrderStatus(orderId, status);
      toast.success(`Order marked as ${status}`);
      await fetchOrderById(orderId);
    } catch {
      toast.error("Failed to update status");
    }
  };

  if (!activeOrder) return null;

  const subtotal = activeOrder.items.reduce(
    (sum: number, i: any) => sum + Number(i.totalPrice),
    0,
  );

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="font-mono text-lg">{activeOrder.orderNumber}</span>
            <Badge
              variant="outline"
              className={
                activeOrder.status === "PENDING"
                  ? "border-yellow-400 text-yellow-700"
                  : "border-green-400 text-green-700"
              }
            >
              {activeOrder.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1">
          <div className="space-y-4 pr-4">
            {/* Order Info */}
            <div className="grid grid-cols-2 gap-4 bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Customer:</span>
                <span className="font-medium">
                  {activeOrder.customerName ?? "Guest"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Table:</span>
                <span className="font-medium">
                  {(activeOrder as any).table?.tableNumber ?? "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Ordered:</span>
                <span className="font-medium">
                  {format(new Date(activeOrder.orderedAt as string), "HH:mm")}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Type:</span>
                <Badge variant="outline">
                  {(activeOrder as any).type?.replace("_", " ")}
                </Badge>
              </div>
            </div>

            <Separator />

            {/* Order Items */}
            <div>
              <h3 className="font-semibold mb-3">
                Items ({activeOrder.items.length})
              </h3>
              <div className="space-y-2">
                {activeOrder.items.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between gap-4 p-3 rounded-lg border"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">
                          ×{item.quantity}
                        </span>
                        <span className="font-medium">{item.itemName}</span>
                        <Badge variant="outline" className="text-xs">
                          {item.status}
                        </Badge>
                      </div>
                      {item.specialInstructions && (
                        <p className="text-muted-foreground text-xs mt-1 italic">
                          Note: {item.specialInstructions}
                        </p>
                      )}
                    </div>
                    <span className="font-semibold text-sm">
                      ${Number(item.totalPrice).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Totals */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax (10%)</span>
                <span>
                  ${Number((activeOrder as any).taxAmount ?? 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Service (5%)</span>
                <span>
                  ${Number((activeOrder as any).serviceCharge ?? 0).toFixed(2)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>${Number(activeOrder.totalAmount).toFixed(2)}</span>
              </div>
            </div>

            {/* Status History */}
            {(activeOrder as any).statusHistory?.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-3">Status History</h3>
                  <div className="space-y-2">
                    {(activeOrder as any).statusHistory.map((h: any) => (
                      <div
                        key={h.id}
                        className="flex items-center gap-3 text-sm text-muted-foreground"
                      >
                        <span className="text-xs">
                          {format(new Date(h.changedAt), "HH:mm")}
                        </span>
                        <span className="font-medium text-foreground">
                          → {h.toStatus}
                        </span>
                        {h.changedByUser?.name && (
                          <span>by {h.changedByUser.name}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          {activeOrder.status === "PENDING" && (
            <Button
              onClick={handleSendToKitchen}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
            >
              <ChefHat className="h-4 w-4 mr-2" />
              Send to Kitchen
            </Button>
          )}
          {activeOrder.status === "READY" && (
            <Button
              onClick={() => handleStatusUpdate("SERVED")}
              className="flex-1 bg-teal-500 hover:bg-teal-600 text-white"
            >
              Mark as Served
            </Button>
          )}
          <Button variant="outline" onClick={onClose} className="flex-1">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
