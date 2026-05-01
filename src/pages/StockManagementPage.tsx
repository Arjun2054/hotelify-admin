import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Minus, FileText } from "lucide-react";
import { StockInDialog } from "../components/StockInDialog";
import { StockOutDialog } from "../components/StockOutDialog";
import { StockSummaryCards } from "../components/StockSummaryCards";
import { useStockStore } from "../store/stockStore";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import StockMovementsTable from "@/components/stock/StockMovementsTable";

export default function StockManagement() {
  const navigate = useNavigate();

  const [stockInOpen, setStockInOpen] = useState(false);
  const [stockOutOpen, setStockOutOpen] = useState(false);

  const { summary, loading, fetchSummary, fetchMovements, stockIn, stockOut } =
    useStockStore();

  useEffect(() => {
    fetchSummary();
    fetchMovements();
  }, []);

  const handleStockIn = async (data: any) => {
    try {
      await stockIn(data);
      toast.success("Stock added successfully");
      setStockInOpen(false);
    } catch (error) {
      toast.error("Failed to add stock");
      throw error;
    }
  };

  const handleStockOut = async (data: any) => {
    try {
      await stockOut(data);
      toast.success("Stock removed successfully");
      setStockOutOpen(false);
    } catch (error) {
      toast.error("Failed to remove stock");
      throw error;
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Stock Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Track and manage inventory stock movements
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard/stock/reports")}
            className="flex-1 sm:flex-none"
          >
            <FileText className="mr-2 h-4 w-4" />
            Reports
          </Button>
          <Button
            variant="outline"
            onClick={() => setStockOutOpen(true)}
            className="flex-1 sm:flex-none"
          >
            <Minus className="mr-2 h-4 w-4" />
            Stock Out
          </Button>
          <Button
            onClick={() => setStockInOpen(true)}
            className="flex-1 sm:flex-none"
          >
            <Plus className="mr-2 h-4 w-4" />
            Stock In
          </Button>
        </div>
      </div>

      <StockSummaryCards summary={summary} loading={loading} />

      <div>
        <h2 className="text-xl font-semibold mb-4">Stock Movements</h2>
        <StockMovementsTable />
      </div>

      <StockInDialog
        open={stockInOpen}
        onOpenChange={setStockInOpen}
        onSubmit={handleStockIn}
        loading={loading}
      />

      <StockOutDialog
        open={stockOutOpen}
        onOpenChange={setStockOutOpen}
        onSubmit={handleStockOut}
        loading={loading}
      />
    </div>
  );
}
