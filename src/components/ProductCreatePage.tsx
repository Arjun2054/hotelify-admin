import { useNavigate } from "react-router-dom";
import { useProductStore } from "../store/productStore";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { ProductForm } from "./ProductForm";

export default function ProductCreatePage() {
  const navigate = useNavigate();
  const { createProduct, loading } = useProductStore();

  const handleSubmit = async (data: any) => {
    try {
      console.log(data);
      await createProduct(data);
      toast.success("Product created successfully");
      navigate("/dashboard/products");
    } catch (error) {
      toast.error("Failed to create product");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Product</h1>
        <p className="text-muted-foreground mt-1">
          Add a new product to your inventory
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
          <CardDescription>
            Fill in the information below to create a new product
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProductForm
            onSubmit={handleSubmit}
            isLoading={loading}
            submitText="Create Product"
          />
        </CardContent>
      </Card>
    </div>
  );
}
