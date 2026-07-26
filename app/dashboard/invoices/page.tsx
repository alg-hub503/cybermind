import { requireCurrentUser } from "@/lib/require-current-user";
import { ADMIN_ROLE } from "@/lib/constants";
import { getInvoices, getInvoicesBySchool } from "@/lib/features/invoices/invoice-actions";
import { getClientsBySchool } from "@/lib/features/clients/client-actions";
import InvoiceForm from "./InvoiceForm";
import DeleteInvoiceButton from "./DeleteInvoiceButton";

export default async function InvoicesPage() {
  const { user } = await requireCurrentUser();

  const invoices = user.role === ADMIN_ROLE
    ? await getInvoices()
    : user.schoolId
      ? await getInvoicesBySchool(user.schoolId)
      : [];

  const clients = user.schoolId
    ? await getClientsBySchool(user.schoolId)
    : [];

  return (
    <main className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <p className="text-gray-500">Manage your invoices</p>
      </div>

      <InvoiceForm
        clients={clients.map((c) => ({ id: c.id, name: c.name }))}
        schoolId={user.schoolId ?? ""}
      />

      <div className="rounded-lg border bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="p-3 text-left">Client</th>
              <th className="p-3 text-left">Amount</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="border-b">
                <td className="p-3">{invoice.clientId}</td>
                <td className="p-3">${invoice.amount.toFixed(2)}</td>
                <td className="p-3">{invoice.createdAt.toLocaleDateString()}</td>
                <td className="flex justify-end gap-2 p-3">
                  <DeleteInvoiceButton id={invoice.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
