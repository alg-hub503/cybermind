import Card from "@/components/cards/card";

interface TopClient {
  id: string;
  name: string;
  revenue: number;
  invoices: number;
}

interface TopClientsProps {
  clients: TopClient[];
}

export default function TopClients({
  clients,
}: TopClientsProps) {
  return (
    <Card>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900">
          Top Clients
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Highest revenue clients.
        </p>
      </div>

      {clients.length === 0 ? (
        <p className="text-slate-500">
          No clients found.
        </p>
      ) : (
        <div className="space-y-4">
          {clients.map((client, index) => (
            <div
              key={client.id}
              className="flex items-center justify-between rounded-xl border border-slate-200 p-4"
            >
              <div>
                <p className="font-semibold text-slate-900">
                  #{index + 1} {client.name}
                </p>

                <p className="text-sm text-slate-500">
                  {client.invoices} invoice
                  {client.invoices !== 1 ? "s" : ""}
                </p>
              </div>

              <div className="text-right">
                <p className="text-lg font-bold text-emerald-600">
                  $
                  {client.revenue.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
