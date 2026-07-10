import {
  Users,
  FileText,
  DollarSign,
  UserRound,
  School,
} from "lucide-react";

import StatCard from "./stat-card";

interface StatsGridProps {
  totalClients: number;
  totalInvoices: number;
  totalUsers: number;
  totalSchools: number;
  totalRevenue: number;
}

export default function StatsGrid({
  totalClients,
  totalInvoices,
  totalUsers,
  totalSchools,
  totalRevenue,
}: StatsGridProps) {
  return (
    <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-5">
      <StatCard
        title="Clients"
        value={totalClients}
        change={12}
        icon={<Users size={24} />}
      />

      <StatCard
        title="Invoices"
        value={totalInvoices}
        change={8}
        icon={<FileText size={24} />}
      />

      <StatCard
        title="Revenue"
        value={`$${totalRevenue.toFixed(2)}`}
        change={18}
        icon={<DollarSign size={24} />}
      />

      <StatCard
        title="Users"
        value={totalUsers}
        change={10}
        icon={<UserRound size={24} />}
      />

      <StatCard
        title="Schools"
        value={totalSchools}
        change={6}
        icon={<School size={24} />}
      />
    </section>
  );
}