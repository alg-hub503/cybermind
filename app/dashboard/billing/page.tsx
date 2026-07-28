import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/get-server-session";

import { hasActiveAccess } from "@/lib/subscription-status";
import { getSchoolById } from "@/lib/services/domain/school.service";
import { getBillingStatus } from "@/lib/services/application/billing/get-billing-status";
import { listInvoices } from "@/lib/services/application/billing/list-invoices";
import { exportBilling } from "@/lib/services/application/billing/export-billing";
import BillingActions from "./billing-actions";

export default async function BillingPage() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/login");
  }

  const isAdmin = session.user.role === "ADMIN";

  if (!isAdmin && !session.user.schoolId) {
    redirect("/login");
  }

  if (isAdmin && !session.user.schoolId) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Billing</h1>
        <p className="mt-4 text-gray-500">Select a school to view its billing details.</p>
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Billing</h1>
        <p className="text-gray-500">Manage your subscription and billing history</p>
      </div>

      {/* Subscription Overview */}
      <div className="rounded-lg border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">Subscription Overview</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border bg-slate-50 p-4">
            <p className="text-sm text-gray-500">Plan</p>
            <p className="text-xl font-bold">{sub?.plan ?? "FREE"}</p>
          </div>
          <div className="rounded-lg border bg-slate-50 p-4">
            <p className="text-sm text-gray-500">Status</p>
            <p className="text-xl font-bold">{sub?.status ?? "N/A"}</p>
          </div>
          <div className="rounded-lg border bg-slate-50 p-4">
            <p className="text-sm text-gray-500">Renewal Date</p>
            <p className="text-xl font-bold">
              {sub?.currentPeriodEnd
                ? sub.currentPeriodEnd.toLocaleDateString()
                : "N/A"}
            </p>
          </div>
          <div className="rounded-lg border bg-slate-50 p-4">
            <p className="text-sm text-gray-500">Cancel at Period End</p>
            <p className="text-xl font-bold">
              {sub?.cancelAtPeriodEnd ? "Yes" : "No"}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <BillingActions schoolId={session.user.schoolId!} />

      {/* Invoices */}
      <div className="rounded-lg border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">Invoices</h2>
        {invoices && invoices.data.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-gray-500">
                  <th className="pb-2 pr-4">ID</th>
                  <th className="pb-2 pr-4">Amount</th>
                  <th className="pb-2 pr-4">Status</th>
                  <th className="pb-2 pr-4">Date</th>
                  <th className="pb-2 pr-4">PDF</th>
                </tr>
              </thead>
              <tbody>
                {invoices.data.map((inv) => (
                  <tr key={inv.id} className="border-b last:border-0">
                    <td className="py-2 pr-4 font-mono text-xs">{inv.number ?? inv.id.slice(0, 12)}</td>
                    <td className="py-2 pr-4">${(inv.total / 100).toFixed(2)} {inv.currency}</td>
                    <td className="py-2 pr-4">{inv.status}</td>
                    <td className="py-2 pr-4">{new Date(inv.createdAt * 1000).toLocaleDateString()}</td>
                    <td className="py-2 pr-4">
                      {inv.invoicePdf ? (
                        <a href={inv.invoicePdf} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          PDF
                        </a>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-400">No invoices yet.</p>
        )}
      </div>

      {/* Export */}
      {exportData && (
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Billing Summary</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border bg-slate-50 p-4">
              <p className="text-sm text-gray-500">Total Invoices</p>
              <p className="text-xl font-bold">{exportData.totalInvoices}</p>
            </div>
            <div className="rounded-lg border bg-slate-50 p-4">
              <p className="text-sm text-gray-500">Total Payments</p>
              <p className="text-xl font-bold">{exportData.totalPayments}</p>
            </div>
            <div className="rounded-lg border bg-slate-50 p-4">
              <p className="text-sm text-gray-500">Total Refunds</p>
              <p className="text-xl font-bold">{exportData.totalRefunds}</p>
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Net Total: ${(exportData.totalAmount / 100).toFixed(2)} USD
          </p>
        </div>
      )}
    </div>
  );
}
