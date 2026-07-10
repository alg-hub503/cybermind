import StatCard from "@/components/ui/stat-card";

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
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="Users"
        value={totalUsers}
      />

      <StatCard
        title="Clients"
        value={totalClients}
      />

      <StatCard
        title="Invoices"
        value={totalInvoices}
      />

      <StatCard
        title="Revenue"
        value={`$${totalRevenue.toFixed(2)}`}
      />
    </div>
  );
}