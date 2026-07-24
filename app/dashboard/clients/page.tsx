import { getClients } from "@/lib/features/clients/client-actions";

export default async function ClientsPage() {
  const clients = await getClients();

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-6">Clients</h1>

      <div className="rounded-lg border bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">School</th>
            </tr>
          </thead>

          <tbody>
            {clients.map((client) => (
              <tr key={client.id} className="border-b">
                <td className="p-3">{client.name}</td>
                <td className="p-3">{client.schoolId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
