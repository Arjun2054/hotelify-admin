import { Button } from "@/components/ui/button";
import { UnitFormDialog } from "@/components/units/UnitFormDialog";
import { UnitTable } from "@/components/units/UnitTable";
import { useUnitStore } from "@/store/room/unitStore";
import type { CreateUnitPayload, Unit } from "@/types/hotelItem-types";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const UnitPage = () => {
  const { units, isLoading, fetchUnits, createUnit, updateUnit, deleteUnit } =
    useUnitStore();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Unit | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Unit | null>(null);

  useEffect(() => {
    fetchUnits();
  }, []);

  const handleCreate = async (data: CreateUnitPayload) => {
    await createUnit(data);
    toast.success("Unit created");
  };

  const handleUpdate = async (data: CreateUnitPayload) => {
    if (!editing) return;
    await updateUnit(editing.id, data);
    toast.success("Unit updated");
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteUnit(deleteTarget.id);
      toast.success("Unit deleted");
    } catch (err) {
      toast.error((err as Error).message);
    }
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Units of Measure
          </h1>
          <p className="text-muted-foreground mt-1">
            Define measurement units for your hotel inventory items.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Add Unit
        </Button>
      </div>
      <UnitTable
        units={units}
        onEdit={(u) => {
          setEditing(u);
          setFormOpen(true);
        }}
        onDelete={setDeleteTarget}
      />

      <UnitFormDialog
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={editing ? handleUpdate : handleCreate}
        editingUnit={editing}
        isLoading={isLoading}
      />

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deleteTarget?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the unit. Units assigned to items cannot be
              deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UnitPage;
