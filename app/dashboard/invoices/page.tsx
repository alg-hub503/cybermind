import Card from "@/components/cards/card";

import { prisma } from "@/lib/prisma";
import { getInvoices } from "@/lib/services/invoice.service";

import InvoiceForm from "./InvoiceForm";
import DeleteInvoiceButton from "./DeleteInvoiceButton";

interface InvoicesPageProps {
  searchParams: Promise<{
    search?: string;
  }>;
}

export default async function InvoicesPage({
  searchParams,
}: InvoicesPageProps) {
  const params = await searchParams;

  const search = params.search ?? "";

  const [invoices, clients] = await Promise.all([
    getInvoices(undefined, search),

    prisma.client.findMany({
      orderBy: {
        name: "asc",
      },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Invoices
        </h1>

        <p className="mt-2 text-slate-500">
          Manage your invoices.
        </p>
      </div>

      <Card>
        <p className="text-sm text-slate-500">
          Total Invoices
        </p>

        <h2 className="mt-2 text-3xl font-bold text-slate-900">
          {invoices.length}
        </h2>
      </Card>

      <InvoiceForm clients={clients} />

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="min-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold">
                Invoice ID
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold">
                Client
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold">
                Amount
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold">
                Date
              </th>

              <th className="px-6 py-4 text-right text-sm font-semibold">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {invoices.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-slate-500"
                >
                  No invoices found.
                </td>
              </tr>
            ) : (
              invoices.map((invoice) => (
                <tr
                  key={invoice.id}
                  className="border-t border-slate-200"
                >
                  <td className="px-6 py-4 font-mono text-sm">
                    {invoice.id}
                  </td>

                  <td className="px-6 py-4">
                    {invoice.Client.name}
                  </td>

                  <td className="px-6 py-4">
                    ${invoice.amount.toFixed(2)}
                  </td>

                  <td className="px-6 py-4">
                    {new Date(
                      invoice.createdAt
                    ).toLocaleDateString()}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <DeleteInvoiceButton
                      id={invoice.id}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}