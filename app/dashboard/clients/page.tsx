import { requireCurrentUser } from "@/lib/require-current-user";
import { ADMIN_ROLE } from "@/lib/constants";
import { getClients, getClientsBySchool } from "@/lib/features/clients/client-actions";
import { t } from "@/lib/i18n/server";
import ClientForm from "./ClientForm";
import EditClientButton from "./EditClientButton";
import DeleteClientButton from "./DeleteClientButton";

export default async function ClientsPage() {
  const { user } = await requireCurrentUser();

  const clients = user.role === ADMIN_ROLE
    ? await getClients()
    : user.schoolId
      ? await getClientsBySchool(user.schoolId)
      : [];

  const title = await t("clients.title");
  const description = await t("clients.description");
  const nameLabel = await t("clients.name");
  const schoolLabel = await t("clients.school");
  const actionsLabel = await t("clients.actions");

  return (
    <main className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-gray-500">{description}</p>
      </div>

      <ClientForm />

      <div className="rounded-lg border bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="p-3 text-left">{nameLabel}</th>
              <th className="p-3 text-left">{schoolLabel}</th>
              <th className="p-3 text-right">{actionsLabel}</th>
            </tr>
          </thead>

          <tbody>
            {clients.map((client) => (
              <tr key={client.id} className="border-b">
                <td className="p-3">{client.name}</td>
                <td className="p-3">{client.schoolId}</td>
                <td className="flex justify-end gap-2 p-3">
                  <EditClientButton id={client.id} currentName={client.name} />
                  <DeleteClientButton id={client.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
