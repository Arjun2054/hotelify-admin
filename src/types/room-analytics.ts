export interface WeeklyDailyBreakdown {
  day: string;
  date: string;
  bookings: number;
  revenue: number;
  isToday: boolean;
  isPast: boolean;
}

export interface WeeklySummary {
  revenue: number;
  bookings: number;
  lastWeekRevenue: number;
  lastWeekBookings: number;
  revenueGrowth: number;
  bookingsGrowth: number;
  avgDailyRevenue: number;
  avgDailyBookings: number;
  projectedWeekRevenue: number;
  dailyBreakdown: WeeklyDailyBreakdown[];
  weekRange: { start: string; end: string };
}

export interface DashboardStats {
  // Room counts
  totalRooms: number;
  available: number;
  occupied: number;
  cleaning: number;
  maintenance: number;
  outOfOrder: number;
  occupancyRate: number;
  estimatedDailyRevenue: number;
  // Housekeeping
  pendingHousekeeping: number;
  todayCheckIns: number;
  activeAssignments: number;
  // Monthly
  currentMonthRevenue: number;
  currentMonthBookings: number;
  revenueGrowth: number;
  bookingsGrowth: number;
  // ✅ Weekly
  weekly: WeeklySummary;
}

export interface RoomPerformanceMetric {
  roomId: string;
  roomNumber: string;
  roomType: string;
  roomTypeId: string;
  floor: number;
  status: string;
  basePrice: number;
  totalBookings: number;
  totalNights: number;
  totalRevenue: number;
  occupancyRate: number;
  avgRevenuePerBooking: number;
  avgStayDuration: number;
}

export interface RoomTypePerformance {
  roomTypeId: string;
  roomTypeName: string;
  totalRooms: number;
  totalBookings: number;
  totalRevenue: number;
  totalNights: number;
  avgOccupancyRate: number;
  avgRevenuePerRoom: number;
  basePrice: number;
}

export interface MonthlyTrend {
  month: string;
  monthShort: string;
  monthKey: string;
  monthIndex: number;
  bookings: number;
  revenue: number;
  occupancyRate: number;
  avgStayDuration: number;
}

export interface YearlyRevenue {
  year: number;
  totalRevenue: number;
  totalBookings: number;
  totalNights: number;
  avgRevenue: number;
}

export interface StatusDistribution {
  status: string;
  label: string;
  count: number;
  percentage: number;
  color: string;
}

export interface HeatmapCell {
  day: string;
  dayIndex: number;
  bookings: number;
  intensity: number;
}

export interface AnalyticsSummary {
  totalRevenue: number;
  totalBookings: number;
  avgOccupancyRate: number;
  avgStayDuration: number;
  topRoom: RoomPerformanceMetric | null;
  topRoomType: RoomTypePerformance | null;
}

export interface RoomAnalyticsResponse {
  summary: AnalyticsSummary;
  roomPerformance: RoomPerformanceMetric[];
  roomTypePerformance: RoomTypePerformance[];
  monthlyTrends: MonthlyTrend[];
  statusDistribution: StatusDistribution[];
  heatmap: HeatmapCell[];
  yearlyRevenue: YearlyRevenue[];
}

export interface AnalyticsFilter {
  startDate?: Date;
  endDate?: Date;
  roomTypeId?: string;
  floor?: number;
}
