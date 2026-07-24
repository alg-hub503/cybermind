import Card from "@/components/cards/card";

interface LatestInvoice {
  id: string;
  amount: number;
  createdAt: Date;
  Client: {
    name: string;
  };
}

interface LatestInvoicesProps {
  invoices: LatestInvoice[];
}

export default function LatestInvoices({
  invoices,
}: LatestInvoicesProps) {
  return (
    <Card>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900">
          Latest Invoices
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Most recent invoices.
        </p>
      </div>

      {invoices.length === 0 ? (
        <p className="text-slate-500">
          No invoices found.
        </p>
      ) : (
        <div className="space-y-4">
          {invoices.map((invoice) => (
            <div
              key={invoice.id}
              className="flex items-center justify-between rounded-xl border border-slate-200 p-4"
            >
              <div>
                <p className="font-semibold text-slate-900">
                  {invoice.Client.name}
                </p>

                <p className="text-sm text-slate-500">
                  {new Date(invoice.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="text-right">
                <p className="font-bold text-emerald-600">
                  $
                  {invoice.amount.toLocaleString(undefined, {
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
