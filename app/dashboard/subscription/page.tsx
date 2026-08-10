import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/get-server-session";
import { hasActiveAccess } from "@/lib/subscription-status";
import { getSchoolById } from "@/lib/services/domain/school.service";
import { getPlatformSettings } from "@/lib/features/platform/platform-settings-actions";
import { resolveTrialStatus, toAccessString } from "@/lib/trial-status";
import { formatDate } from "@/lib/format-date";
import { t } from "@/lib/i18n/server";

import { TrialAccessSetter } from "@/components/dashboard/trial-access-provider";

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

  if (!isAdmin) {
    if (!school) {
      redirect("/upgrade");
    }

    const platformSettings = await getPlatformSettings();
    const access = resolveTrialStatus(school, platformSettings);
    const accessStr = toAccessString(access);

    if (!hasActiveAccess(accessStr)) {
      redirect("/upgrade");
    }
  }

  const sub = school?.subscription ?? null;
  const dateFormat = school?.settings?.dateFormat ?? "DD/MM/YYYY";

  const platformSettings = school ? await getPlatformSettings() : null;
  const access = school && platformSettings
    ? resolveTrialStatus(school, platformSettings)
    : null;

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
  const trialDaysLeft = await t("subscription.trialDaysLeft");
  const trialEndsAt = await t("subscription.trialEndsAt");

  return (
    <div className="space-y-8">
      {access && <TrialAccessSetter access={access} />}

      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-gray-500">{description}</p>
      </div>

      {access?.status === "TRIALING" && access.daysLeft !== null && access.trialEnd && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-6">
          <h2 className="mb-2 text-lg font-semibold text-amber-800">{trialDaysLeft}</h2>
          <p className="text-sm text-amber-700">
            {access.daysLeft} {trialEndsAt} {formatDate(access.trialEnd, dateFormat)}
          </p>
        </div>
      )}

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
                ? formatDate(sub.currentPeriodStart, dateFormat)
                : "N/A"}
            </p>
          </div>
          <div className="rounded-lg border bg-slate-50 p-4">
            <p className="text-sm text-gray-500">{periodEnd}</p>
            <p className="text-xl font-bold">
              {sub?.currentPeriodEnd
                ? formatDate(sub.currentPeriodEnd, dateFormat)
                : "N/A"}
            </p>
          </div>
          <div className="rounded-lg border bg-slate-50 p-4">
            <p className="text-sm text-gray-500">{renewalExpiry}</p>
            <p className="text-xl font-bold">
              {sub?.cancelAtPeriodEnd
                ? `${expires} ${sub.currentPeriodEnd ? formatDate(sub.currentPeriodEnd, dateFormat) : "N/A"}`
                : `${renews} ${sub?.currentPeriodEnd ? formatDate(sub.currentPeriodEnd, dateFormat) : "N/A"}`}
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
