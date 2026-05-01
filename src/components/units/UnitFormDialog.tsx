import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import type { CreateUnitPayload, Unit } from "@/types/hotelItem-types";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUnitPayload) => Promise<void>;
  editingUnit?: Unit | null;
  isLoading: boolean;
}

export function UnitFormDialog({
  open,
  onClose,
  onSubmit,
  editingUnit,
  isLoading,
}: Props) {
  const isEdit = !!editingUnit;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateUnitPayload>();

  useEffect(() => {
    if (editingUnit) {
      reset({
        name: editingUnit.name,
        abbreviation: editingUnit.abbreviation,
      });
    } else {
      reset({ name: "", abbreviation: "" });
    }
  }, [editingUnit, reset, open]);

  const onFormSubmit = async (data: CreateUnitPayload) => {
    await onSubmit(data);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Unit" : "Add New Unit"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Unit Name *</Label>
            <Input
              id="name"
              {...register("name", { required: "Name is required" })}
              placeholder="e.g. Kilogram, Litre, Piece"
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="abbreviation">Abbreviation *</Label>
            <Input
              id="abbreviation"
              {...register("abbreviation", {
                required: "Abbreviation is required",
              })}
              placeholder="e.g. kg, L, pcs"
            />
            {errors.abbreviation && (
              <p className="text-xs text-red-500">
                {errors.abbreviation.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
