import StatCard from "@/components/ui/stat-card";
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

export default function SchoolStats({
  totalUsers,
  totalClients,
  totalInvoices,
  totalRevenue,
}: SchoolStatsProps) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900">
          School Statistics
        </h2>

        <p className="text-sm text-slate-500">
          Live overview of this school's activity.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Users"
          value={totalUsers}
          icon={<Users size={22} />}
        />

        <StatCard
          title="Clients"
          value={totalClients}
          icon={<Building2 size={22} />}
        />

        <StatCard
          title="Invoices"
          value={totalInvoices}
          icon={<FileText size={22} />}
        />

        <StatCard
          title="Revenue"
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