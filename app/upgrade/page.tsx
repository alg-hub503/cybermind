import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/get-server-session";
import { t } from "@/lib/i18n/server";
import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { hasActiveAccess } from "@/lib/subscription-status";
import { resolveTrialStatus, toAccessString } from "@/lib/trial-status";
import { getPlatformSettings } from "@/lib/features/platform/platform-settings-actions";
import UpgradeClient from "./upgrade-client";

export default async function UpgradePage() {
  const session = await getServerSession();

  if (!session?.user?.schoolId) {
    const loginPrompt = await t("upgrade.loginPrompt");
    const loginLabel = await t("upgrade.login");

    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-2xl">
          <p className="text-gray-400">{loginPrompt}</p>
          <Link
            href="/login?callbackUrl=%2Fupgrade"
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white transition hover:bg-indigo-700"
          >
            {loginLabel}
          </Link>
        </div>
      </div>
    );
  }

  const school = await prisma.school.findUnique({
    where: { id: session.user.schoolId },
    include: { subscription: true, settings: true },
  });

  const sub = school?.subscription;
  const isActive = hasActiveAccess(sub?.status ?? null);

  if (isActive) {
    redirect("/dashboard");
  }

  // Check if trial is expired
  const platformSettings = await getPlatformSettings();
  const access = school
    ? resolveTrialStatus(school, platformSettings)
    : null;
  const accessStr = access ? toAccessString(access) : null;
  const isTrialExpired = accessStr === "EXPIRED";

  if (isTrialExpired) {
    const trialEnded = await t("upgrade.trialEnded");
    const trialEndedDesc = await t("upgrade.trialEndedDesc");
    const upgradeNow = await t("upgrade.upgradeNow");
    const contactSupport = await t("upgrade.contactSupport");

    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-2xl">
          <h1 className="text-3xl font-black text-white">{trialEnded}</h1>
          <p className="mt-4 text-gray-400">{trialEndedDesc}</p>
          <UpgradeClient label={upgradeNow} />
          <p className="mt-6 text-sm text-gray-500">{contactSupport}</p>
        </div>
      </div>
    );
  }

  // Default: subscription inactive (not expired trial)
  const status = sub?.status ?? null;
  const plan = sub?.plan ?? null;

  const upgradeToPro = await t("upgrade.upgradeToPro");
  const unlockFeatures = await t("upgrade.unlockFeatures");
  const subscriptionStatus = await t("upgrade.subscriptionStatus");
  const planLabel = await t("upgrade.plan");
  const statusLabel = await t("upgrade.status");
  const paymentPending = await t("upgrade.paymentPending");
  const upgradeNow = await t("upgrade.upgradeNow");

  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-2xl">
        {status && plan ? (
          <>
            <h1 className="text-3xl font-black text-white">{subscriptionStatus}</h1>
            <div className="mt-6 space-y-3 text-left">
              <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                <p className="text-sm text-gray-400">{planLabel}</p>
                <p className="text-lg font-bold text-white">{plan}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                <p className="text-sm text-gray-400">{statusLabel}</p>
                <p className="text-lg font-bold text-yellow-400">{status}</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-400">
              {paymentPending}
            </p>
            <UpgradeClient label={upgradeNow} />
          </>
        ) : (
          <>
            <h1 className="text-3xl font-black text-white">{upgradeToPro}</h1>
            <p className="mt-2 text-gray-400">{unlockFeatures}</p>
            <UpgradeClient label={upgradeNow} />
          </>
        )}
      </div>
    </div>
  );
}
