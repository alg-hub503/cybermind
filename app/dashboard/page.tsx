import { redirect } from "next/navigation";
import { requireCurrentUser } from "@/lib/require-current-user";
import { ADMIN_ROLE } from "@/lib/constants";
import { hasActiveAccess } from "@/lib/subscription-status";
import { getSchoolById } from "@/lib/services/domain/school.service";
import { getDashboardOverview } from "@/lib/services/application/dashboard.service";
import { getAdminStats } from "@/lib/services/stats.service";
import RevenueChart from "@/components/dashboard/charts/revenue-chart";
import DashboardHeader from "@/components/dashboard/widgets/dashboard-header";
import QuickActions from "@/components/dashboard/widgets/quick-actions";
import RecentActivity from "@/components/dashboard/widgets/recent-activity";
import SchoolSummary from "@/components/dashboard/widgets/school-summary";
import StatsGrid from "@/components/dashboard/widgets/stats-grid";
import { t } from "@/lib/i18n/server";
export default async function DashboardPage() {
  const { session, user } = await requireCurrentUser();

  if (user.role === ADMIN_ROLE) {
    const { users, clients, invoices } = await getAdminStats();
    return (
      <div className="space-y-8">
        <DashboardHeader name={session?.user?.name ?? "Admin"} />
        <SchoolSummary
          schoolName={await t("dashboard.platformOverview")}
          totalUsers={users}
          totalClients={clients}
          totalInvoices={invoices}
        />
        <StatsGrid
          clients={clients}
          users={users}
          invoices={invoices}
          revenue={0}
        />
      </div>
    );
  }

  if (!user.schoolId) {
    redirect("/dashboard/schools");
  }
  const school = await getSchoolById(user.schoolId);
  if (!school || !hasActiveAccess(school.subscription?.status ?? "TRIALING")) {
    redirect("/upgrade");
  }
  const {
    school: overviewSchool,
    totalClients,
    totalInvoices,
    totalUsers,
    totalRevenue,
  } = await getDashboardOverview(user.schoolId);
  const displaySchool = school ?? overviewSchool;
  return (
    <div className="space-y-8">
      <DashboardHeader name={session?.user?.name ?? "User"} />
      {displaySchool && (
        <SchoolSummary
          schoolName={displaySchool.name}
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
