import { requireCurrentUser } from "@/lib/require-current-user";
import { ADMIN_ROLE } from "@/lib/constants";
import { getInvoices, getInvoicesBySchool } from "@/lib/features/invoices/invoice-actions";
import { getClientsBySchool } from "@/lib/features/clients/client-actions";
import { getStudentsBySchool } from "@/lib/features/students/student-actions";
import { t } from "@/lib/i18n/server";
import InvoiceForm from "./InvoiceForm";
import DeleteInvoiceButton from "./DeleteInvoiceButton";
import DataTable, { DataTableRow, DataTableCell } from "@/components/ui/data-table";

export default async function InvoicesPage() {
  const [invoicesTitle, invoicesDescription, tableHeaderBilledTo, tableHeaderAmount, tableHeaderDate, tableHeaderActions] = await Promise.all([
    t("invoices.title"),
    t("invoices.description"),
    t("invoices.tableHeaderBilledTo"),
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

  const students = user.schoolId
    ? await getStudentsBySchool(user.schoolId)
    : [];

  const columns = [
    { key: "billedTo", header: tableHeaderBilledTo, width: "30%" },
    { key: "amount", header: tableHeaderAmount, width: "20%" },
    { key: "date", header: tableHeaderDate, width: "40%" },
    { key: "actions", header: tableHeaderActions, width: "10%", align: "center" as const },
  ];

  return (
    <main className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{invoicesTitle}</h1>
        <p className="text-gray-500">{invoicesDescription}</p>
      </div>

      <InvoiceForm
        clients={clients.map((c) => ({ id: c.id, name: c.name }))}
        students={students.map((s) => ({ id: s.id, firstName: s.firstName, lastName: s.lastName }))}
        schoolId={user.schoolId ?? ""}
      />

      <div className="mt-6">
        <DataTable columns={columns}>
          {invoices.map((invoice) => (
            <DataTableRow key={invoice.id}>
              <DataTableCell className="font-medium">
                {invoice.Client?.name ?? (invoice.Student ? `${invoice.Student.firstName} ${invoice.Student.lastName}` : "—")}
              </DataTableCell>
              <DataTableCell>${invoice.amount.toFixed(2)}</DataTableCell>
              <DataTableCell className="text-slate-500">{invoice.createdAt.toLocaleDateString()}</DataTableCell>
              <DataTableCell align="center">
                <div className="flex justify-center">
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
