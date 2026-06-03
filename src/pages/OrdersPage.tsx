import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChefHat,
  CreditCard,
  Eye,
  RefreshCw,
  Search,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { useFnbStore } from "@/store/fnb/fnb.store";
import { OrderDetailModal } from "@/components/fnb/orders/OrderDetailModal";
import { PaymentModal } from "@/components/fnb/orders/PaymentModal";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
  CONFIRMED: "bg-blue-100 text-blue-800 border-blue-200",
  PREPARING: "bg-orange-100 text-orange-800 border-orange-200",
  READY: "bg-green-100 text-green-800 border-green-200",
  SERVED: "bg-teal-100 text-teal-800 border-teal-200",
  COMPLETED: "bg-gray-100 text-gray-800 border-gray-200",
  CANCELLED: "bg-red-100 text-red-800 border-red-200",
};

const PAYMENT_COLORS: Record<string, string> = {
  UNPAID: "bg-red-100 text-red-700",
  PARTIAL: "bg-yellow-100 text-yellow-700",
  PAID: "bg-green-100 text-green-700",
};

export default function OrdersPage() {
  const {
    orders,
    isOrderLoading,
    orderFilters,
    setOrderFilters,
    fetchOrders,
    sendToKitchen,
    cancelOrder,
  } = useFnbStore();

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [paymentOrderId, setPaymentOrderId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("ALL");

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [orderFilters]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setOrderFilters(tab === "ALL" ? {} : { status: tab });
  };

  const handleSendToKitchen = async (id: string) => {
    try {
      await sendToKitchen(id);
      toast.success("Sent to kitchen!");
    } catch {
      toast.error("Failed to send to kitchen");
    }
  };

  const filteredOrders = orders.filter((o) =>
    search
      ? o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        o.customerName?.toLowerCase().includes(search.toLowerCase())
      : true,
  );

  const tabs = [
    "ALL",
    "PENDING",
    "CONFIRMED",
    "PREPARING",
    "READY",
    "SERVED",
    "COMPLETED",
    "CANCELLED",
  ];

  return (
    <div className="flex flex-col h-full gap-4 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground text-sm">
            Manage and track all food & beverage orders
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchOrders}
          disabled={isOrderLoading}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isOrderLoading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          onValueChange={(v) => setOrderFilters({ ...orderFilters, type: v })}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Order Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="DINE_IN">Dine In</SelectItem>
            <SelectItem value="TAKEAWAY">Takeaway</SelectItem>
            <SelectItem value="ROOM_SERVICE">Room Service</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="flex-wrap h-auto gap-1">
          {tabs.map((tab) => (
            <TabsTrigger key={tab} value={tab} className="text-xs">
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Table</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isOrderLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          {Array.from({ length: 10 }).map((_, j) => (
                            <TableCell key={j}>
                              <div className="h-4 bg-muted animate-pulse rounded" />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : filteredOrders.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={10}
                          className="text-center py-12 text-muted-foreground"
                        >
                          No orders found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredOrders.map((order) => (
                        <TableRow key={order.id} className="hover:bg-muted/50">
                          <TableCell className="font-mono text-sm font-semibold">
                            {order.orderNumber}
                          </TableCell>
                          <TableCell>
                            {order.customerName ?? (
                              <span className="text-muted-foreground italic">
                                Guest
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            {order.table?.tableNumber ?? (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {order.type.replace("_", " ")}
                            </Badge>
                          </TableCell>
                          <TableCell>{order.items.length} items</TableCell>
                          <TableCell className="font-semibold">
                            ${Number(order.totalAmount).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                                STATUS_COLORS[order.status] ?? ""
                              }`}
                            >
                              {order.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                PAYMENT_COLORS[order.paymentStatus] ?? ""
                              }`}
                            >
                              {order.paymentStatus}
                            </span>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-xs">
                            {formatDistanceToNow(new Date(order.orderedAt), {
                              addSuffix: true,
                            })}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setSelectedOrderId(order.id)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {order.status === "PENDING" && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-orange-600"
                                  onClick={() => handleSendToKitchen(order.id)}
                                  title="Send to Kitchen"
                                >
                                  <ChefHat className="h-4 w-4" />
                                </Button>
                              )}
                              {(order.status === "SERVED" ||
                                order.status === "READY") &&
                                order.paymentStatus !== "PAID" && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-green-600"
                                    onClick={() => setPaymentOrderId(order.id)}
                                    title="Process Payment"
                                  >
                                    <CreditCard className="h-4 w-4" />
                                  </Button>
                                )}
                              {["PENDING", "CONFIRMED"].includes(
                                order.status,
                              ) && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-600"
                                  onClick={() =>
                                    cancelOrder(order.id, "Cancelled by staff")
                                  }
                                  title="Cancel Order"
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {selectedOrderId && (
        <OrderDetailModal
          orderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
        />
      )}
      {paymentOrderId && (
        <PaymentModal
          orderId={paymentOrderId}
          onClose={() => setPaymentOrderId(null)}
        />
      )}
    </div>
  );
}
