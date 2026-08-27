import { getServerSession } from "@/lib/get-server-session";
import { redirect } from "next/navigation";

import { getUserByEmail } from "@/lib/services/domain/user.service";
import { ADMIN_ROLE } from "@/lib/constants";
import { getPlatformSettings } from "@/lib/features/platform/platform-settings-actions";

export async function requireCurrentUser() {
  const session = await getServerSession();

  if (!session?.user?.email) {
    redirect("/login");
  }

  if (session.user.role !== ADMIN_ROLE) {
    const settings = await getPlatformSettings();
    if (settings.maintenanceMode) {
      redirect("/maintenance");
    }
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
