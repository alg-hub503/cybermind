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

  if (session.user.role !== "ADMIN") {
    console.log("ROLE:", session.user.role);

    throw new Error("FORBIDDEN");
  }

  return session;
}
