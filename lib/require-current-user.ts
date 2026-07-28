import { getServerSession } from "@/lib/get-server-session";
import { redirect } from "next/navigation";

import { getUserByEmail } from "@/lib/services/domain/user.service";

export async function requireCurrentUser() {
  const session = await getServerSession();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await getUserByEmail(session.user.email);

  if (!user) {
    redirect("/login");
  }

  return {
    session,
    user,
  };
}
