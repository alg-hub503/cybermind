import { t } from "@/lib/i18n/server";
import StatCard from "@/components/dashboard/stat-card";
import {
  Users,
  Building2,
  FileText,
  DollarSign,
} from "lucide-react";

interface SchoolStatsProps {
  totalUsers: number;
  totalClients: number;
  totalInvoices: number;
  totalRevenue: number;
}

export default async function SchoolStats({
  totalUsers,
  totalClients,
  totalInvoices,
  totalRevenue,
}: SchoolStatsProps) {
  const title = await t("schoolStats.title");
  const description = await t("schoolStats.description");
  const usersLabel = await t("schoolStats.users");
  const clientsLabel = await t("schoolStats.clients");
  const invoicesLabel = await t("schoolStats.invoices");
  const revenueLabel = await t("schoolStats.revenue");

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900">
          {title}
        </h2>

        <p className="text-sm text-slate-500">
          {description}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title={usersLabel}
          value={totalUsers}
          icon={<Users size={22} />}
        />

        <StatCard
          title={clientsLabel}
          value={totalClients}
          icon={<Building2 size={22} />}
        />

        <StatCard
          title={invoicesLabel}
          value={totalInvoices}
          icon={<FileText size={22} />}
        />

        <StatCard
          title={revenueLabel}
          value={`$${totalRevenue.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          icon={<DollarSign size={22} />}
        />
      </div>
    </section>
  );
}

