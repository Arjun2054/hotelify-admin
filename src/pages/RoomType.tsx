import { RoomTypeTable } from "@/components/room_types/RoomTypeTable";
import { Button } from "@/components/ui/button";
import { useRoomTypeStore } from "@/store/room/roomTypeStore";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
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
import type { RoomType, CreateRoomTypePayload } from "@/types/room-types";
import { toast } from "sonner";
import { RoomTypeFormDialog } from "@/components/room_types/RoomTypeFormDialog";

const RoomType = () => {
  const {
    roomTypes,
    isLoading,
    fetchRoomTypes,
    createRoomType,
    updateRoomType,
    deleteRoomType,
  } = useRoomTypeStore();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<RoomType | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RoomType | null>(null);

  useEffect(() => {
    fetchRoomTypes();
  }, []);

  const handleCreate = async (data: CreateRoomTypePayload) => {
    await createRoomType(data);
    toast.success("Room type created");
  };

  const handleUpdate = async (data: CreateRoomTypePayload) => {
    if (!editing) return;
    await updateRoomType(editing.id, data);
    toast.success("Room type updated");
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteRoomType(deleteTarget.id);
      toast.success("Room type deleted");
    } catch (err) {
      toast.error((err as Error).message);
    }
    setDeleteTarget(null);
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Room Types</h1>
          <p className="text-muted-foreground mt-1">
            Configure room categories, pricing, and amenities.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Add Room Type
        </Button>
      </div>
      <RoomTypeTable
        roomTypes={roomTypes}
        onEdit={(rt) => {
          setEditing(rt);
          setFormOpen(true);
        }}
        onDelete={setDeleteTarget}
      />
      <RoomTypeFormDialog
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={editing ? handleUpdate : handleCreate}
        editingType={editing}
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
              This will remove the room type. Rooms assigned to this type must
              be reassigned first.
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

export default RoomType;
