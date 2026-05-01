// hooks/useRoomDetail.ts

import { useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useRoomStore } from "@/store/room/useRoomStore";
import { useRoomAssignmentStore } from "@/store/room/useRoomAssignmentStore";
import { useHousekeepingStore } from "@/store/houseKeeping/useHousekeepingStore";
import type { HousekeepingTask } from "@/types/houseKeeping-types";
import type { Room } from "@/types/room-types";

export function useRoomDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { selectedRoom, isLoading, fetchRoomById, fetchRooms, fetchStats } =
    useRoomStore();
  const { checkOut } = useRoomAssignmentStore();
  const { tasks, setFilters, fetchTasks } = useHousekeepingStore();

  /* ── Fetch room + housekeeping on mount / id change ──── */
  useEffect(() => {
    if (!id) return;
    fetchRoomById(id);
    setFilters({ roomId: id });
    fetchTasks();
  }, [id, fetchRoomById, setFilters, fetchTasks]);

  const room = selectedRoom as Room | null;

  const roomTasks = useMemo<HousekeepingTask[]>(
    () => (tasks as HousekeepingTask[]).filter((t) => t.roomId === id),
    [tasks, id],
  );

  /* ── Check-out handler ──────────────────────────────── */
  const handleCheckOut = useCallback(async () => {
    if (!room?.currentGuest || !id) return;

    try {
      await checkOut(room.currentGuest.id);
      toast.success(
        `${room.currentGuest.guestName} checked out of Room ${room.roomNumber}`,
      );
      fetchRoomById(id);
      fetchRooms();
      fetchStats();
    } catch (err) {
      toast.error((err as Error).message);
    }
  }, [room, id, checkOut, fetchRoomById, fetchRooms, fetchStats]);

  const goBack = useCallback(() => navigate("/rooms"), [navigate]);

  return { id, room, isLoading, roomTasks, handleCheckOut, goBack };
}
