import { notFound } from "next/navigation";
import { requireResourceAccess } from "@/lib/authorization";
import { getInvoiceWithDetails } from "@/lib/features/invoices/invoice-actions";
import { getClientsBySchool } from "@/lib/features/clients/client-actions";
import { getStudentsBySchool } from "@/lib/features/students/student-actions";
import { t } from "@/lib/i18n/server";
import Link from "next/link";
import InvoiceForm from "../InvoiceForm";

interface InvoiceDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ edit?: string }>;
}

export default async function InvoiceDetailPage({ params, searchParams }: InvoiceDetailPageProps) {
  const { id } = await params;
  const { edit } = await searchParams;
  const isEdit = edit === "true";

  const invoice = await getInvoiceWithDetails(id);

  if (!invoice) {
    notFound();
  }

  try {
    await requireResourceAccess(invoice);
  } catch {
    notFound();
  }

  if (isEdit) {
    const [clients, students] = await Promise.all([
      getClientsBySchool(invoice.schoolId),
      getStudentsBySchool(invoice.schoolId),
    ]);

    return (
      <main className="p-6">
        <div className="mb-6">
          <Link
            href={`/dashboard/invoices/${id}`}
            className="text-sm text-indigo-600 hover:underline"
          >
            ← {await t("invoices.detail.backToInvoice")}
          </Link>
          <h1 className="mt-2 text-2xl font-bold">{await t("invoices.detail.editInvoice")}</h1>
        </div>

        <InvoiceForm
          clients={clients.map((c) => ({ id: c.id, name: c.name }))}
          students={students.map((s) => ({ id: s.id, firstName: s.firstName, lastName: s.lastName }))}
          schoolId={invoice.schoolId}
          mode="edit"
          existing={invoice}
        />
      </main>
    );
  }

  const [
    backLink,
    invoiceLabel,
    amountLabel,
    statusLabel,
    billedToLabel,
    schoolLabel,
    dueDateLabel,
    periodLabel,
    createdLabel,
    clientLabel,
    studentLabel,
    noOwner,
  ] = await Promise.all([
    t("invoices.detail.backToInvoices"),
    t("invoices.detail.invoice"),
    t("invoices.detail.amount"),
    t("invoices.detail.status"),
    t("invoices.detail.billedTo"),
    t("invoices.detail.school"),
    t("invoices.detail.dueDate"),
    t("invoices.detail.period"),
    t("invoices.detail.created"),
    t("invoices.detail.client"),
    t("invoices.detail.student"),
    t("invoices.detail.noOwner"),
  ]);

  const ownerName = invoice.Client?.name
    ?? (invoice.Student
      ? `${invoice.Student.firstName} ${invoice.Student.lastName}`
      : null);

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
      case "DRAFT":
        return "bg-slate-100 text-slate-600";
      case "PARTIALLY_PAID":
        return "bg-amber-100 text-amber-700";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const renderDate = (date: Date | null) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <main className="p-6">
      <div className="mb-6">
        <Link
          href="/dashboard/invoices"
          className="text-sm text-indigo-600 hover:underline"
        >
          ← {backLink}
        </Link>
        <h1 className="mt-2 text-2xl font-bold">{invoiceLabel}</h1>
        <p className="text-gray-500">{invoice.id}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">{invoiceLabel}</h2>

          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-slate-500">{amountLabel}</dt>
              <dd className="mt-1 text-2xl font-bold text-slate-900">
                {invoice.amount.toLocaleString()}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-slate-500">{statusLabel}</dt>
              <dd className="mt-1">
                <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor(invoice.status)}`}>
                  {invoice.status}
                </span>
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-slate-500">{billedToLabel}</dt>
              <dd className="mt-1 text-sm text-slate-900">
                {ownerName ? (
                  <span>
                    {invoice.Client ? `${clientLabel}: ` : `${studentLabel}: `}
                    {ownerName}
                  </span>
                ) : (
                  <span className="text-slate-400">{noOwner}</span>
                )}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-slate-500">{schoolLabel}</dt>
              <dd className="mt-1 text-sm text-slate-900">
                {invoice.School?.name ?? "—"}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-slate-500">{dueDateLabel}</dt>
              <dd className="mt-1 text-sm text-slate-900">
                {renderDate(invoice.dueDate) ?? "—"}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-slate-500">{periodLabel}</dt>
              <dd className="mt-1 text-sm text-slate-900">
                {invoice.period ?? "—"}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-slate-500">{createdLabel}</dt>
              <dd className="mt-1 text-sm text-slate-900">
                {renderDate(invoice.createdAt)}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </main>
  );
}
