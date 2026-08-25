import { getServerSession } from "@/lib/get-server-session";
import { t } from "@/lib/i18n/server";
import Link from "next/link";
import UpgradeClient from "@/app/upgrade/upgrade-client";

export default async function AccountSuspendedPage() {
  const session = await getServerSession();

  const suspendedTitle = await t("accountSuspended.title");
  const suspendedDesc = await t("accountSuspended.description");
  const upgradeNow = await t("accountSuspended.upgradeNow");
  const contactSupport = await t("accountSuspended.contactSupport");

  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-2xl">
        <h1 className="text-3xl font-black text-white">{suspendedTitle}</h1>
        <p className="mt-4 text-gray-400">{suspendedDesc}</p>
        <UpgradeClient label={upgradeNow} />
        <p className="mt-6 text-sm text-gray-500">{contactSupport}</p>
      </div>
    </div>
  );
}
