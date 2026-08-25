import { redirect } from "next/navigation";
import { requireCurrentUser } from "@/lib/require-current-user";
import { ADMIN_ROLE } from "@/lib/constants";
import { hasActiveAccess } from "@/lib/subscription-status";
import { getSchoolById } from "@/lib/services/domain/school.service";
import { getDashboardOverview } from "@/lib/services/application/dashboard.service";
import { getAdminStats } from "@/lib/services/stats.service";
import { getPlatformSettings } from "@/lib/features/platform/platform-settings-actions";
import { resolveTrialStatus, toAccessString } from "@/lib/trial-status";
import RevenueChart from "@/components/dashboard/charts/revenue-chart";
import DashboardHeader from "@/components/dashboard/widgets/dashboard-header";
import QuickActions from "@/components/dashboard/widgets/quick-actions";
import RecentActivity from "@/components/dashboard/widgets/recent-activity";
import SchoolSummary from "@/components/dashboard/widgets/school-summary";
import StatsGrid from "@/components/dashboard/widgets/stats-grid";
import PaymentBanner from "@/components/dashboard/payment-banner";
import { TrialAccessSetter } from "@/components/dashboard/trial-access-provider";
import TrialWarningBanner from "@/components/dashboard/trial-warning-banner";
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

  const [school, platformSettings] = await Promise.all([
    getSchoolById(user.schoolId),
    getPlatformSettings(),
  ]);

  if (!school) {
    redirect("/upgrade");
  }

  const access = resolveTrialStatus(school, platformSettings);
  const accessStr = toAccessString(access);
  const subStatus = school.subscription?.status ?? null;
  const isPastDueOrUnpaid = subStatus === "PAST_DUE" || subStatus === "UNPAID";

  if (!hasActiveAccess(accessStr) && !isPastDueOrUnpaid) {
    redirect("/account-suspended");
  }

  const {
    school: overviewSchool,
    totalClients,
    totalInvoices,
    totalUsers,
    totalRevenue,
  } = await getDashboardOverview(user.schoolId);
  const displaySchool = school ?? overviewSchool;
  const showPaymentBanner = subStatus === "PAST_DUE" || subStatus === "UNPAID";
  const showTrialWarning =
    access.status === "TRIALING" &&
    access.daysLeft !== null &&
    access.daysLeft > 0 &&
    access.warningDays !== null &&
    access.daysLeft <= access.warningDays;

  return (
    <div className="space-y-8">
      <TrialAccessSetter access={access} />
      <DashboardHeader name={session?.user?.name ?? "User"} />
      {showPaymentBanner && user.schoolId && (
        <PaymentBanner schoolId={user.schoolId} />
      )}
      {showTrialWarning && access.daysLeft !== null && (
        <TrialWarningBanner daysLeft={access.daysLeft} />
      )}
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
