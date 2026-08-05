import { requireCurrentUser } from "@/lib/require-current-user";
import { ADMIN_ROLE } from "@/lib/constants";
import { getInvoices, getInvoicesBySchool } from "@/lib/features/invoices/invoice-actions";
import { getClientsBySchool } from "@/lib/features/clients/client-actions";
import { t } from "@/lib/i18n/server";
import InvoiceForm from "./InvoiceForm";
import DeleteInvoiceButton from "./DeleteInvoiceButton";
import DataTable, { DataTableRow, DataTableCell } from "@/components/ui/data-table";

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

  const columns = [
    { key: "client", header: tableHeaderClient, width: "30%" },
    { key: "amount", header: tableHeaderAmount, width: "20%" },
    { key: "date", header: tableHeaderDate, width: "35%" },
    { key: "actions", header: tableHeaderActions, width: "15%", align: "right" as const },
  ];

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

      <div className="mt-6">
        <DataTable columns={columns}>
          {invoices.map((invoice) => (
            <DataTableRow key={invoice.id}>
              <DataTableCell className="font-medium">{invoice.clientId}</DataTableCell>
              <DataTableCell>${invoice.amount.toFixed(2)}</DataTableCell>
              <DataTableCell className="text-slate-500">{invoice.createdAt.toLocaleDateString()}</DataTableCell>
              <DataTableCell align="right">
                <div className="flex justify-end gap-2">
                  <DeleteInvoiceButton id={invoice.id} />
                </div>
              </DataTableCell>
            </DataTableRow>
          ))}
        </DataTable>
      </div>
    </main>
  );
}
