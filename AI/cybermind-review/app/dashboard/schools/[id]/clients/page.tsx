import { prisma } from "@/lib/prisma";

import PageTitle from "@/components/ui/page-title";
import EmptyState from "@/components/ui/empty-state";
import DataTable from "@/components/ui/data-table";
import DataTableHead from "@/components/ui/data-table-head";
import DataTableBody from "@/components/ui/data-table-body";

interface ClientsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ClientsPage({
  params,
}: ClientsPageProps) {
  const { id } = await params;

  const clients = await prisma.client.findMany({
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
        title="School Clients"
        description="Manage clients belonging to this school."
      />

      {clients.length === 0 ? (
        <EmptyState
          title="No clients found"
          description="There are no clients assigned to this school."
        />
      ) : (
        <DataTable>
          <DataTableHead>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
              Client
            </th>

            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
              Client ID
            </th>
          </DataTableHead>

          <DataTableBody>
            {clients.map((client) => (
              <tr
                key={client.id}
                className="border-b border-slate-100 hover:bg-slate-50"
              >
                <td className="px-6 py-4 font-medium">
                  {client.name}
                </td>

                <td className="px-6 py-4 text-slate-500">
                  {client.id}
                </td>
              </tr>
            ))}
          </DataTableBody>
        </DataTable>
      )}
    </div>
  );
}