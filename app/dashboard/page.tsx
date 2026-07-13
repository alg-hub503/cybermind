import type { Session } from "next-auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import RevenueChart from "@/components/dashboard/charts/revenue-chart";
import DashboardHeader from "@/components/dashboard/widgets/dashboard-header";
import QuickActions from "@/components/dashboard/widgets/quick-actions";
import RecentActivity from "@/components/dashboard/widgets/recent-activity";
import SchoolSummary from "@/components/dashboard/widgets/school-summary";
import StatsGrid from "@/components/dashboard/widgets/stats-grid";

async function getUser(session: Session | null) {
  if (!session?.user?.email) {
    return null;
  }

  return prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
  });
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  const user = await getUser(session);

  if (!user) {
    redirect("/login");
  }

  if (user.subscriptionStatus !== "PRO") {
    redirect("/upgrade");
  }

  if (!user.schoolId) {
    redirect("/schools");
  }

  const [school, totalClients, totalInvoices, totalUsers, revenue] =
    await Promise.all([
      prisma.school.findUnique({
        where: {
          id: user.schoolId,
        },
      }),

      prisma.client.count({
        where: {
          schoolId: user.schoolId,
        },
      }),

      prisma.invoice.count({
        where: {
          schoolId: user.schoolId,
        },
      }),

      prisma.user.count({
        where: {
          schoolId: user.schoolId,
        },
      }),

      prisma.invoice.aggregate({
        where: {
          schoolId: user.schoolId,
        },
        _sum: {
          amount: true,
        },
      }),
    ]);

  const totalRevenue = revenue._sum.amount ?? 0;

  return (
    <div className="space-y-8">
      <DashboardHeader name={session.user.name} />

      {school && (
        <SchoolSummary
          schoolName={school.name}
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
          <RevenueChart revenue={totalRevenue} invoices={totalInvoices} />
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
