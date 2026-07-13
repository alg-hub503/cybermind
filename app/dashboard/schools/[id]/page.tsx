import { notFound } from "next/navigation";
import Link from "next/link";
import {
  UserPlus,
  Users,
  ReceiptText,
} from "lucide-react";

import { prisma } from "@/lib/prisma";

import SchoolHeader from "@/components/dashboard/schools/school-header";
import SchoolTabs from "@/components/dashboard/schools/school-tabs";
import SchoolStats from "@/components/dashboard/schools/school-stats";
import SchoolClients from "@/components/dashboard/schools/school-clients";
import SchoolAnalyticsCard from "@/components/dashboard/schools/school-analytics-card";
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

      <SchoolAnalyticsCard
        schoolId={school.id}
      />

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-xl font-bold text-slate-900">
          Quick Actions
        </h2>

        <div className="grid gap-4 md:grid-cols-3">
          <Link
            href={`/dashboard/schools/${id}/users`}
            className="flex items-center gap-4 rounded-xl border border-slate-200 p-5 transition hover:border-indigo-300 hover:bg-slate-50"
          >
            <Users
              className="text-indigo-600"
              size={24}
            />

            <div>
              <p className="font-semibold">
                School Users
              </p>

              <p className="text-sm text-slate-500">
                Manage users
              </p>
            </div>
          </Link>

          <Link
            href="/dashboard/clients"
            className="flex items-center gap-4 rounded-xl border border-slate-200 p-5 transition hover:border-emerald-300 hover:bg-slate-50"
          >
            <UserPlus
              className="text-emerald-600"
              size={24}
            />

            <div>
              <p className="font-semibold">
                Clients
              </p>

              <p className="text-sm text-slate-500">
                View clients
              </p>
            </div>
          </Link>

          <Link
            href="/dashboard/invoices"
            className="flex items-center gap-4 rounded-xl border border-slate-200 p-5 transition hover:border-amber-300 hover:bg-slate-50"
          >
            <ReceiptText
              className="text-amber-600"
              size={24}
            />

            <div>
              <p className="font-semibold">
                Invoices
              </p>

              <p className="text-sm text-slate-500">
                View invoices
              </p>
            </div>
          </Link>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <SchoolClients clients={clients} />

        <RecentInvoices invoices={invoices} />
      </div>
    </div>
  );
}
