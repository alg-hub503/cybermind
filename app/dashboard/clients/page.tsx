import { requireCurrentUser } from "@/lib/require-current-user";
import { getClients } from "@/lib/features/clients/client-actions";
import ClientForm from "./ClientForm";
import EditClientButton from "./EditClientButton";
import DeleteClientButton from "./DeleteClientButton";

export default async function ClientsPage() {
  await requireCurrentUser();
  const clients = await getClients();

  return (
    <main className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Clients</h1>
        <p className="text-gray-500">Manage your clients</p>
      </div>

      <ClientForm />

      <div className="rounded-lg border bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">School</th>
              <th className="p-3 text-right">Actions</th>
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
