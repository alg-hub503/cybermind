import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";

export async function requirePremium() {
  const session = await getServerSession(authOptions);

  if (!session) {
    throw new Error("UNAUTHORIZED");
  }

  if (session.user.role === "ADMIN") {
    return session;
  }

  if (
    session.user.subscriptionStatus === "TRIAL" ||
    session.user.subscriptionStatus === "ACTIVE"
  ) {
    return session;
  }

  throw new Error("UPGRADE_REQUIRED");
}