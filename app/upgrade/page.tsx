import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/get-server-session";
import { t } from "@/lib/i18n/server";
import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { hasActiveAccess } from "@/lib/subscription-status";
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
    include: { subscription: true },
  });

  const sub = school?.subscription;
  const isActive = hasActiveAccess(sub?.status ?? null);

  if (isActive) {
    redirect("/dashboard");
  }

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
