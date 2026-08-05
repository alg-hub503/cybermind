import { requireCurrentUser } from "@/lib/require-current-user";
import { ADMIN_ROLE } from "@/lib/constants";
import { getInvoices, getInvoicesBySchool } from "@/lib/features/invoices/invoice-actions";
import { getClientsBySchool } from "@/lib/features/clients/client-actions";
import { t } from "@/lib/i18n/server";
import InvoiceForm from "./InvoiceForm";
import DeleteInvoiceButton from "./DeleteInvoiceButton";

export default async function InvoicesPage() {
  const [invoicesTitle, invoicesDescription, tableHeaderClient, tableHeaderAmount, tableHeaderDate, tableHeaderActions] = await Promise.all([
    t("invoices.title"),
    t("invoices.description"),
    t("invoices.tableHeaderClient"),
    t("invoices.tableHeaderAmount"),
    t("invoices.tableHeaderDate"),
    t("invoices.tableHeaderActions"),
  ]);

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
        <h1 className="text-2xl font-bold">{invoicesTitle}</h1>
        <p className="text-gray-500">{invoicesDescription}</p>
      </div>

      <InvoiceForm
        clients={clients.map((c) => ({ id: c.id, name: c.name }))}
        schoolId={user.schoolId ?? ""}
      />

      <div className="rounded-lg border bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="p-3 text-left">{tableHeaderClient}</th>
              <th className="p-3 text-left">{tableHeaderAmount}</th>
              <th className="p-3 text-left">{tableHeaderDate}</th>
              <th className="p-3 text-right">{tableHeaderActions}</th>
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
