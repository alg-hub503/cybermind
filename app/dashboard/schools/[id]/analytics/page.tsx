import { notFound } from "next/navigation";

import { ADMIN_ROLE } from "@/lib/constants";
import { requireCurrentUser } from "@/lib/require-current-user";
import { countClientsBySchool } from "@/lib/features/clients/client-actions";
import { countInvoicesBySchool, getRevenueBySchool } from "@/lib/features/invoices/invoice-actions";
import { countUsersBySchool } from "@/lib/features/users/user-actions";
import { t } from "@/lib/i18n/server";

import PageTitle from "@/components/ui/page-title";
import StatCard from "@/components/ui/stat-card";

import AnalyticsChart from "@/components/dashboard/charts/analytics-chart";

interface AnalyticsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AnalyticsPage({
  params,
}: AnalyticsPageProps) {
  const { id } = await params;

  const { user } = await requireCurrentUser();
  if (user.role !== ADMIN_ROLE && user.schoolId !== id) {
    notFound();
  }

  const [
    users,
    clients,
    invoices,
    revenue,
  ] = await Promise.all([
    countUsersBySchool(id),
    countClientsBySchool(id),
    countInvoicesBySchool(id),
    getRevenueBySchool(id),
  ]);

  const totalRevenue =
    revenue._sum.amount ?? 0;

  const title = await t("schoolAnalytics.title");
  const description = await t("schoolAnalytics.description");
  const usersLabel = await t("schoolAnalytics.users");
  const clientsLabel = await t("schoolAnalytics.clients");
  const invoicesLabel = await t("schoolAnalytics.invoices");
  const revenueLabel = await t("schoolAnalytics.revenue");

  return (
    <div className="space-y-8">
      <PageTitle
        title={title}
        description={description}
      />

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title={usersLabel}
          value={users}
        />

        <StatCard
          title={clientsLabel}
          value={clients}
        />

        <StatCard
          title={invoicesLabel}
          value={invoices}
        />

        <StatCard
          title={revenueLabel}
          value={`$${totalRevenue.toFixed(2)}`}
        />
      </div>

      <AnalyticsChart
        users={users}
        clients={clients}
        invoices={invoices}
        revenue={totalRevenue}
      />
    </div>
  );
}
