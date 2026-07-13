import { prisma } from "@/lib/prisma";
import { Eye, Pencil, Trash2, Users } from "lucide-react";
import Link from "next/link";

import DataTable from "@/components/ui/data-table";
import DataTableBody from "@/components/ui/data-table-body";
import DataTableHead from "@/components/ui/data-table-head";
import EmptyState from "@/components/ui/empty-state";
import PageTitle from "@/components/ui/page-title";

interface UsersPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function UsersPage({ params }: UsersPageProps) {
  const { id } = await params;

  const users = await prisma.user.findMany({
    where: {
      schoolId: id,
    },
    orderBy: {
      role: "asc",
    },
  });

  return (
    <div className="space-y-8">
      <PageTitle
        title="School Users"
        description="Manage all users assigned to this school."
      />

      <div className="flex justify-end">
  <Link
    href={`/dashboard/schools/${id}/users/new`}
    className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
  >
    Add User
  </Link>
</div>

{users.length === 0 ? (
  <EmptyState
    title="No users found"
    description="There are no users assigned to this school."
  />
) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Users</h2>

              <p className="mt-1 text-sm text-slate-500">
                Total Users: {users.length}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href={`/dashboard/schools/${id}/users/new`}
                className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                Add User
              </Link>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
                <Users size={22} />
              </div>
            </div>
          </div>

          <DataTable>
            <DataTableHead>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                User
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                Email
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                Role
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                Plan
              </th>

              <th className="px-6 py-4 text-center text-sm font-semibold text-slate-600">
                Actions
              </th>
            </DataTableHead>

            <DataTableBody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-slate-100 transition hover:bg-slate-50"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700">
                        {(user.name ?? user.email).charAt(0).toUpperCase()}
                      </div>

                      <div>
                        <p className="font-semibold text-slate-900">
                          {user.name ?? "Unnamed User"}
                        </p>

                        <p className="text-xs text-slate-500">
                          {user.id.slice(0, 10)}...
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-slate-600">{user.email}</td>

                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        user.role === "ADMIN"
                          ? "bg-indigo-100 text-indigo-700"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        user.subscriptionStatus === "PRO"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {user.subscriptionStatus}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-3">
                      <Link
                        href={`/dashboard/users/${user.id}`}
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-indigo-600"
                      >
                        <Eye size={18} />
                      </Link>

                      <Link
                        href={`/dashboard/users/${user.id}/edit`}
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-amber-600"
                      >
                        <Pencil size={18} />
                      </Link>

                      <button
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-red-100 hover:text-red-600"
                        type="button"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </DataTableBody>
          </DataTable>
        </div>
      )}
    </div>
  );
}
