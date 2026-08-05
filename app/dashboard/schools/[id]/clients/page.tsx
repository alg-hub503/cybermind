import { notFound } from "next/navigation";

import { ADMIN_ROLE } from "@/lib/constants";
import { requireCurrentUser } from "@/lib/require-current-user";
import { getClientsBySchool } from "@/lib/features/clients/client-actions";
import { t } from "@/lib/i18n/server";

import PageTitle from "@/components/ui/page-title";
import EmptyState from "@/components/ui/empty-state";
import DataTable from "@/components/legacy/data-table/data-table";
import DataTableHead from "@/components/legacy/data-table/data-table-head";
import DataTableBody from "@/components/legacy/data-table/data-table-body";

interface ClientsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ClientsPage({
  params,
}: ClientsPageProps) {
  const { id } = await params;

  const { user } = await requireCurrentUser();
  if (user.role !== ADMIN_ROLE && user.schoolId !== id) {
    notFound();
  }

  const clients = await getClientsBySchool(id);

  const title = await t("schoolClients.title");
  const description = await t("schoolClients.description");
  const emptyTitle = await t("schoolClients.emptyTitle");
  const emptyDescription = await t("schoolClients.emptyDescription");
  const tableHeaderClient = await t("schoolClients.tableHeaderClient");
  const tableHeaderClientId = await t("schoolClients.tableHeaderClientId");

  return (
    <div className="space-y-8">
      <PageTitle
        title={title}
        description={description}
      />

      {clients.length === 0 ? (
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
        />
      ) : (
        <DataTable>
          <DataTableHead>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
              {tableHeaderClient}
            </th>

            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
              {tableHeaderClientId}
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
