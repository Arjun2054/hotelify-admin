// src/components/housekeeping/BoardView.tsx
"use client";

import { Loader2 } from "lucide-react";
import type {
  HousekeepingBoardColumn,
  HousekeepingTask,
} from "@/types/houseKeeping-types";
import { TaskCard } from "./TaskCard";

interface BoardViewProps {
  board: HousekeepingBoardColumn[];
  isLoading: boolean;
  isManager: boolean;
  onTaskClick: (task: HousekeepingTask) => void;
}

const COLUMN_STYLES: Record<
  string,
  { header: string; dot: string; bg: string; border: string }
> = {
  PENDING: {
    header: "text-black-700",
    dot: "bg-yellow-400",
    bg: "bg-white",
    border: "border-black-100",
  },
  IN_PROGRESS: {
    header: "text-black-700",
    dot: "bg-blue-500",
    bg: "bg-white",
    border: "border-black-100",
  },
  COMPLETED: {
    header: "text-black-700",
    dot: "bg-green-500",
    bg: "bg-white",
    border: "border-black-100",
  },
  INSPECTED: {
    header: "text-black-700",
    dot: "bg-purple-500",
    bg: "bg-white",
    border: "border-black-100",
  },
};

export function BoardView({
  board,
  isLoading,
  isManager,
  onTaskClick,
}: BoardViewProps) {
  if (isLoading && board.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
      {board.map((col) => {
        const style = COLUMN_STYLES[col.status] ?? COLUMN_STYLES.PENDING;
        return (
          <div
            key={col.status}
            className={`rounded-xl border ${style.border} ${style.bg} overflow-hidden`}
          >
            {/* Column Header */}
            <div className="px-4 py-3 border-b border-inherit">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${style.dot}`} />
                  <h3 className={`font-semibold text-sm ${style.header}`}>
                    {col.label}
                  </h3>
                </div>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full bg-white border ${style.border} ${style.header}`}
                >
                  {col.tasks.length}
                </span>
              </div>
            </div>

            {/* Tasks */}
            <div className="p-3 space-y-3 min-h-[120px]">
              {col.tasks.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-xs text-gray-400">No tasks</p>
                </div>
              ) : (
                col.tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    isManager={isManager}
                    compact
                    onClick={() => onTaskClick(task)}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
