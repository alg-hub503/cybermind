interface Client {
  id: string;
  name: string;
}

interface RecentClientsProps {
  clients: Client[];
}

export default function RecentClients({
  clients,
}: RecentClientsProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-xl font-semibold text-slate-900">
        Recent Clients
      </h2>

      {clients.length === 0 ? (
        <p className="text-slate-500">
          No clients found.
        </p>
      ) : (
        <div className="space-y-4">
          {clients.map((client) => (
            <div
              key={client.id}
              className="flex items-center justify-between rounded-xl border border-slate-100 p-4"
            >
              <div>
                <p className="font-medium text-slate-900">
                  {client.name}
                </p>

                <p className="text-sm text-slate-500">
                  Client ID: {client.id.slice(0, 8)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}