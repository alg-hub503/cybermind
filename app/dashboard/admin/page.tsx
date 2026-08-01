import { requireAdmin } from "@/lib/authorization";
import { getUsers } from "@/lib/services/user.service";
import { getAdminStats } from "@/lib/services/stats.service";
import { t } from "@/lib/i18n/server";

import PageTitle from "@/components/ui/page-title";
import StatCard from "@/components/ui/stat-card";
import AdminUsersTable from "./AdminUsersTable";

export default async function AdminPage() {
  await requireAdmin();

  const [users, stats] = await Promise.all([getUsers(), getAdminStats()]);

  const tableUsers = users.map((user) => ({
    id: user.id,
    email: user.email,
    name: user.name ?? "",
    role: user.role,
    subscriptionStatus: user.School?.subscription?.status ?? null,
  }));

  return (
    <div className="space-y-8">
      <PageTitle
        title={await t("admin.title")}
        description={await t("admin.description")}
      />

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title={await t("admin.totalUsers")} value={stats.users} />
        <StatCard title={await t("admin.totalSchools")} value={stats.schools} />
        <StatCard
          title={await t("admin.activeSubscriptions")}
          value={stats.activeSubscriptions}
        />
        <StatCard
          title={await t("admin.trialAccounts")}
          value={stats.trialAccounts}
        />
      </div>

      <AdminUsersTable users={tableUsers} />
    </div>
  );
}
