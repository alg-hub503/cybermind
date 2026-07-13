"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

interface AnalyticsChartProps {
  users: number;
  clients: number;
  invoices: number;
  revenue: number;
}

export default function AnalyticsChart({
  users,
  clients,
  invoices,
  revenue,
}: AnalyticsChartProps) {
  const data = [
    {
      name: "Users",
      value: users,
    },
    {
      name: "Clients",
      value: clients,
    },
    {
      name: "Invoices",
      value: invoices,
    },
    {
      name: "Revenue",
      value: revenue,
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-xl font-semibold text-slate-900">
        School Performance
      </h2>

      <div className="h-80">
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="name" />

            <YAxis />

            <Tooltip />

            <Bar
              dataKey="value"
              fill="#4f46e5"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
