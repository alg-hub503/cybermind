import { prisma } from "@/lib/prisma";

import PageTitle from "@/components/ui/page-title";
import EmptyState from "@/components/ui/empty-state";
import DataTable from "@/components/ui/data-table";
import DataTableHead from "@/components/ui/data-table-head";
import DataTableBody from "@/components/ui/data-table-body";

interface UsersPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function UsersPage({
  params,
}: UsersPageProps) {
  const { id } = await params;

  const users = await prisma.user.findMany({
    where: {
      schoolId: id,
    },
    orderBy: {
      name: "asc",
    },
  });

  return (
    <div className="space-y-8">
      <PageTitle
        title="School Users"
        description="Manage users belonging to this school."
      />

      {users.length === 0 ? (
        <EmptyState
          title="No users found"
          description="There are no users assigned to this school."
        />
      ) : (
        <DataTable>
          <DataTableHead>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
              Name
            </th>

            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
              Email
            </th>

            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
              Role
            </th>
          </DataTableHead>

          <DataTableBody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b border-slate-100 hover:bg-slate-50"
              >
                <td className="px-6 py-4 font-medium">
                  {user.name ?? "-"}
                </td>

                <td className="px-6 py-4 text-slate-500">
                  {user.email}
                </td>

                <td className="px-6 py-4">
                  <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                    {user.role}
                  </span>
                </td>
              </tr>
            ))}
          </DataTableBody>
        </DataTable>
      )}
    </div>
  );
}