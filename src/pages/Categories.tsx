import { CategoryTable } from "@/components/CategoryTable";

export default function CategoryListPage() {
  return (
    <div className="p-5 space-y-5">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
        <p className="text-muted-foreground mt-1">
          Manage your product categories
        </p>
      </div>

      <CategoryTable />
    </div>
  );
}
