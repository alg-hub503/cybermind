import Card from "@/components/cards/card";

interface Client {
  id: string;
  name: string;
}

interface SchoolClientsProps {
  clients: Client[];
}

export default function SchoolClients({
  clients,
}: SchoolClientsProps) {
  return (
    <Card>
      <h3 className="mb-4 text-lg font-semibold">
        Recent Clients
      </h3>

      <div className="space-y-3">
        {clients.length === 0 ? (
          <p className="text-slate-500">
            No clients yet.
          </p>
        ) : (
          clients.map((client) => (
            <div
              key={client.id}
              className="rounded-xl border border-slate-200 p-3"
            >
              <p className="font-semibold">
                {client.name}
              </p>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}