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
import { useTranslations } from "@/lib/i18n/use-translations";

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
  const { t } = useTranslations("analytics");

  const data = [
    {
      name: t("usersLabel"),
      value: users,
    },
    {
      name: t("clientsLabel"),
      value: clients,
    },
    {
      name: t("invoicesLabel"),
      value: invoices,
    },
    {
      name: t("revenueLabel"),
      value: revenue,
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-xl font-semibold text-slate-900">
        {t("schoolPerformance")}
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
