import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/get-server-session";

import { prisma } from "@/lib/prisma";
import { hasActiveAccess } from "@/lib/subscription-status";
import UpgradeClient from "./upgrade-client";

export default async function UpgradePage() {
  const session = await getServerSession();

  if (!session?.user?.schoolId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <p className="text-gray-400">Please log in to upgrade.</p>
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-2xl">
        {status && plan ? (
          <>
            <h1 className="text-3xl font-black text-white">Subscription Status</h1>
            <div className="mt-6 space-y-3 text-left">
              <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                <p className="text-sm text-gray-400">Plan</p>
                <p className="text-lg font-bold text-white">{plan}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                <p className="text-sm text-gray-400">Status</p>
                <p className="text-lg font-bold text-yellow-400">{status}</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-400">
              Your subscription is not yet active. Complete payment to continue.
            </p>
            <UpgradeClient />
          </>
        ) : (
          <>
            <h1 className="text-3xl font-black text-white">Upgrade To PRO</h1>
            <p className="mt-2 text-gray-400">Unlock full SaaS features</p>
            <UpgradeClient />
          </>
        )}
      </div>
    </div>
  );
}
