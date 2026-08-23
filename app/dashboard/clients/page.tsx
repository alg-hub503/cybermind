import { requireCurrentUser } from "@/lib/require-current-user";
import { ADMIN_ROLE } from "@/lib/constants";
import { getClients, getClientsBySchool } from "@/lib/features/clients/client-actions";
import { t } from "@/lib/i18n/server";
import Link from "next/link";
import ClientForm from "./ClientForm";
import EditClientButton from "./EditClientButton";
import DeleteClientButton from "./DeleteClientButton";
import DataTable, { DataTableRow, DataTableCell } from "@/components/ui/data-table";

export default async function ClientsPage() {
  const { user } = await requireCurrentUser();

  const isAdmin = user.role === ADMIN_ROLE;

  const clients = isAdmin
    ? await getClients()
    : user.schoolId
      ? await getClientsBySchool(user.schoolId)
      : [];

  const title = await t("clients.title");
  const description = await t("clients.description");
  const nameLabel = await t("clients.name");
  const schoolLabel = await t("clients.school");
  const actionsLabel = await t("clients.actions");

  const columns = [
    { key: "name", header: nameLabel, width: "40%" },
    { key: "school", header: schoolLabel, width: "40%" },
    { key: "actions", header: actionsLabel, width: "20%", align: "center" as const },
  ];

  return (
    <main className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-gray-500">{description}</p>
      </div>

      {isAdmin ? (
        <ClientForm />
      ) : user.schoolId ? (
        <ClientForm schoolId={user.schoolId} />
      ) : null}

      <div className="mt-6">
        <DataTable columns={columns}>
          {clients.map((client) => (
            <DataTableRow key={client.id}>
              <DataTableCell className="font-medium">
                <Link
                  href={`/dashboard/clients/${client.id}`}
                  className="text-indigo-600 hover:underline"
                >
                  {client.name}
                </Link>
              </DataTableCell>
              <DataTableCell className="text-slate-500">
                {client.School?.name ?? "—"}
              </DataTableCell>
              <DataTableCell align="center">
                <div className="flex justify-center gap-2">
                  <EditClientButton id={client.id} currentName={client.name} />
                  <DeleteClientButton id={client.id} />
                </div>
              </DataTableCell>
            </DataTableRow>
          ))}
        </DataTable>
      </div>
    </main>
  );
}
