import { formatCurrency } from "@/lib/utils";
import { useDashboardStore } from "@/store/dashboardStore";
import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#84cc16", // lime
];

const CategoryRevenueChart: React.FC = () => {
  const { categoryRevenue, isLoadingCategoryRevenue } = useDashboardStore();

  if (isLoadingCategoryRevenue) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-md">
          <p className="font-semibold text-gray-900">{payload[0].name}</p>
          <p className="text-sm text-gray-600">
            Revenue: {formatCurrency(payload[0].value)}
          </p>
          <p className="text-xs text-gray-500">
            {((payload[0].percent || 0) * 100).toFixed(1)}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  const totalRevenue = categoryRevenue.reduce(
    (sum, item) => sum + item.revenue,
    0,
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Revenue by Category
        </h3>
        <p className="text-sm text-gray-600">
          Total Revenue: {formatCurrency(totalRevenue)}
        </p>
      </div>

      {categoryRevenue && categoryRevenue.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={categoryRevenue}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => {
                if (typeof percent === "undefined") {
                  return `${name}: N/A`;
                }
                return `${name}: ${(percent * 100).toFixed(0)}%`;
              }}
              outerRadius={100}
              fill="#8884d8"
              dataKey="revenue"
              nameKey="category"
            >
              {categoryRevenue.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value, entry: any) => {
                const item = categoryRevenue.find((d) => d.category === value);
                return `${value} (${formatCurrency(item?.revenue || 0)})`;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-64 flex items-center justify-center text-gray-500">
          No category revenue data available
        </div>
      )}
    </div>
  );
};

export default CategoryRevenueChart;
