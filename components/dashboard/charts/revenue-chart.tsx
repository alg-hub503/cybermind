"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface RevenueChartProps {
  revenue: number;
  invoices: number;
}

export default function RevenueChart({ revenue, invoices }: RevenueChartProps) {
  const data = [
    {
      name: "Revenue",
      value: revenue,
    },
    {
      name: "Invoices",
      value: invoices,
    },
  ];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-xl font-semibold text-slate-900">
        Revenue Overview
      </h2>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="name" />

            <YAxis />

            <Tooltip />

            <Area
              type="monotone"
              dataKey="value"
              stroke="#4f46e5"
              fill="#818cf8"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
