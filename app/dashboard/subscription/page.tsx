import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/get-server-session";
import { t } from "@/lib/i18n/server";

import { getSchoolById } from "@/lib/services/domain/school.service";
import { hasActiveAccess } from "@/lib/subscription-status";

export default async function SubscriptionPage() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/login");
  }

  const isAdmin = session.user.role === "ADMIN";

  if (!isAdmin && !session.user.schoolId) {
    redirect("/dashboard/schools");
  }

  let school = null;
  if (session.user.schoolId) {
    school = await getSchoolById(session.user.schoolId);
  }

  if (!isAdmin && (!school || !hasActiveAccess(school.subscription?.status ?? "TRIALING"))) {
    redirect("/upgrade");
  }

  const sub = school?.subscription ?? null;

  const title = await t("subscription.title");
  const description = await t("subscription.description");
  const currentPlan = await t("subscription.currentPlan");
  const planLabel = await t("subscription.plan");
  const statusLabel = await t("subscription.status");
  const periodStart = await t("subscription.periodStart");
  const periodEnd = await t("subscription.periodEnd");
  const renewalExpiry = await t("subscription.renewalExpiry");
  const expires = await t("subscription.expires");
  const renews = await t("subscription.renews");
  const cancelAtPeriodEnd = await t("subscription.cancelAtPeriodEnd");
  const yes = await t("subscription.yes");
  const no = await t("subscription.no");
  const stripeReference = await t("subscription.stripeReference");
  const stripeSubscriptionId = await t("subscription.stripeSubscriptionId");
  const needHelp = await t("subscription.needHelp");
  const billingPageText = await t("subscription.billingPageText");
  const billingPageLink = await t("subscription.billingPageLink");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-gray-500">{description}</p>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">{currentPlan}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border bg-slate-50 p-4">
            <p className="text-sm text-gray-500">{planLabel}</p>
            <p className="text-xl font-bold">{sub?.plan ?? "FREE"}</p>
          </div>
          <div className="rounded-lg border bg-slate-50 p-4">
            <p className="text-sm text-gray-500">{statusLabel}</p>
            <p className="text-xl font-bold">{sub?.status ?? "N/A"}</p>
          </div>
          <div className="rounded-lg border bg-slate-50 p-4">
            <p className="text-sm text-gray-500">{periodStart}</p>
            <p className="text-xl font-bold">
              {sub?.currentPeriodStart
                ? sub.currentPeriodStart.toLocaleDateString()
                : "N/A"}
            </p>
          </div>
          <div className="rounded-lg border bg-slate-50 p-4">
            <p className="text-sm text-gray-500">{periodEnd}</p>
            <p className="text-xl font-bold">
              {sub?.currentPeriodEnd
                ? sub.currentPeriodEnd.toLocaleDateString()
                : "N/A"}
            </p>
          </div>
          <div className="rounded-lg border bg-slate-50 p-4">
            <p className="text-sm text-gray-500">{renewalExpiry}</p>
            <p className="text-xl font-bold">
              {sub?.cancelAtPeriodEnd
                ? `${expires} ${sub.currentPeriodEnd?.toLocaleDateString() ?? "N/A"}`
                : `${renews} ${sub?.currentPeriodEnd?.toLocaleDateString() ?? "N/A"}`}
            </p>
          </div>
          <div className="rounded-lg border bg-slate-50 p-4">
            <p className="text-sm text-gray-500">{cancelAtPeriodEnd}</p>
            <p className="text-xl font-bold">
              {sub?.cancelAtPeriodEnd ? yes : no}
            </p>
          </div>
        </div>
      </div>

      {isAdmin && sub?.stripeSubscriptionId && (
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">{stripeReference}</h2>
          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-sm text-gray-500">{stripeSubscriptionId}</p>
            <p className="font-mono text-sm">{sub.stripeSubscriptionId}</p>
          </div>
        </div>
      )}

      <div className="rounded-lg border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">{needHelp}</h2>
        <p className="text-gray-500">
          {billingPageText}{" "}
          <a href="/dashboard/billing" className="text-blue-600 hover:underline">
            {billingPageLink}
          </a>
        </p>
      </div>
    </div>
  );
}
