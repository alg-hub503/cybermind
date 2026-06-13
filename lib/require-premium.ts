import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function requirePremium() {
  const session = await getServerSession(authOptions);

  if (!session) {
    throw new Error("UNAUTHORIZED");
  }

  // السماح لـ ADMIN دائمًا
  if ((session.user as any).role === "ADMIN") {
    return session;
  }

  // السماح لـ TRIAL و ACTIVE مؤقتًا (للتطوير)
  if (
    (session.user as any).subscriptionStatus === "TRIAL" ||
    (session.user as any).subscriptionStatus === "ACTIVE"
  ) {
    return session;
  }

  throw new Error("UPGRADE_REQUIRED");
}