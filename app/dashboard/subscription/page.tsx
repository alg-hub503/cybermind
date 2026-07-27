import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSchoolById } from "@/lib/services/domain/school.service";
import { hasActiveAccess } from "@/lib/subscription-status";

export default async function SubscriptionPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const isAdmin = session.user.role === "ADMIN";

  if (!isAdmin && !session.user.schoolId) {
    redirect("/login");
  }

  let school = null;
  if (session.user.schoolId) {
    school = await getSchoolById(session.user.schoolId);
  }

  if (!isAdmin && (!school || !hasActiveAccess(school.subscription?.status ?? null))) {
    redirect("/upgrade");
  }

  const sub = school?.subscription ?? null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Subscription</h1>
        <p className="text-gray-500">Your current subscription details</p>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">Current Plan</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border bg-slate-50 p-4">
            <p className="text-sm text-gray-500">Plan</p>
            <p className="text-xl font-bold">{sub?.plan ?? "FREE"}</p>
          </div>
          <div className="rounded-lg border bg-slate-50 p-4">
            <p className="text-sm text-gray-500">Status</p>
            <p className="text-xl font-bold">{sub?.status ?? "N/A"}</p>
          </div>
          <div className="rounded-lg border bg-slate-50 p-4">
            <p className="text-sm text-gray-500">Current Period Start</p>
            <p className="text-xl font-bold">
              {sub?.currentPeriodStart
                ? sub.currentPeriodStart.toLocaleDateString()
                : "N/A"}
            </p>
          </div>
          <div className="rounded-lg border bg-slate-50 p-4">
            <p className="text-sm text-gray-500">Current Period End</p>
            <p className="text-xl font-bold">
              {sub?.currentPeriodEnd
                ? sub.currentPeriodEnd.toLocaleDateString()
                : "N/A"}
            </p>
          </div>
          <div className="rounded-lg border bg-slate-50 p-4">
            <p className="text-sm text-gray-500">Renewal / Expiry</p>
            <p className="text-xl font-bold">
              {sub?.cancelAtPeriodEnd
                ? `Expires ${sub.currentPeriodEnd?.toLocaleDateString() ?? "N/A"}`
                : `Renews ${sub?.currentPeriodEnd?.toLocaleDateString() ?? "N/A"}`}
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

      {isAdmin && sub?.stripeSubscriptionId && (
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Stripe Reference</h2>
          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-sm text-gray-500">Stripe Subscription ID</p>
            <p className="font-mono text-sm">{sub.stripeSubscriptionId}</p>
          </div>
        </div>
      )}

      <div className="rounded-lg border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">Need Help?</h2>
        <p className="text-gray-500">
          Visit the{" "}
          <a href="/dashboard/billing" className="text-blue-600 hover:underline">
            Billing page
          </a>{" "}
          to manage payment methods, view invoices, or cancel your subscription.
        </p>
      </div>
    </div>
  );
}
