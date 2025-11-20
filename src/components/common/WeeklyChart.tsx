import React, { useMemo, useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from "recharts";

type ChartData = { [day: string]: { day: string; orders: number } };

type LooseChartData = { [day: string]: { orders: number } };

const days = ["S", "M", "T", "W", "T2", "F", "S2"];
const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];

const WeeklyChart: React.FC<{
  employeeId?: number | string;
  initialData?: ChartData | LooseChartData;
}> = ({ initialData }) => {
  const normalize = (d?: ChartData | LooseChartData): ChartData => {
    const base: ChartData = {
      S: { day: "Sunday", orders: 0 },
      M: { day: "Monday", orders: 0 },
      T: { day: "Tuesday", orders: 0 },
      W: { day: "Wednesday", orders: 0 },
      T2: { day: "Thursday", orders: 0 },
      F: { day: "Friday", orders: 0 },
      S2: { day: "Saturday", orders: 0 },
    };
    if (!d) return base;
    const dd = d as Record<string, { day?: string; orders?: number }>;
    return days.reduce((acc, key, idx) => {
      const val = dd[key];
      acc[key] = {
        day: (val && (val.day || dayLabels[idx])) || dayLabels[idx],
        orders: (val && (val.orders || 0)) || 0,
      };
      return acc;
    }, {} as ChartData);
  };

  // If initialData is provided we can render immediately, otherwise show skeleton until fetched
  const [data, setData] = useState<ChartData | null>(
    initialData ? normalize(initialData) : null
  );
  const [loading, setLoading] = useState<boolean>(!initialData);

  // Update chart data if initialData prop changes (e.g., fetched by parent after mount)
  useEffect(() => {
    if (initialData) {
      setData(normalize(initialData));
      setLoading(false);
    } else {
      setData(null);
      setLoading(true);
    }
  }, [initialData]);

  const todayIndex = new Date().getDay(); // 0 = Sunday, 6 = Saturday mapped to days array order

  // Convert normalized data to an array format for Recharts
  const chartData = useMemo(() => {
    if (!data) return [];
    return days.map((day, idx) => ({
      name: dayLabels[idx],
      key: day,
      orders: data[day]?.orders || 0,
      isToday: idx === todayIndex,
    }));
  }, [data, todayIndex]);

  if (loading || !data) {
    // skeleton loader
    return (
      <div className="flex items-end justify-between w-full h-40 px-2">
        {days.map((day, idx) => (
          <div key={day} className="flex flex-col items-center w-8">
            <div
              className="w-3.5 bg-gray-200 rounded-lg animate-pulse mb-2"
              style={{ height: `${40 + (idx % 3) * 10}px`, borderRadius: 16 }}
            />
            <div className="w-3 h-3 rounded-full mb-1 bg-gray-200 animate-pulse" />
            <span
              className="text-xs text-black font-semibold mt-1"
              style={{ opacity: 0.7 }}
            >
              {dayLabels[idx]}
            </span>
          </div>
        ))}
      </div>
    );
  }

  const maxOrders = Math.max(...Object.values(data).map((d) => d.orders), 1);

  return (
    <div className="w-full h-40 px-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 8, left: 4, bottom: 10 }}
        >
          <defs>
            <linearGradient id="todayGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6A1B9A" stopOpacity={1} />
              <stop offset="100%" stopColor="#D32F2F" stopOpacity={1} />
            </linearGradient>
            <linearGradient id="defaultGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#000000" stopOpacity={0.6} />
              <stop offset="100%" stopColor="#000000" stopOpacity={0.35} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="transparent" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} />
          <YAxis hide domain={[0, Math.max(1, maxOrders)]} />
          <Tooltip
            formatter={(value: number) => [`${value}`, "Orders"]}
            cursor={{ fill: "transparent" }}
          />
          <Bar dataKey="orders" radius={[12, 12, 0, 0]} barSize={20}>
            {chartData.map((entry) => (
              <Cell
                key={`cell-${entry.key}`}
                fill={
                  entry.isToday
                    ? "url(#todayGradient)"
                    : "url(#defaultGradient)"
                }
                style={
                  entry.isToday
                    ? { filter: "drop-shadow(0 2px 8px rgba(106,27,154,0.2))" }
                    : undefined
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeeklyChart;
