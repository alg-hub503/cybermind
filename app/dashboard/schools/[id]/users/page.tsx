import { notFound } from "next/navigation";
import { Eye, Pencil, Trash2, Users } from "lucide-react";
import Link from "next/link";

import { ADMIN_ROLE } from "@/lib/constants";
import { requireCurrentUser } from "@/lib/require-current-user";
import { getSchool } from "@/lib/features/schools/school-actions";
import { getUsersBySchool } from "@/lib/features/users/user-actions";
import { t } from "@/lib/i18n/server";

import DataTable, { DataTableRow, DataTableCell } from "@/components/ui/data-table";
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

  const columns = [
    { key: "user", header: tableHeaderUser, width: "25%" },
    { key: "email", header: tableHeaderEmail, width: "30%" },
    { key: "role", header: tableHeaderRole, width: "15%" },
    { key: "plan", header: tableHeaderPlan, width: "15%" },
    { key: "actions", header: tableHeaderActions, width: "15%", align: "center" as const },
  ];

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
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">{heading}</h2>
              <p className="mt-1 text-sm text-slate-500">{totalUsers}</p>
            </div>
            {isAdmin && (
              <Link
                href={`/dashboard/schools/${id}/users/new`}
                className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                {addUser}
              </Link>
            )}
          </div>

          <DataTable columns={columns}>
            {users.map((user) => (
              <DataTableRow key={user.id}>
                <DataTableCell>
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
                </DataTableCell>
                <DataTableCell className="text-slate-600">{user.email}</DataTableCell>
                <DataTableCell>
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      user.role === ADMIN_ROLE
                        ? "bg-indigo-100 text-indigo-700"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {user.role}
                  </span>
                </DataTableCell>
                <DataTableCell>
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      school?.subscription?.plan === "PRO"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {school?.subscription?.plan ?? "TRIAL"}
                  </span>
                </DataTableCell>
                <DataTableCell align="center">
                  <div className="flex items-center justify-center gap-2">
                    <Link
                      href={`/dashboard/users/${user.id}`}
                      title="View"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-500 text-white transition hover:bg-slate-600"
                    >
                      <Eye size={16} />
                    </Link>

                    {isAdmin && (
                      <>
                        <Link
                          href={`/dashboard/users/${user.id}/edit`}
                          title="Edit"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-500 text-white transition hover:bg-yellow-600"
                        >
                          <Pencil size={16} />
                        </Link>

                        <button
                          title="Delete"
                          type="button"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 text-white transition hover:bg-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </DataTableCell>
              </DataTableRow>
            ))}
          </DataTable>
        </div>
      )}
    </div>
  );
}
