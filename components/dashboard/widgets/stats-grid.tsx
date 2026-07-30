"use client";

import StatCard from "@/components/ui/stat-card";
import { useTranslations } from "@/lib/i18n/use-translations";

interface StatsGridProps {
  clients: number;
  users: number;
  invoices: number;
  revenue: number;
}

export default function StatsGrid({ clients, users, invoices, revenue }: StatsGridProps) {
  const { t, dir } = useTranslations("dashboard");

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4" dir={dir}>
      <StatCard title={t("clients")} value={clients} />
      <StatCard title={t("users")} value={users} />
      <StatCard title={t("invoices")} value={invoices} />
      <StatCard title={t("revenue")} value={`$${revenue.toFixed(2)}`} />
    </div>
  );
}
