interface Invoice {
  id: string;
  amount: number;
  createdAt: Date;
}

interface RecentInvoicesProps {
  invoices: Invoice[];
}

export default function RecentInvoices({
  invoices,
}: RecentInvoicesProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-xl font-semibold text-slate-900">
        Latest Invoices
      </h2>

      {invoices.length === 0 ? (
        <p className="text-slate-500">
          No invoices found.
        </p>
      ) : (
        <div className="space-y-4">
          {invoices.map((invoice) => (
            <div
              key={invoice.id}
              className="flex items-center justify-between rounded-xl border border-slate-100 p-4"
            >
              <div>
                <p className="font-medium text-slate-900">
                  ${invoice.amount.toFixed(2)}
                </p>

                <p className="text-sm text-slate-500">
                  {invoice.createdAt.toLocaleDateString()}
                </p>
              </div>

              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                Paid
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}