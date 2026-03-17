'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type ChartDataPoint = {
  month: string;
  revenue: number;
};

type DashboardChartProps = {
  data: ChartDataPoint[];
};

export function DashboardChart({ data }: DashboardChartProps) {
  return (
    <div className="h-56 w-full text-[11px] text-neutral-200">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: -20, right: 0, top: 10 }}>
          <defs>
            <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis dataKey="month" stroke="#6b7280" />
          <YAxis stroke="#6b7280" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#020617",
              border: "1px solid #1f2937",
              borderRadius: 8,
              fontSize: 11,
            }}
            labelStyle={{ color: "#e5e7eb" }}
            formatter={(value: number) =>
              value.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })
            }
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#22c55e"
            fill="url(#revenueFill)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

