import { requireCurrentUser } from "@/lib/require-current-user";
import { redirect } from "next/navigation";
import { t } from "@/lib/i18n/server";
import Card from "@/components/cards/card";

import RevenueCard from "@/components/analytics/revenue-card";
import RevenueChart from "@/components/analytics/revenue-chart";
import TopClients from "@/components/analytics/top-clients";
import LatestInvoices from "@/components/analytics/latest-invoices";

import {
  getDashboardAnalytics,
  getRevenueTrend,
  getTopClients,
  getLatestInvoices,
} from "@/lib/services/analytics.service";

export default async function AnalyticsPage() {

  const { user } = await requireCurrentUser();

  if (!user.schoolId) {
    redirect("/dashboard/schools");
  }
  const [
    analytics,
    revenueTrend,
    topClients,
    latestInvoices,
  ] = await Promise.all([
    getDashboardAnalytics(user.schoolId),
    getRevenueTrend(user.schoolId),
    getTopClients(user.schoolId),
    getLatestInvoices(user.schoolId),
  ]);

  const title = await t("analytics.title");
  const description = await t("analytics.description");
  const totalRevenue = await t("analytics.totalRevenue");
  const allInvoices = await t("analytics.allInvoices");
  const averageInvoice = await t("analytics.averageInvoice");
  const averageInvoiceValue = await t("analytics.averageInvoiceValue");
  const totalSchools = await t("analytics.totalSchools");
  const totalUsers = await t("analytics.totalUsers");
  const totalClients = await t("analytics.totalClients");
  const totalInvoices = await t("analytics.totalInvoices");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {title}
        </h1>

        <p className="mt-2 text-slate-500">
          {description}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <RevenueCard
          title={totalRevenue}
          value={analytics.totalRevenue}
          subtitle={allInvoices}
        />

        <RevenueCard
          title={averageInvoice}
          value={analytics.averageInvoice}
          subtitle={averageInvoiceValue}
        />

        <Card>
          <p className="text-sm text-slate-500">
            {totalSchools}
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            {analytics.totalSchools}
          </h2>
        </Card>

        <Card>
          <p className="text-sm text-slate-500">
            {totalUsers}
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            {analytics.totalUsers}
          </h2>
        </Card>

        <Card>
          <p className="text-sm text-slate-500">
            {totalClients}
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            {analytics.totalClients}
          </h2>
        </Card>

        <Card>
          <p className="text-sm text-slate-500">
            {totalInvoices}
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            {analytics.totalInvoices}
          </h2>
        </Card>
      </div>

      <RevenueChart
        data={revenueTrend}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <TopClients
          clients={topClients}
        />

        <LatestInvoices
          invoices={latestInvoices}
        />
      </div>
    </div>
  );
}
