import { notFound } from "next/navigation";
import { Eye, Pencil, Trash2, Users } from "lucide-react";
import Link from "next/link";

import { ADMIN_ROLE } from "@/lib/constants";
import { requireCurrentUser } from "@/lib/require-current-user";
import { getSchool } from "@/lib/features/schools/school-actions";
import { getUsersBySchool } from "@/lib/features/users/user-actions";
import { t } from "@/lib/i18n/server";

import DataTable from "@/components/legacy/data-table/data-table";
import DataTableBody from "@/components/legacy/data-table/data-table-body";
import DataTableHead from "@/components/legacy/data-table/data-table-head";
import EmptyState from "@/components/ui/empty-state";
import PageTitle from "@/components/ui/page-title";

interface UsersPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function UsersPage({ params }: UsersPageProps) {
  const { id } = await params;

  const { user } = await requireCurrentUser();
  const isAdmin = user.role === ADMIN_ROLE;
  
  if (!isAdmin && user.schoolId !== id) {
    notFound();
  }

  const [school, users] = await Promise.all([
    getSchool(id),
    getUsersBySchool(id),
  ]);

  const title = await t("schoolUsers.title");
  const description = await t("schoolUsers.description");
  const addUser = await t("schoolUsers.addUser");
  const emptyTitle = await t("schoolUsers.emptyTitle");
  const emptyDescription = await t("schoolUsers.emptyDescription");
  const heading = await t("schoolUsers.heading");
  const totalUsers = (await t("schoolUsers.totalUsers")).replace("{count}", String(users.length));
  const tableHeaderUser = await t("schoolUsers.tableHeaderUser");
  const tableHeaderEmail = await t("schoolUsers.tableHeaderEmail");
  const tableHeaderRole = await t("schoolUsers.tableHeaderRole");
  const tableHeaderPlan = await t("schoolUsers.tableHeaderPlan");
  const tableHeaderActions = await t("schoolUsers.tableHeaderActions");
  const unnamedUser = await t("schoolUsers.unnamedUser");

  return (
    <div className="space-y-8">
      <PageTitle
        title={title}
        description={description}
      />

      {isAdmin && (
        <div className="flex justify-end">
          <Link
            href={`/dashboard/schools/${id}/users/new`}
            className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            {addUser}
          </Link>
        </div>
      )}

{users.length === 0 ? (
  <EmptyState
    title={emptyTitle}
    description={emptyDescription}
  />
) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900">{heading}</h2>

              <p className="mt-1 text-sm text-slate-500">
                {totalUsers}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {isAdmin && (
                <Link
                  href={`/dashboard/schools/${id}/users/new`}
                  className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  {addUser}
                </Link>
              )}

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
                <Users size={22} />
              </div>
            </div>
          </div>

          <DataTable>
            <DataTableHead>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                {tableHeaderUser}
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                {tableHeaderEmail}
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                {tableHeaderRole}
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                {tableHeaderPlan}
              </th>

              <th className="px-6 py-4 text-center text-sm font-semibold text-slate-600">
                {tableHeaderActions}
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
                          {user.name ?? unnamedUser}
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
                        user.role === ADMIN_ROLE
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
                        school?.subscription?.plan === "PRO"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {school?.subscription?.plan ?? "TRIAL"}
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

                      {isAdmin && (
                        <>
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
                        </>
                      )}
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

