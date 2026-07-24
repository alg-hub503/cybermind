import { ADMIN_ROLE } from "@/lib/constants";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isPro } from "@/lib/subscription-status";
export async function requirePremium() {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  if (session.user.role === ADMIN_ROLE) {
    return session;
  }
  if (!session.user.schoolId) {
    throw new Error("UPGRADE_REQUIRED");
  }
  const subscription = await prisma.subscription.findUnique({
    where: { schoolId: session.user.schoolId },
    select: { plan: true },
  });
  if (isPro(subscription?.plan)) {
    return session;
  }
  throw new Error("UPGRADE_REQUIRED");
}
