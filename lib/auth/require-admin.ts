import { ADMIN_ROLE } from "@/lib/constants";
import { getServerSession } from "@/lib/get-server-session";

export async function requireAdmin() {
  const session = await getServerSession();

  if (!session?.user?.email) {
    throw new Error("UNAUTHORIZED");
  }

  if (session.user.role !== ADMIN_ROLE) {
    console.log("ROLE:", session.user.role);

    throw new Error("FORBIDDEN");
  }

  return session;
}
