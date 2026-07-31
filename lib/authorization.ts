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

export async function requireResourceAccess<T extends { schoolId: string }>(
  resource: T | null
) {
  const { user } = await requireAuth();

  if (!resource) {
    throw new Error("NOT_FOUND");
  }

  if (user.role !== ADMIN_ROLE && resource.schoolId !== user.schoolId) {
    throw new Error("FORBIDDEN");
  }

  return {
    user,
    resource,
  };
}

export function toApiError(
  error: unknown
): { error: string; status: 401 | 403 | 404 } {
  if (error instanceof Error) {
    if (error.message === "FORBIDDEN") {
      return { error: "Forbidden", status: 403 };
    }
    if (error.message === "NOT_FOUND") {
      return { error: "Not found", status: 404 };
    }
  }
  return { error: "Unauthorized", status: 401 };
}
