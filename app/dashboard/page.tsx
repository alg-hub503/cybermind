import { redirect } from "next/navigation";

import { requireCurrentUser } from "@/lib/require-current-user";

import { getDashboardOverview } from "@/lib/services/application/dashboard.service";

import RevenueChart from "@/components/dashboard/charts/revenue-chart";
import DashboardHeader from "@/components/dashboard/widgets/dashboard-header";
import QuickActions from "@/components/dashboard/widgets/quick-actions";
import RecentActivity from "@/components/dashboard/widgets/recent-activity";
import SchoolSummary from "@/components/dashboard/widgets/school-summary";
import StatsGrid from "@/components/dashboard/widgets/stats-grid";



export default async function DashboardPage() {
  const { session, user } =
  await requireCurrentUser();

  if (user.subscriptionStatus !== "PRO") {
    redirect("/upgrade");
  }

  if (!user.schoolId) {
    redirect("/schools");
  }

  const {
    school,
    totalClients,
    totalInvoices,
    totalUsers,
    totalRevenue,
  } = await getDashboardOverview(user.schoolId);

  return (
    <div className="space-y-8">
      <DashboardHeader name={session?.user?.name ?? "User"} />

      {school && (
        <SchoolSummary
          schoolName={school.name}
          totalUsers={totalUsers}
          totalClients={totalClients}
          totalInvoices={totalInvoices}
        />
      )}

      <StatsGrid
        clients={totalClients}
        users={totalUsers}
        invoices={totalInvoices}
        revenue={totalRevenue}
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <RevenueChart
            revenue={totalRevenue}
            invoices={totalInvoices}
          />
        </div>

        <QuickActions />
      </div>

      <RecentActivity
        totalClients={totalClients}
        totalUsers={totalUsers}
        totalInvoices={totalInvoices}
      />
    </div>
  );
}






