import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";

import SchoolHeader from "@/components/dashboard/schools/school-header";
import SchoolTabs from "@/components/dashboard/schools/school-tabs";
import SchoolStats from "@/components/dashboard/schools/school-stats";
import SchoolClients from "@/components/dashboard/schools/school-clients";
import RecentInvoices from "@/components/dashboard/recent-invoices";

interface SchoolPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function SchoolPage({
  params,
}: SchoolPageProps) {
  const { id } = await params;

  const school = await prisma.school.findUnique({
    where: {
      id,
    },
  });

  if (!school) {
    notFound();
  }

  const [
    totalUsers,
    totalClients,
    totalInvoices,
    revenue,
    clients,
    invoices,
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

    prisma.client.findMany({
      where: {
        schoolId: id,
      },
      take: 5,
      orderBy: {
        id: "desc",
      },
    }),

    prisma.invoice.findMany({
      where: {
        schoolId: id,
      },
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        amount: true,
        createdAt: true,
      },
    }),
  ]);

  return (
    <div className="space-y-8">
      <SchoolHeader school={school} />

      <SchoolTabs schoolId={school.id} />

      <SchoolStats
        totalUsers={totalUsers}
        totalClients={totalClients}
        totalInvoices={totalInvoices}
        totalRevenue={revenue._sum.amount ?? 0}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <SchoolClients clients={clients} />

        <RecentInvoices invoices={invoices} />
      </div>
    </div>
  );
}