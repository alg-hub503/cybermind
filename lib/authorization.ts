import { ADMIN_ROLE } from "@/lib/constants";
import { getServerSession } from "@/lib/get-server-session";
import { getUserByEmail } from "@/lib/services/domain/user.service";

export async function requireAuth() {
  const session = await getServerSession();

  if (!session?.user?.email) {
    throw new Error("UNAUTHORIZED");
  }

  const user = await getUserByEmail(session.user.email);

  if (!user) {
    throw new Error("UNAUTHORIZED");
  }

  return {
    session,
    user,
  };
}

export async function requireAdmin() {
  const { user } = await requireAuth();

  if (user.role !== ADMIN_ROLE) {
    throw new Error("FORBIDDEN");
  }

  return {
    user,
  };
}

export async function requireSchoolAccess(schoolId: string) {
  const { user } = await requireAuth();

  if (user.role !== ADMIN_ROLE && user.schoolId !== schoolId) {
    throw new Error("FORBIDDEN");
  }

  return {
    user,
  };
}
