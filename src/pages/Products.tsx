import { ProductTable } from "@/components/ProductTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ProductListPage() {
  const navigate = useNavigate();

  return (
    <div className="p-5 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Products
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Manage your product inventory
          </p>
        </div>
        <Button
          onClick={() => navigate("/dashboard/products/new")}
          className="sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <ProductTable />
    </div>
  );
}
