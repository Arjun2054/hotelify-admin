// components/room/detail/RoomNotFound.tsx

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface RoomNotFoundProps {
  onBack: () => void;
}

export function RoomNotFound({ onBack }: RoomNotFoundProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24">
      <h2 className="text-lg font-semibold">Room not found</h2>
      <p className="text-sm text-muted-foreground">
        The room you're looking for doesn't exist or has been removed.
      </p>
      <Button variant="outline" onClick={onBack}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Rooms
      </Button>
    </div>
  );
}
