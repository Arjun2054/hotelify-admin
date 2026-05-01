import { StockMovementDetails } from "@/components/stock/Stockmovementdetails";
import { StockMovementDialog } from "@/components/stock/Stockmovementdialog";
import { StockMovementTable } from "@/components/stock/Stockmovementtable";
import { SummaryCards } from "@/components/stock/Summarycards";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCategoryStore } from "@/store/categoryStore";
import { useProductStore } from "@/store/productStore";
import { useStockMovementStore } from "@/store/stock-movement.store";
import { useSupplierStore } from "@/store/supplierStore";
import { MovementType, type StockMovement } from "@/types/stock-movement.types";
import { Minus, Plus, TrendingUp, BarChart3 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const StockMovementPage = () => {
  const [stockInDialogOpen, setStockInDialogOpen] = useState(false);
  const [stockOutDialogOpen, setStockOutDialogOpen] = useState(false);
  const [selectedMovement, setSelectedMovement] =
    useState<StockMovement | null>(null);
  const {
    movements,
    dashboardSummary,
    isLoading,
    fetchMovements,
    fetchDashboardSummary,
    deleteMovement,
    reset,
  } = useStockMovementStore();

  const { products, fetchProducts } = useProductStore();

  const { suppliers, fetchSuppliers } = useSupplierStore();
  const { categories, fetchCategories } = useCategoryStore();

  useEffect(() => {
    // Initial data fetch
    fetchMovements();
    fetchDashboardSummary();
    fetchSuppliers();
    fetchCategories();
    fetchProducts();

    // Cleanup on unmount
    return () => reset();
  }, []);

  const handleViewDetails = (movement: StockMovement) => {
    setSelectedMovement(movement);
  };

  const handleDelete = async (id: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this stock movement? This will revert the stock quantity.",
      )
    ) {
      return;
    }

    try {
      await deleteMovement(id);
      toast.success("Stock movement deleted successfully");
    } catch (error: any) {
      toast.error("Failed to delete stock movement");
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
            Stock Movement
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Track and manage all stock in and out transactions
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
          <Button
            onClick={() => setStockInDialogOpen(true)}
            className="w-full sm:w-auto"
            size="default"
          >
            <Plus className="mr-2 h-4 w-4" />
            Stock In
          </Button>
          <Button
            variant="outline"
            onClick={() => setStockOutDialogOpen(true)}
            className="w-full sm:w-auto"
            size="default"
          >
            <Minus className="mr-2 h-4 w-4" />
            Stock Out
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <SummaryCards summary={dashboardSummary} isLoading={isLoading} />

      {/* Tabs */}
      <Tabs defaultValue="movements" className="space-y-4">
        {/* Tabs List - Scrollable on mobile */}
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className="inline-flex w-auto min-w-full sm:min-w-0">
            <TabsTrigger value="movements" className="flex-1 sm:flex-none">
              <span className="hidden sm:inline">All Movements</span>
              <span className="sm:hidden">Movements</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex-1 sm:flex-none">
              <BarChart3 className="mr-2 h-4 w-4 sm:hidden" />
              Analytics
            </TabsTrigger>
          </TabsList>
        </div>

        {/* All Movements Tab */}
        <TabsContent value="movements" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="px-4 sm:px-6 py-4 sm:py-5">
              <CardTitle className="text-lg sm:text-xl">
                Stock Movement History
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
              <StockMovementTable
                movements={movements}
                isLoading={isLoading}
                categories={categories}
                suppliers={suppliers}
                onViewDetails={handleViewDetails}
                onDelete={handleDelete}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4 mt-4">
          {/* Top Products & Movements by Type Grid */}
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Top Products */}
            <Card>
              <CardHeader className="px-4 sm:px-6 py-4 sm:py-5">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="truncate">Top Products by Movement</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                {dashboardSummary?.topProducts.length ? (
                  <div className="space-y-3 sm:space-y-4">
                    {dashboardSummary.topProducts.map((product, index) => (
                      <div
                        key={product.productId}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm sm:text-base font-bold text-primary">
                            #{index + 1}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm sm:text-base truncate">
                            {product.productName}
                          </p>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {product.totalMovements} movements •{" "}
                            {product.totalQuantity} units
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8 sm:py-12">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p className="text-sm sm:text-base">No data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Movements by Type */}
            <Card>
              <CardHeader className="px-4 sm:px-6 py-4 sm:py-5">
                <CardTitle className="text-lg sm:text-xl">
                  Movements by Transaction Type
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                {dashboardSummary?.movementsByType.length ? (
                  <div className="space-y-3 sm:space-y-4">
                    {dashboardSummary.movementsByType.map((item) => (
                      <div
                        key={item.type}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm sm:text-base truncate">
                            {item.type}
                          </p>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {item.totalQuantity.toLocaleString()} units
                          </p>
                        </div>
                        <div className="shrink-0 ml-4">
                          <div className="text-xl sm:text-2xl font-bold">
                            {item.count}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8 sm:py-12">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p className="text-sm sm:text-base">No data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Movements */}
          <Card>
            <CardHeader className="px-4 sm:px-6 py-4 sm:py-5">
              <CardTitle className="text-lg sm:text-xl">
                Recent Movements
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
              {dashboardSummary?.recentMovements.length ? (
                <div className="space-y-2">
                  {dashboardSummary.recentMovements.map((movement) => (
                    <div
                      key={movement.stockMovementId}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 p-3 sm:p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => handleViewDetails(movement)}
                    >
                      <div className="flex-1 min-w-0 space-y-1">
                        <p className="font-medium text-sm sm:text-base truncate">
                          {movement.product.name}
                        </p>
                        <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
                          <span className="font-medium">
                            {movement.movementType}
                          </span>
                          <span className="hidden sm:inline">•</span>
                          <span className="truncate">
                            {movement.transactionType}
                          </span>
                          <span className="hidden sm:inline">•</span>
                          <span className="whitespace-nowrap">
                            {movement.quantity} units
                          </span>
                        </div>
                      </div>
                      <div className="shrink-0">
                        <p className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                          {new Date(movement.createdAt).toLocaleDateString(
                            undefined,
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8 sm:py-12">
                  <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p className="text-sm sm:text-base">No recent movements</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <StockMovementDialog
        open={stockInDialogOpen}
        onOpenChange={setStockInDialogOpen}
        movementType={MovementType.IN}
        products={products}
      />

      <StockMovementDialog
        open={stockOutDialogOpen}
        onOpenChange={setStockOutDialogOpen}
        movementType={MovementType.OUT}
        products={products}
      />

      {/* Details Modal */}
      {selectedMovement && (
        <StockMovementDetails
          movement={selectedMovement}
          onClose={() => setSelectedMovement(null)}
        />
      )}
    </div>
  );
};

export default StockMovementPage;
