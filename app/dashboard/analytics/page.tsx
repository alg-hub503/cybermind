import { requireCurrentUser } from "@/lib/require-current-user";
import { redirect } from "next/navigation";
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
    redirect("/schools");
  }
  const [
    analytics,
    revenueTrend,
    topClients,
    latestInvoices,
  ] = await Promise.all([
    getDashboardAnalytics(),
    getRevenueTrend(),
    getTopClients(),
    getLatestInvoices(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Analytics
        </h1>

        <p className="mt-2 text-slate-500">
          Monitor your business performance with real-time analytics.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <RevenueCard
          title="Total Revenue"
          value={analytics.totalRevenue}
          subtitle="All invoices"
        />

        <RevenueCard
          title="Average Invoice"
          value={analytics.averageInvoice}
          subtitle="Average invoice value"
        />

        <Card>
          <p className="text-sm text-slate-500">
            Total Schools
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            {analytics.totalSchools}
          </h2>
        </Card>

        <Card>
          <p className="text-sm text-slate-500">
            Total Users
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            {analytics.totalUsers}
          </h2>
        </Card>

        <Card>
          <p className="text-sm text-slate-500">
            Total Clients
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            {analytics.totalClients}
          </h2>
        </Card>

        <Card>
          <p className="text-sm text-slate-500">
            Total Invoices
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


