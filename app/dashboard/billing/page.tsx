import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/get-server-session";

import { hasActiveAccess } from "@/lib/subscription-status";
import { getSchoolById } from "@/lib/services/domain/school.service";
import { getBillingStatus } from "@/lib/services/application/billing/get-billing-status";
import { listInvoices } from "@/lib/services/application/billing/list-invoices";
import { exportBilling } from "@/lib/services/application/billing/export-billing";
import { t } from "@/lib/i18n/server";

import Card from "@/components/cards/card";
import PageTitle from "@/components/ui/page-title";
import StatCard from "@/components/ui/stat-card";
import EmptyState from "@/components/ui/empty-state";
import BillingActions from "./billing-actions";

const INVOICE_BADGE: Record<string, string> = {
  paid: "bg-emerald-100 text-emerald-700",
  open: "bg-amber-100 text-amber-700",
  draft: "bg-slate-100 text-slate-700",
  void: "bg-red-100 text-red-700",
  uncollectible: "bg-red-100 text-red-700",
};

function subscriptionStatusKey(status: string | null): string {
  switch (status) {
    case "TRIALING":
      return "billing.statusTrialing";
    case "ACTIVE":
      return "billing.statusActive";
    case "CANCELED":
      return "billing.statusCanceled";
    case "PAST_DUE":
      return "billing.statusPastDue";
    case "UNPAID":
      return "billing.statusUnpaid";
    case "INCOMPLETE":
      return "billing.statusIncomplete";
    case "INCOMPLETE_EXPIRED":
      return "billing.statusIncompleteExpired";
    case "PAUSED":
      return "billing.statusPaused";
    default:
      return "billing.statusUnknown";
  }
}

function invoiceStatusKey(status: string): string | null {
  switch (status) {
    case "paid":
      return "billing.invoiceStatusPaid";
    case "open":
      return "billing.invoiceStatusOpen";
    case "draft":
      return "billing.invoiceStatusDraft";
    case "void":
      return "billing.invoiceStatusVoid";
    default:
      return null;
  }
}

export default async function BillingPage() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/login");
  }

  const isAdmin = session.user.role === "ADMIN";

  if (!isAdmin && !session.user.schoolId) {
    redirect("/dashboard/schools");
  }

  if (isAdmin && !session.user.schoolId) {
    return (
      <div className="space-y-8">
        <PageTitle
          title={await t("billing.title")}
          description={await t("billing.description")}
        />
        <EmptyState
          title={await t("billing.selectSchoolTitle")}
          description={await t("billing.selectSchoolDescription")}
        />
      </div>
    );
  }

  const school = await getSchoolById(session.user.schoolId!);

  if (!isAdmin && (!school || !hasActiveAccess(school.subscription?.status ?? "TRIALING"))) {
    redirect("/upgrade");
  }

  let status: Awaited<ReturnType<typeof getBillingStatus>> | null = null;
  let invoices: Awaited<ReturnType<typeof listInvoices>> | null = null;
  let exportData: Awaited<ReturnType<typeof exportBilling>> | null = null;

  try {
    status = await getBillingStatus(session.user.schoolId!);
  } catch {
    // no stripe customer yet
  }

  if (status?.hasStripeCustomer) {
    try {
      invoices = await listInvoices(session.user.schoolId!, { limit: 10 });
    } catch {
      // no invoices
    }
    try {
      exportData = await exportBilling(session.user.schoolId!);
    } catch {
      // export unavailable
    }
  }

  const sub = school?.subscription ?? null;

  const statusLabel = await t(subscriptionStatusKey(sub?.status ?? null));

  const invoiceStatusLabels = new Map<string, string>();
  for (const inv of invoices?.data ?? []) {
    const key = invoiceStatusKey(inv.status);
    if (key && !invoiceStatusLabels.has(key)) {
      invoiceStatusLabels.set(key, await t(key));
    }
  }

  const invoicePdfLabel = await t("billing.invoicePdf");

  return (
    <div className="space-y-8">
      <PageTitle
        title={await t("billing.title")}
        description={await t("billing.description")}
      />

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title={await t("billing.plan")} value={sub?.plan ?? "FREE"} />
        <StatCard title={await t("billing.status")} value={statusLabel} />
        <StatCard
          title={await t("billing.renewalDate")}
          value={
            sub?.currentPeriodEnd
              ? sub.currentPeriodEnd.toLocaleDateString()
              : await t("billing.notAvailable")
          }
        />
        <StatCard
          title={await t("billing.cancelAtPeriodEnd")}
          value={sub?.cancelAtPeriodEnd ? await t("billing.yes") : await t("billing.no")}
        />
      </div>

      <BillingActions schoolId={session.user.schoolId!} />

      <Card>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          {await t("billing.invoices")}
        </h2>
        {invoices && invoices.data.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 text-left text-sm text-slate-500">
                  <th className="p-4 font-medium">{await t("billing.invoiceId")}</th>
                  <th className="p-4 font-medium">{await t("billing.invoiceAmount")}</th>
                  <th className="p-4 font-medium">{await t("billing.invoiceStatus")}</th>
                  <th className="p-4 font-medium">{await t("billing.invoiceDate")}</th>
                  <th className="p-4 text-right font-medium">{invoicePdfLabel}</th>
                </tr>
              </thead>
              <tbody>
                {invoices.data.map((inv) => (
                  <tr
                    key={inv.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                  >
                    <td className="p-4 font-mono text-xs text-slate-900">
                      {inv.number ?? inv.id.slice(0, 12)}
                    </td>
                    <td className="p-4 text-sm text-slate-900">
                      ${(inv.total / 100).toFixed(2)} {inv.currency}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          INVOICE_BADGE[inv.status] ?? "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {invoiceStatusLabels.get(inv.status) ?? inv.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-600">
                      {new Date(inv.createdAt * 1000).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      {inv.invoicePdf ? (
                        <a
                          href={inv.invoicePdf}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-indigo-600 hover:underline"
                        >
                          {invoicePdfLabel}
                        </a>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-slate-400">{await t("billing.noInvoices")}</p>
        )}
      </Card>

      {exportData && (
        <Card>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            {await t("billing.summary")}
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            <StatCard
              title={await t("billing.totalInvoices")}
              value={exportData.totalInvoices}
            />
            <StatCard
              title={await t("billing.totalPayments")}
              value={exportData.totalPayments}
            />
            <StatCard
              title={await t("billing.totalRefunds")}
              value={exportData.totalRefunds}
            />
          </div>
          <p className="mt-4 text-sm text-slate-500">
            {await t("billing.netTotal")}: ${(exportData.totalAmount / 100).toFixed(2)} USD
          </p>
        </Card>
      )}
    </div>
  );
}
