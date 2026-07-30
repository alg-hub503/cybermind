"use client";

import Card from "@/components/cards/card";
import { useTranslations } from "@/lib/i18n/use-translations";

interface RecentActivityProps {
  totalClients: number;
  totalUsers: number;
  totalInvoices: number;
}

export default function RecentActivity({ totalClients, totalUsers, totalInvoices }: RecentActivityProps) {
  const { t, dir } = useTranslations("dashboard");

  const activities = [
    { title: t("clients"), value: `${totalClients} ${t("registered")}` },
    { title: t("users"), value: `${totalUsers} ${t("active")}` },
    { title: t("invoices"), value: `${totalInvoices} ${t("created")}` },
  ];

  return (
    <Card dir={dir}>
      <h2 className="mb-6 text-xl font-semibold text-slate-900">{t("recentActivity")}</h2>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div
            key={activity.title}
            className="flex items-center justify-between rounded-xl border border-slate-100 p-4"
          >
            <div>
              <p className="font-medium text-slate-900">{activity.title}</p>
              <p className="text-sm text-slate-500">{activity.value}</p>
            </div>

            <span className="h-3 w-3 rounded-full bg-green-500" />
          </div>
        ))}
      </div>
    </Card>
  );
}
