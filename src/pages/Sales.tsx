import { SaleDialog } from "@/components/SaleDialog";
import { SalesTable } from "@/components/SalesTable";
import { Button } from "@/components/ui/button";
import { useSalesStore } from "@/store/salesStore";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const Sales = () => {
  const [salesOpen, setSalesOpen] = useState(false);
  const { loading, createSale } = useSalesStore();

  const handleSales = async (data: any) => {
    try {
      await createSale(data);
      toast.success("Stock added successfully");
      setSalesOpen(false);
    } catch (error) {
      toast.error("Failed to add stock");
      throw error;
    }
  };
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Sales Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your sales and revenue
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => setSalesOpen(true)}
            className="flex-1 sm:flex-none"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Sales
          </Button>
        </div>
      </div>

      <div>
        <SalesTable />
      </div>

      <SaleDialog
        open={salesOpen}
        onOpenChange={setSalesOpen}
        onSubmit={handleSales}
        loading={loading}
      />
    </div>
  );
};

export default Sales;
