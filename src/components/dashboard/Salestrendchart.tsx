import { useDashboardStore } from "@/store/dashboardStore";
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface SalesTrendChartProps {
  onPeriodChange?: (period: string) => void;
}

const SalesTrendChart: React.FC<SalesTrendChartProps> = ({
  onPeriodChange,
}) => {
  const { salesTrend, isLoadingSalesTrend, selectedPeriod, setSelectedPeriod } =
    useDashboardStore();

  const periods = [
    { value: "7days", label: "7 Days" },
    { value: "30days", label: "30 Days" },
    { value: "90days", label: "90 Days" },
    { value: "365days", label: "1 Year" },
  ];

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period as any);
    if (onPeriodChange) {
      onPeriodChange(period);
    }
  };

  if (isLoadingSalesTrend) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Sales Trend</h3>
        <div className="flex gap-2">
          {periods.map((period) => (
            <button
              key={period.value}
              onClick={() => handlePeriodChange(period.value)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                selectedPeriod === period.value
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {salesTrend && salesTrend.trend.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={salesTrend.trend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#888" />
            <YAxis
              tick={{ fontSize: 12 }}
              stroke="#888"
              tickFormatter={(value) => `NPR${value.toLocaleString()}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
              formatter={(value: any, name: string | undefined) => {
                if (!name) {
                  name = "No name provided";
                }
                return [
                  name === "revenue"
                    ? `NPR${Number(value).toLocaleString()}`
                    : value,
                  name === "revenue" ? "Revenue" : "Sales Count",
                ];
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: "#3b82f6", r: 4 }}
              activeDot={{ r: 6 }}
              name="Revenue"
            />
            <Line
              type="monotone"
              dataKey="salesCount"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: "#10b981", r: 4 }}
              activeDot={{ r: 6 }}
              name="Sales Count"
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-64 flex items-center justify-center text-gray-500">
          No sales data available for the selected period
        </div>
      )}
    </div>
  );
};

export default SalesTrendChart;
