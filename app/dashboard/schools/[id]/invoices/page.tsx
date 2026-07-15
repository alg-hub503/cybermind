import { prisma } from "@/lib/prisma";

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

  const invoices = await prisma.invoice.findMany({
    where: {
      schoolId: id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-8">
      <PageTitle
        title="School Invoices"
        description="Manage invoices belonging to this school."
      />

      {invoices.length === 0 ? (
        <EmptyState
          title="No invoices found"
          description="There are no invoices for this school."
        />
      ) : (
        <DataTable>
          <DataTableHead>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
              Invoice
            </th>

            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
              Amount
            </th>

            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
              Created
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
