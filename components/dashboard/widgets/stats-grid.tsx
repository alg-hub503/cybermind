"use client";

import StatCard from "@/components/ui/stat-card";
import { useTranslations } from "@/lib/i18n/use-translations";

interface StatsGridProps {
  clients: number;
  users: number;
  invoices: number;
  revenue: number;
  showBilling?: boolean;
}

export default function StatsGrid({ clients, users, invoices, revenue, showBilling = true }: StatsGridProps) {
  const { t, dir } = useTranslations("dashboard");

  return (
    <div className={`grid gap-6 md:grid-cols-2 ${showBilling ? "xl:grid-cols-4" : "xl:grid-cols-2"}`} dir={dir}>
      <StatCard title={t("users")} value={users} />
      {showBilling && <StatCard title={t("clients")} value={clients} />}
      {showBilling && <StatCard title={t("invoices")} value={invoices} />}
      {showBilling && <StatCard title={t("revenue")} value={`$${revenue.toFixed(2)}`} />}
    </div>
  );
}
