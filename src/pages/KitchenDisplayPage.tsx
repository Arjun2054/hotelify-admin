import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle2,
  ChefHat,
  Clock,
  Flame,
  RefreshCw,
  Timer,
} from "lucide-react";
import { formatDistanceToNow, differenceInMinutes } from "date-fns";
import { toast } from "sonner";
import { useFnbStore } from "@/store/fnb/fnb.store";

const PRIORITY_COLORS: Record<string, string> = {
  LOW: "border-l-gray-400",
  NORMAL: "border-l-blue-400",
  HIGH: "border-l-orange-400",
  URGENT: "border-l-red-500",
};

const TICKET_STATUS_CONFIG: Record<
  string,
  { label: string; color: string; next: string; nextLabel: string }
> = {
  OPEN: {
    label: "Waiting",
    color: "bg-yellow-100 text-yellow-800",
    next: "IN_PROGRESS",
    nextLabel: "Start Cooking",
  },
  IN_PROGRESS: {
    label: "Cooking",
    color: "bg-orange-100 text-orange-800",
    next: "READY",
    nextLabel: "Mark Ready",
  },
  READY: {
    label: "Ready!",
    color: "bg-green-100 text-green-800",
    next: "CLOSED",
    nextLabel: "Close",
  },
  CLOSED: {
    label: "Closed",
    color: "bg-gray-100 text-gray-600",
    next: "",
    nextLabel: "",
  },
};

export default function KitchenDisplayPage() {
  const {
    kitchenTickets,
    recentlyCompleted,
    stations,
    isKitchenLoading,
    selectedStationId,
    setSelectedStation,
    fetchKDSDashboard,
    updateTicketStatus,
    updateTicketItemStatus,
  } = useFnbStore();

  const [expandedTickets, setExpandedTickets] = useState<Set<string>>(
    new Set(),
  );

  useEffect(() => {
    fetchKDSDashboard();
    const interval = setInterval(fetchKDSDashboard, 15000);
    return () => clearInterval(interval);
  }, [selectedStationId]);

  const handleTicketAction = async (id: string, nextStatus: string) => {
    if (!nextStatus) return;
    try {
      await updateTicketStatus(id, nextStatus);
      toast.success(
        `Ticket ${nextStatus === "IN_PROGRESS" ? "started" : nextStatus === "READY" ? "marked ready" : "closed"}!`,
      );
    } catch {
      toast.error("Failed to update ticket");
    }
  };

  const handleItemAction = async (id: string, status: string) => {
    try {
      await updateTicketItemStatus(
        id,
        status === "SENT" ? "PREPARING" : "READY",
      );
      toast.success("Item updated");
    } catch {
      toast.error("Failed to update item");
    }
  };

  const toggleTicket = (id: string) => {
    setExpandedTickets((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getElapsedMinutes = (receivedAt: string) =>
    differenceInMinutes(new Date(), new Date(receivedAt));

  return (
    <div className="flex flex-col h-full bg-gray-950 text-white min-h-screen">
      {/* KDS Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <ChefHat className="h-7 w-7 text-orange-400" />
          <div>
            <h1 className="text-xl font-bold">Kitchen Display System</h1>
            <p className="text-gray-400 text-sm">
              {kitchenTickets.length} active ticket
              {kitchenTickets.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Station Filter */}
          <Select
            value={selectedStationId ?? "all"}
            onValueChange={(v) => setSelectedStation(v === "all" ? null : v)}
          >
            <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="All Stations" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="all">All Stations</SelectItem>
              {(stations as any[]).map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                  {s._count.tickets > 0 && (
                    <Badge className="ml-2 bg-orange-500 text-white text-xs">
                      {s._count.tickets}
                    </Badge>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchKDSDashboard}
            disabled={isKitchenLoading}
            className="border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            <RefreshCw
              className={`h-4 w-4 ${isKitchenLoading ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </div>

      {/* Main KDS Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {kitchenTickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <ChefHat className="h-16 w-16 mb-4 opacity-30" />
            <p className="text-xl">No active tickets</p>
            <p className="text-sm">Kitchen is clear!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            {kitchenTickets.map((ticket) => {
              const elapsed = getElapsedMinutes(ticket.receivedAt);
              const isUrgent = elapsed > 20;
              const isWarning = elapsed > 10 && !isUrgent;
              const config = TICKET_STATUS_CONFIG[ticket.status];
              const isExpanded = expandedTickets.has(ticket.id);

              return (
                <Card
                  key={ticket.id}
                  className={`bg-gray-900 border-gray-800 border-l-4 ${PRIORITY_COLORS[ticket.priority]} ${
                    isUrgent ? "ring-2 ring-red-500 ring-opacity-50" : ""
                  }`}
                >
                  {/* Ticket Header */}
                  <CardHeader className="pb-2 pt-3 px-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-lg font-bold text-white">
                            {ticket.ticketNumber}
                          </span>
                          {ticket.order.table && (
                            <Badge className="bg-blue-600 text-white text-xs">
                              Table {ticket.order.table.tableNumber}
                            </Badge>
                          )}
                          {ticket.order.type === "ROOM_SERVICE" && (
                            <Badge className="bg-purple-600 text-white text-xs">
                              Room Service
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-400 text-xs mt-0.5">
                          {ticket.order.orderNumber}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${config.color}`}
                        >
                          {config.label}
                        </span>
                        <div
                          className={`flex items-center gap-1 text-xs font-semibold ${
                            isUrgent
                              ? "text-red-400"
                              : isWarning
                                ? "text-yellow-400"
                                : "text-gray-400"
                          }`}
                        >
                          {isUrgent ? (
                            <Flame className="h-3 w-3" />
                          ) : (
                            <Timer className="h-3 w-3" />
                          )}
                          {elapsed}m
                        </div>
                      </div>
                    </div>

                    {ticket.kitchenStation && (
                      <div
                        className="mt-1 text-xs font-medium px-2 py-0.5 rounded inline-block"
                        style={{
                          backgroundColor:
                            ticket.kitchenStation.displayColor ?? "#374151",
                          color: "white",
                        }}
                      >
                        {ticket.kitchenStation.name}
                      </div>
                    )}
                  </CardHeader>

                  <CardContent className="px-4 pb-4">
                    {/* Items */}
                    <div className="space-y-2 mb-4">
                      {ticket.items
                        .slice(0, isExpanded ? undefined : 3)
                        .map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between gap-2 bg-gray-800 rounded-lg p-2"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white text-sm">
                                  ×{item.quantity}
                                </span>
                                <span className="text-white text-sm truncate">
                                  {item.orderItem.menuItem.name}
                                </span>
                              </div>
                              {item.orderItem.specialInstructions && (
                                <p className="text-yellow-400 text-xs mt-0.5 italic">
                                  ⚠ {item.orderItem.specialInstructions}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() =>
                                handleItemAction(item.id, item.status)
                              }
                              className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                                item.status === "READY"
                                  ? "bg-green-500 border-green-500"
                                  : item.status === "PREPARING"
                                    ? "border-orange-400 bg-orange-400/20"
                                    : "border-gray-600 hover:border-gray-400"
                              }`}
                            >
                              {item.status === "READY" && (
                                <CheckCircle2 className="h-4 w-4 text-white" />
                              )}
                            </button>
                          </div>
                        ))}

                      {ticket.items.length > 3 && (
                        <button
                          onClick={() => toggleTicket(ticket.id)}
                          className="text-gray-400 text-xs hover:text-white w-full text-center"
                        >
                          {isExpanded
                            ? "Show less"
                            : `+${ticket.items.length - 3} more items`}
                        </button>
                      )}
                    </div>

                    {/* Action Button */}
                    {config.next && (
                      <Button
                        className={`w-full text-sm font-semibold ${
                          config.next === "IN_PROGRESS"
                            ? "bg-orange-500 hover:bg-orange-600 text-white"
                            : config.next === "READY"
                              ? "bg-green-500 hover:bg-green-600 text-white"
                              : "bg-gray-600 hover:bg-gray-700 text-white"
                        }`}
                        onClick={() =>
                          handleTicketAction(ticket.id, config.next)
                        }
                      >
                        {config.next === "IN_PROGRESS" && (
                          <Flame className="h-4 w-4 mr-2" />
                        )}
                        {config.next === "READY" && (
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                        )}
                        {config.nextLabel}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Recently Completed Bar */}
      {recentlyCompleted.length > 0 && (
        <div className="bg-gray-900 border-t border-gray-800 px-6 py-3">
          <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">
            Recently Completed
          </p>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {recentlyCompleted.map((t) => (
              <div
                key={t.id}
                className="flex-shrink-0 bg-green-900/30 border border-green-800 rounded-lg px-3 py-1.5 flex items-center gap-2"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
                <span className="font-mono text-xs text-green-300">
                  {t.ticketNumber}
                </span>
                {t.order.table && (
                  <span className="text-gray-400 text-xs">
                    T{t.order.table.tableNumber}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
