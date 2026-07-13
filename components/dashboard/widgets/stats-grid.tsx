import StatCard from "@/components/ui/stat-card";

interface StatsGridProps {
  clients: number;
  users: number;
  invoices: number;
  revenue: number;
}

export default function StatsGrid({
  clients,
  users,
  invoices,
  revenue,
}: StatsGridProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      <StatCard title="Clients" value={clients} />

      <StatCard title="Users" value={users} />

      <StatCard title="Invoices" value={invoices} />

      <StatCard title="Revenue" value={`$${revenue.toFixed(2)}`} />
    </div>
  );
}
