import { getServerSession } from "@/lib/get-server-session";
import { redirect } from "next/navigation";

import { getUserByEmail } from "@/lib/services/user.service";
import { getAdminStats, getSchoolStats } from "@/lib/services/stats.service";
import { t } from "@/lib/i18n/server";

import PageTitle from "@/components/ui/page-title";
import StatCard from "@/components/ui/stat-card";
import EmptyState from "@/components/ui/empty-state";

export default async function StatsPage() {
  const session = await getServerSession();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await getUserByEmail(session.user.email);
  const isAdmin = user?.role === "ADMIN";

  if (isAdmin && !user?.schoolId) {
    const stats = await getAdminStats();

    return (
      <div className="space-y-8">
        <PageTitle
          title={await t("stats.titlePlatform")}
          description={await t("stats.descriptionPlatform")}
        />

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard title={await t("stats.totalSchools")} value={stats.schools} />
          <StatCard title={await t("stats.totalUsers")} value={stats.users} />
          <StatCard title={await t("stats.totalClients")} value={stats.clients} />
          <StatCard title={await t("stats.totalInvoices")} value={stats.invoices} />
        </div>
      </div>
    );
  }

  if (!user?.schoolId) {
    return (
      <div className="space-y-8">
        <PageTitle title={await t("stats.titleDashboard")} />
        <EmptyState
          title={await t("stats.noSchoolTitle")}
          description={await t("stats.noSchoolDescription")}
        />
      </div>
    );
  }

  const stats = await getSchoolStats(user.schoolId);

  return (
    <div className="space-y-8">
      <PageTitle
        title={await t("stats.titleSchool")}
        description={await t("stats.descriptionSchool")}
      />

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title={await t("stats.totalClients")} value={stats.clients} />
        <StatCard title={await t("stats.totalUsers")} value={stats.users} />
        <StatCard title={await t("stats.totalInvoices")} value={stats.invoices} />
        <StatCard title={await t("stats.totalRevenue")} value={`$${stats.revenue}`} />
      </div>
    </div>
  );
}
