import { useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { LinkedRoomBadge } from "@/components/shared/LinkedRoomBadge";
import { LinkedTaskBadge } from "@/components/shared/LinkedTaskBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Package,
  DollarSign,
  AlertTriangle,
  BedDouble,
  ClipboardList,
  ArrowRightLeft,
  ExternalLink,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useHotelItemStore } from "@/store/hotel/useHotelItemStore";
import { StockMovementHistory } from "@/components/hotel-items/StockMovementHistory";

export default function HotelItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    selectedItem,
    isLoading,
    fetchItemById,
    movementSummary,
    fetchMovementSummary,
  } = useHotelItemStore();

  useEffect(() => {
    if (id) {
      fetchItemById(id);
      fetchMovementSummary(id);
    }
  }, [id]);

  const item = selectedItem;

  if (isLoading || !item) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  const stockPercentage = item.reorderPoint
    ? Math.min((item.stockQuantity / (item.reorderPoint * 2)) * 100, 100)
    : 50;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/hotel-items")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{item.name}</h1>
            <Badge
              variant={item.isActive ? "default" : "secondary"}
              className={item.isActive ? "bg-emerald-100 text-emerald-800" : ""}
            >
              {item.isActive ? "Active" : "Inactive"}
            </Badge>
            {item.isLowStock && (
              <Badge
                variant="outline"
                className="bg-amber-50 text-amber-700 border-amber-200"
              >
                <AlertTriangle className="mr-1 h-3 w-3" /> Low Stock
              </Badge>
            )}
            {item.isOutOfStock && (
              <Badge
                variant="outline"
                className="bg-red-50 text-red-700 border-red-200"
              >
                <AlertTriangle className="mr-1 h-3 w-3" /> Out of Stock
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-1">
            {item.category.name} · {item.unit.name} ({item.unit.abbreviation})
            {item.sku && ` · SKU: ${item.sku}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Link to={`/stock-movements?hotelItemId=${item.id}`}>
            <Button variant="outline">
              <ArrowRightLeft className="mr-2 h-4 w-4" /> Stock History
            </Button>
          </Link>
          <Link to={`/housekeeping?itemId=${item.id}`}>
            <Button variant="outline">
              <ClipboardList className="mr-2 h-4 w-4" /> Usage History
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Current Stock</p>
                <p
                  className={`text-xl font-bold ${item.isOutOfStock ? "text-red-600" : item.isLowStock ? "text-amber-600" : "text-emerald-600"}`}
                >
                  {item.stockQuantity}{" "}
                  <span className="text-sm font-normal">
                    {item.unit.abbreviation}
                  </span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-50">
                <DollarSign className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Stock Value</p>
                <p className="text-xl font-bold">
                  {formatCurrency(item.stockValue)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-50">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Reorder Point</p>
                <p className="text-xl font-bold">
                  {item.reorderPoint}{" "}
                  <span className="text-sm font-normal">
                    {item.unit.abbreviation}
                  </span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-violet-50">
                <DollarSign className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Cost Price</p>
                <p className="text-xl font-bold">
                  {formatCurrency(item.costPrice)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stock Level Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Stock Level</span>
            <span className="text-sm text-muted-foreground">
              Min: {item.minimumStock} / Reorder: {item.reorderPoint}
            </span>
          </div>
          <Progress
            value={stockPercentage}
            className={`h-3 ${item.isOutOfStock ? "[&>div]:bg-red-500" : item.isLowStock ? "[&>div]:bg-amber-500" : "[&>div]:bg-emerald-500"}`}
          />
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="movements" className="space-y-4">
        <TabsList>
          <TabsTrigger value="movements" className="gap-1.5">
            <ArrowRightLeft className="h-4 w-4" /> Stock Movements
          </TabsTrigger>
          <TabsTrigger value="rooms" className="gap-1.5">
            <BedDouble className="h-4 w-4" /> Assigned Rooms
            {item.roomItems && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {item.roomItems.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="housekeeping" className="gap-1.5">
            <ClipboardList className="h-4 w-4" /> Housekeeping Usage
          </TabsTrigger>
        </TabsList>

        {/* Stock Movements */}
        <TabsContent value="movements">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">
                Recent Stock Movements
              </CardTitle>
              <Link to={`/stock-movements?hotelItemId=${item.id}`}>
                <Button variant="outline" size="sm">
                  <ExternalLink className="mr-1 h-3.5 w-3.5" /> View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <StockMovementHistory itemId={item.id} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Room Assignments */}
        <TabsContent value="rooms">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Rooms Using This Item</CardTitle>
              <Link to="/rooms">
                <Button variant="outline" size="sm">
                  <BedDouble className="mr-1 h-3.5 w-3.5" /> Room Inventory
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {item.roomItems && item.roomItems.length > 0 ? (
                <div className="space-y-2">
                  {item.roomItems.map((ri) => (
                    <div
                      key={ri.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <LinkedRoomBadge
                        roomId={ri.room.id}
                        roomNumber={ri.room.roomNumber}
                        floor={ri.room.floor}
                      />
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {ri.standardQty} {item.unit.abbreviation}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          per cleaning
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Not assigned to any rooms.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Housekeeping Usage */}
        <TabsContent value="housekeeping">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Housekeeping Usage</CardTitle>
              <Link to={`/housekeeping`}>
                <Button variant="outline" size="sm">
                  <ClipboardList className="mr-1 h-3.5 w-3.5" /> All Tasks
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {movementSummary && movementSummary.itemId === item.id ? (
                <div className="space-y-4">
                  {/* Summary grid */}
                  <div className="grid grid-cols-3 gap-3">
                    {Object.entries(movementSummary.movements).map(
                      ([type, data]) => (
                        <div
                          key={type}
                          className="text-center p-3 rounded-lg border"
                        >
                          <p className="text-xs text-muted-foreground">
                            {type.replace("_", " ")}
                          </p>
                          <p className="text-lg font-bold">
                            {data.totalQuantity}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {data.count} records
                          </p>
                        </div>
                      ),
                    )}
                  </div>

                  {/* Recent housekeeping-related movements */}
                  {item.hotelStockMovements?.filter(
                    (m) => m.referenceType === "HOUSEKEEPING",
                  ).length ? (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">
                        Recent Housekeeping Deductions
                      </h4>
                      {item.hotelStockMovements
                        .filter((m) => m.referenceType === "HOUSEKEEPING")
                        .slice(0, 5)
                        .map((m) => (
                          <Link
                            key={m.id}
                            to={`/housekeeping?highlight=${m.referenceId}`}
                            className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                          >
                            <div>
                              <p className="text-sm">{m.notes}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(m.createdAt)} · by {m.user?.name}
                              </p>
                            </div>
                            <Badge
                              variant="outline"
                              className="bg-red-50 text-red-700"
                            >
                              -{m.quantity} {item.unit.abbreviation}
                            </Badge>
                          </Link>
                        ))}
                    </div>
                  ) : (
                    <p className="py-4 text-center text-sm text-muted-foreground">
                      No housekeeping usage recorded yet.
                    </p>
                  )}
                </div>
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Loading usage data...
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
