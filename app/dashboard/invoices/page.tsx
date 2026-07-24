import { getInvoices } from "@/lib/features/invoices/invoice-actions";

export default async function InvoicesPage() {
  const invoices = await getInvoices();

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-6">Invoices</h1>

      <div className="rounded-lg border bg-white">
        {invoices.map((invoice) => (
          <div key={invoice.id} className="border-b p-3">
            ${invoice.amount}
          </div>
        ))}
      </div>
    </main>
  );
}
