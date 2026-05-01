// ═══════════════════════════════════════════════════════════
// HOUSEKEEPING TYPES
// ═══════════════════════════════════════════════════════════

export type HousekeepingStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "INSPECTED";

export interface HousekeepingTask {
  id: string;
  organizationId: string;
  roomId: string;
  userId: string;
  status: HousekeepingStatus;
  scheduledAt: string;
  startedAt: string | null;
  completedAt: string | null;
  notes: string | null;
  damageNotes: string | null;
  createdAt: string;
  updatedAt: string;
  room: {
    id: string;
    roomNumber: string;
    floor: number;
    status: string;
    roomType: { id: string; name: string };
    roomItems?: RoomItemStandard[];
  };
  user: { userId: string; name: string };
  itemsUsed: HousekeepingItemUsed[];
}

export interface HousekeepingItemUsed {
  id: string;
  itemId: string;
  quantityUsed: number;
  isDamaged: boolean;
  damageNotes: string | null;
  hotelItem: {
    id: string;
    name: string;
    unit: { abbreviation: string };
  };
}

export interface RoomItemStandard {
  itemId: string;
  itemName: string;
  standardQty: number;
  currentStock: number;
  isActive: boolean;
  unit: { id: string; name: string; abbreviation: string };
}

export interface CreateHousekeepingTaskPayload {
  roomId: string;
  userId: string;
  scheduledAt: string;
  notes?: string;
}

export interface BatchCreateTasksPayload {
  roomIds: string[];
  userId: string;
  scheduledAt: string;
  notes?: string;
}

export interface RecordItemUsedPayload {
  itemId: string;
  quantityUsed: number;
  isDamaged?: boolean;
  damageNotes?: string;
}

export interface CompleteTaskPayload {
  notes?: string;
  damageNotes?: string;
  items?: RecordItemUsedPayload[];
}

export interface InspectTaskPayload {
  approved: boolean;
  notes?: string;
  roomStatus?: "AVAILABLE" | "MAINTENANCE" | "OUT_OF_ORDER";
}

export interface HousekeepingFilters {
  status?: HousekeepingStatus | "";
  roomId?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
  floor?: number | "";
}

export interface HousekeepingStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  inspected: number;
  todayTasks: number;
  overdueTasks: number;
  avgCompletionMinutes: number | null;
}

export interface HousekeepingBoardColumn {
  status: HousekeepingStatus;
  label: string;
  tasks: HousekeepingTask[];
}

export interface ItemUsageReport {
  itemId: string;
  itemName: string;
  sku: string | null;
  unit: string;
  totalUsed: number;
  usageCount: number;
  currentStock: number;
  totalCost: number;
}
