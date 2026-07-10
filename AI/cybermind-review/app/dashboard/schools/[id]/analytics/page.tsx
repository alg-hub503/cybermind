import { prisma } from "@/lib/prisma";

import PageTitle from "@/components/ui/page-title";
import StatCard from "@/components/ui/stat-card";

interface AnalyticsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AnalyticsPage({
  params,
}: AnalyticsPageProps) {
  const { id } = await params;

  const [
    users,
    clients,
    invoices,
    revenue,
  ] = await Promise.all([
    prisma.user.count({
      where: {
        schoolId: id,
      },
    }),

    prisma.client.count({
      where: {
        schoolId: id,
      },
    }),

    prisma.invoice.count({
      where: {
        schoolId: id,
      },
    }),

    prisma.invoice.aggregate({
      where: {
        schoolId: id,
      },
      _sum: {
        amount: true,
      },
    }),
  ]);

  return (
    <div className="space-y-8">
      <PageTitle
        title="School Analytics"
        description="Overview of this school's activity."
      />

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Users"
          value={users}
        />

        <StatCard
          title="Clients"
          value={clients}
        />

        <StatCard
          title="Invoices"
          value={invoices}
        />

        <StatCard
          title="Revenue"
          value={`$${(revenue._sum.amount ?? 0).toFixed(2)}`}
        />
      </div>
    </div>
  );
}