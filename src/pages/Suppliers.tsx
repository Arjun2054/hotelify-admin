import { SupplierTable } from "@/components/SupplierTable";

const Suppliers = () => {
  return (
    <div className="p-5 space-y-5">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Suppliers</h1>
        <p className="text-muted-foreground mt-1">
          Manage your supplier network and contacts
        </p>
      </div>
      <SupplierTable />
    </div>
  );
};

export default Suppliers;
