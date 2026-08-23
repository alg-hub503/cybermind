import { notFound } from "next/navigation";
import { requireResourceAccess } from "@/lib/authorization";
import { getClientWithDetails } from "@/lib/features/clients/client-actions";
import { t } from "@/lib/i18n/server";
import Link from "next/link";

interface ClientDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ClientDetailPage({ params }: ClientDetailPageProps) {
  const { id } = await params;
  const client = await getClientWithDetails(id);

  try {
    await requireResourceAccess(client);
  } catch {
    notFound();
  }

  if (!client) {
    notFound();
  }

  const title = await t("clients.detail.invoices");
  const amountLabel = await t("clients.detail.amount");
  const statusLabel = await t("clients.detail.status");
  const dueDateLabel = await t("clients.detail.dueDate");
  const createdLabel = await t("clients.detail.created");
  const noInvoices = await t("clients.detail.noInvoices");
  const schoolLabel = await t("clients.detail.school");
  const backLink = await t("clients.detail.backToClients");

  const renderDate = (date: Date | null) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-emerald-100 text-emerald-700";
      case "ISSUED":
        return "bg-blue-100 text-blue-700";
      case "OVERDUE":
        return "bg-red-100 text-red-700";
      case "CANCELED":
        return "bg-slate-100 text-slate-500";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  return (
    <main className="p-6">
      <div className="mb-6">
        <Link
          href="/dashboard/clients"
          className="text-sm text-indigo-600 hover:underline"
        >
          ← {backLink}
        </Link>
        <h1 className="mt-2 text-2xl font-bold">{client.name}</h1>
        <p className="text-gray-500">{schoolLabel} {client.School?.name ?? "—"}</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">{title}</h2>
        {client.Invoice.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">
            {noInvoices}
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full min-w-[640px] table-fixed text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-medium text-slate-500">
                  <th className="w-1/4 px-4 py-3 text-start">{amountLabel}</th>
                  <th className="w-1/4 px-4 py-3 text-start">{statusLabel}</th>
                  <th className="w-1/4 px-4 py-3 text-start">{dueDateLabel}</th>
                  <th className="w-1/4 px-4 py-3 text-start">{createdLabel}</th>
                </tr>
              </thead>
              <tbody>
                {client.Invoice.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-slate-50 last:border-0">
                    <td className="px-4 py-4 font-semibold text-slate-900">
                      {invoice.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-500">
                      {renderDate(invoice.dueDate) ?? "—"}
                    </td>
                    <td className="px-4 py-4 text-slate-500">
                      {renderDate(invoice.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
