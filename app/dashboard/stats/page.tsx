import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { getUserByEmail } from "@/lib/services/user.service";
import { getAdminStats, getSchoolStats } from "@/lib/services/stats.service";

export default async function StatsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await getUserByEmail(session.user.email);
  const isAdmin = user?.role === "ADMIN";

  if (isAdmin && !user?.schoolId) {
    const stats = await getAdminStats();

    return (
      <div className="space-y-8 p-6">
        <div>
          <h1 className="text-2xl font-bold">Platform Statistics</h1>
          <p className="text-gray-500">Overview of all schools on the platform</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border bg-white p-6">
            <h3 className="text-sm text-gray-500">Total Schools</h3>
            <p className="mt-2 text-3xl font-bold">{stats.schools}</p>
          </div>
          <div className="rounded-lg border bg-white p-6">
            <h3 className="text-sm text-gray-500">Total Users</h3>
            <p className="mt-2 text-3xl font-bold">{stats.users}</p>
          </div>
          <div className="rounded-lg border bg-white p-6">
            <h3 className="text-sm text-gray-500">Total Clients</h3>
            <p className="mt-2 text-3xl font-bold">{stats.clients}</p>
          </div>
          <div className="rounded-lg border bg-white p-6">
            <h3 className="text-sm text-gray-500">Total Invoices</h3>
            <p className="mt-2 text-3xl font-bold">{stats.invoices}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user?.schoolId) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Dashboard Statistics</h1>
        <p className="mt-4 text-gray-500">No school found for your account.</p>
      </div>
    );
  }

  const stats = await getSchoolStats(user.schoolId);

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-bold">School Statistics</h1>
        <p className="text-gray-500">Overview of your school data</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-white p-6">
          <h3 className="text-sm text-gray-500">Total Clients</h3>
          <p className="mt-2 text-3xl font-bold">{stats.clients}</p>
        </div>
        <div className="rounded-lg border bg-white p-6">
          <h3 className="text-sm text-gray-500">Total Users</h3>
          <p className="mt-2 text-3xl font-bold">{stats.users}</p>
        </div>
        <div className="rounded-lg border bg-white p-6">
          <h3 className="text-sm text-gray-500">Total Invoices</h3>
          <p className="mt-2 text-3xl font-bold">{stats.invoices}</p>
        </div>
        <div className="rounded-lg border bg-white p-6">
          <h3 className="text-sm text-gray-500">Total Revenue</h3>
          <p className="mt-2 text-3xl font-bold">${stats.revenue}</p>
        </div>
      </div>
    </div>
  );
}
