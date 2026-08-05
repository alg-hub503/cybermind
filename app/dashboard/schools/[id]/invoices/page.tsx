import { notFound } from "next/navigation";

import { ADMIN_ROLE } from "@/lib/constants";
import { requireCurrentUser } from "@/lib/require-current-user";
import { getInvoicesBySchool } from "@/lib/features/invoices/invoice-actions";
import { t } from "@/lib/i18n/server";

import PageTitle from "@/components/ui/page-title";
import EmptyState from "@/components/ui/empty-state";
import DataTable from "@/components/legacy/data-table/data-table";
import DataTableHead from "@/components/legacy/data-table/data-table-head";
import DataTableBody from "@/components/legacy/data-table/data-table-body";

interface InvoicesPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function InvoicesPage({
  params,
}: InvoicesPageProps) {
  const { id } = await params;

  const { user } = await requireCurrentUser();
  if (user.role !== ADMIN_ROLE && user.schoolId !== id) {
    notFound();
  }

  const invoices = await getInvoicesBySchool(id);

  const title = await t("schoolInvoices.title");
  const description = await t("schoolInvoices.description");
  const emptyTitle = await t("schoolInvoices.emptyTitle");
  const emptyDescription = await t("schoolInvoices.emptyDescription");
  const tableHeaderInvoice = await t("schoolInvoices.tableHeaderInvoice");
  const tableHeaderAmount = await t("schoolInvoices.tableHeaderAmount");
  const tableHeaderCreated = await t("schoolInvoices.tableHeaderCreated");

  return (
    <div className="space-y-8">
      <PageTitle
        title={title}
        description={description}
      />

      {invoices.length === 0 ? (
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
        />
      ) : (
        <DataTable>
          <DataTableHead>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
              {tableHeaderInvoice}
            </th>

            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
              {tableHeaderAmount}
            </th>

            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
              {tableHeaderCreated}
            </th>
          </DataTableHead>

          <DataTableBody>
            {invoices.map((invoice) => (
              <tr
                key={invoice.id}
                className="border-b border-slate-100 hover:bg-slate-50"
              >
                <td className="px-6 py-4 font-medium">
                  {invoice.id}
                </td>

                <td className="px-6 py-4 text-slate-500">
                  ${invoice.amount.toFixed(2)}
                </td>

                <td className="px-6 py-4 text-slate-500">
                  {invoice.createdAt.toLocaleDateString()}
                </td>
              </tr>
            ))}
          </DataTableBody>
        </DataTable>
      )}
    </div>
  );
}
