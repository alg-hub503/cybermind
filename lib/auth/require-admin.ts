import { ADMIN_ROLE } from "@/lib/constants";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

export async function requireAdmin() {
  const session = await getServerSession(authOptions);

  console.log("========== SERVER SESSION ==========");
  console.log(JSON.stringify(session, null, 2));
  console.log("====================================");

  if (!session?.user?.email) {
    throw new Error("UNAUTHORIZED");
  }

  if (session.user.role !== ADMIN_ROLE) {
    console.log("ROLE:", session.user.role);

    throw new Error("FORBIDDEN");
  }

  return session;
}
