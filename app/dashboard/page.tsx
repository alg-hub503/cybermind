import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import type { Session } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import Card from "@/components/cards/card";

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

  const [
    totalClients,
    totalInvoices,
    totalUsers,
  ] = await Promise.all([
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
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Dashboard
        </h1>

        <p className="mt-2 text-slate-500">
          Welcome back.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <p className="text-sm text-slate-500">
            Clients
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            {totalClients}
          </h2>
        </Card>

        <Card>
          <p className="text-sm text-slate-500">
            Invoices
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            {totalInvoices}
          </h2>
        </Card>

        <Card>
          <p className="text-sm text-slate-500">
            Users
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            {totalUsers}
          </h2>
        </Card>
      </div>
    </div>
  );
}