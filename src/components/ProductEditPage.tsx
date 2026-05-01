import { useEffect } from "react";
import { useProductStore } from "../store/productStore";
import { ProductForm } from "../components/ProductForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";

export default function ProductEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { selectedProduct, loading, error, fetchProductById, updateProduct } =
    useProductStore();

  useEffect(() => {
    if (id) {
      fetchProductById(id);
    }
  }, [id, fetchProductById]);

  const handleSubmit = async (data: any) => {
    if (!id) return;

    try {
      await updateProduct(id, data);
      toast.success("Product updated successfully");
      navigate("/dashboard/products");
    } catch (error) {
      toast.error("Failed to update product");
    }
  };

  // FIXED: Show loading spinner while fetching
  if (loading && !selectedProduct) {
    return <LoadingSpinner />;
  }

  // FIXED: Better error handling
  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
          <p className="text-muted-foreground mt-1">
            Update product information
          </p>
        </div>
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <div className="flex-1">
                <h3 className="font-semibold text-lg">Error Loading Product</h3>
                <p className="text-muted-foreground mt-1">{error}</p>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => navigate("/dashboard/products")}
              >
                Back to Products
              </Button>
              <Button onClick={() => id && fetchProductById(id)}>Retry</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // FIXED: Show not found message
  if (!selectedProduct) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
          <p className="text-muted-foreground mt-1">
            Update product information
          </p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-lg text-muted-foreground">Product not found</p>
              <Button
                className="mt-4"
                onClick={() => navigate("/dashboard/products")}
              >
                Back to Products
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
        <p className="text-muted-foreground mt-1">Update product information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
          <CardDescription>
            Modify the information below to update the product
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProductForm
            defaultValues={{
              sku: selectedProduct.sku,
              name: selectedProduct.name,
              image: selectedProduct.image,
              productLink: selectedProduct.productLink || "",
              price: selectedProduct.price,
              rating: selectedProduct.rating || 0,
              stockQuantity: selectedProduct.stockQuantity,
              categoryId: selectedProduct.categoryId,
              supplierId: selectedProduct.supplierId || "",
            }}
            onSubmit={handleSubmit}
            isLoading={loading}
            submitText="Update Product"
          />
        </CardContent>
      </Card>
    </div>
  );
}
