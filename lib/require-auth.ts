import { getServerSession } from "@/lib/get-server-session";

export async function requireAuth() {
  const session = await getServerSession();

  if (!session) {
    throw new Error("Unauthorized");
  }

  return session;
}