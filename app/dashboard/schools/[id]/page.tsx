import { notFound } from "next/navigation";
import Link from "next/link";
import {
  UserPlus,
  Users,
  ReceiptText,
} from "lucide-react";

import { ADMIN_ROLE } from "@/lib/constants";
import { requireCurrentUser } from "@/lib/require-current-user";
import { getSchool } from "@/lib/features/schools/school-actions";
import { countClientsBySchool, getClientsBySchool } from "@/lib/features/clients/client-actions";
import { countInvoicesBySchool, getInvoicesBySchool, getRevenueBySchool } from "@/lib/features/invoices/invoice-actions";
import { countUsersBySchool } from "@/lib/features/users/user-actions";
import { t } from "@/lib/i18n/server";

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

  const { user } = await requireCurrentUser();
  if (user.role !== ADMIN_ROLE && user.schoolId !== id) {
    notFound();
  }

  const school = await getSchool(id);

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
    countUsersBySchool(id),
    countClientsBySchool(id),
    countInvoicesBySchool(id),
    getRevenueBySchool(id),
    getClientsBySchool(id, 5),
    getInvoicesBySchool(id, 5),
  ]);

  const quickActions = await t("schoolOverview.quickActions");
  const schoolUsers = await t("schoolOverview.schoolUsers");
  const manageUsers = await t("schoolOverview.manageUsers");
  const clientsLabel = await t("schoolOverview.clients");
  const viewClients = await t("schoolOverview.viewClients");
  const invoicesLabel = await t("schoolOverview.invoices");
  const viewInvoices = await t("schoolOverview.viewInvoices");

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
          {quickActions}
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
                {schoolUsers}
              </p>

              <p className="text-sm text-slate-500">
                {manageUsers}
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
                {clientsLabel}
              </p>

              <p className="text-sm text-slate-500">
                {viewClients}
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
                {invoicesLabel}
              </p>

              <p className="text-sm text-slate-500">
                {viewInvoices}
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
