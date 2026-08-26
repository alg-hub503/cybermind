import { ADMIN_ROLE } from "@/lib/constants";
import { getServerSession } from "@/lib/get-server-session";
import { getUserByEmail } from "@/lib/services/domain/user.service";
import { getPlatformSettings } from "@/lib/features/platform/platform-settings-actions";
import { prisma } from "@/lib/prisma";
import { resolveTrialStatus, toAccessString } from "@/lib/trial-status";
import { hasActiveAccess } from "@/lib/subscription-status";

export async function requireSession() {
  const session = await getServerSession();

  if (!session?.user?.email) {
    throw new Error("UNAUTHORIZED");
  }

  if (session.user.role !== ADMIN_ROLE) {
    const settings = await getPlatformSettings();
    if (settings.maintenanceMode) {
      throw new Error("MAINTENANCE");
    }
  }

  return { session };
}

// Routes that remain accessible even with expired trial (support/retention)
const RETENTION_PATHS = ["/api/contact-messages", "/api/sales-inquiries", "/api/reports"];

// Routes accessible without email verification
const EMAIL_VERIFICATION_EXEMPT_PATHS = [
  "/api/auth/verify-email",
  "/api/register",
  "/api/auth/signin",
  "/api/auth/csrf",
  "/api/auth/callback",
  "/api/auth/session",
  "/api/auth/providers",
];

export async function requireAuth(requestPath?: string) {
  const session = await getServerSession();

  if (!session?.user?.email) {
    throw new Error("UNAUTHORIZED");
  }

  if (session.user.role !== ADMIN_ROLE) {
    const settings = await getPlatformSettings();
    if (settings.maintenanceMode) {
      throw new Error("MAINTENANCE");
    }
  }

  const user = await getUserByEmail(session.user.email);

  if (!user) {
    throw new Error("UNAUTHORIZED");
  }

  // Email verification enforcement: block access until email is verified
  // Existing users have emailVerifiedAt backfilled by migration, so they pass through
  if (!user.emailVerifiedAt) {
    const isExempt = requestPath && EMAIL_VERIFICATION_EXEMPT_PATHS.some((p) => requestPath.startsWith(p));
    if (!isExempt) {
      throw new Error("EMAIL_VERIFICATION_REQUIRED");
    }
  }

  // Skip trial check for admin, retention routes, and users without a school
  if (user.role === ADMIN_ROLE) return { session, user };
  if (!user.schoolId) return { session, user };
  if (requestPath && RETENTION_PATHS.some((p) => requestPath.startsWith(p))) {
    return { session, user };
  }

  // Trial/subscription gate
  const school = await prisma.school.findUnique({
    where: { id: user.schoolId },
    include: { subscription: true, settings: true },
  });

  if (school) {
    const platformSettings = await getPlatformSettings();
    const access = resolveTrialStatus(school, platformSettings);
    const accessStr = toAccessString(access);
    const subStatus = school.subscription?.status ?? null;
    const isPastDueOrUnpaid = subStatus === "PAST_DUE" || subStatus === "UNPAID";

    if (!hasActiveAccess(accessStr) && !isPastDueOrUnpaid) {
      throw new Error("TRIAL_EXPIRED");
    }
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
): { error: string; status: 401 | 402 | 403 | 404 | 503 } {
  if (error instanceof Error) {
    if (error.message === "FORBIDDEN") {
      return { error: "Forbidden", status: 403 };
    }
    if (error.message === "NOT_FOUND") {
      return { error: "Not found", status: 404 };
    }
    if (error.message === "MAINTENANCE") {
      return { error: "Maintenance mode", status: 503 };
    }
    if (error.message === "TRIAL_EXPIRED") {
      return { error: "Trial expired", status: 403 };
    }
    if (error.message === "EMAIL_VERIFICATION_REQUIRED") {
      return { error: "Email verification required", status: 403 };
    }
  }
  return { error: "Unauthorized", status: 401 };
}

export async function resolvePermissions(
  userId: string,
  schoolId: string
): Promise<string[]> {
  const userRoles = await prisma.userRole.findMany({
    where: { userId, schoolId },
    include: {
      role: {
        include: {
          RolePermission: {
            include: { permission: true },
          },
        },
      },
    },
  });

  const permissions = new Set<string>();
  for (const ur of userRoles) {
    for (const rp of ur.role.RolePermission) {
      permissions.add(rp.permission.code);
    }
  }

  return Array.from(permissions);
}

export async function requirePermission(permissionCode: string) {
  const { user } = await requireAuth();

  if (user.role === ADMIN_ROLE) {
    return { user };
  }

  if (!user.schoolId) {
    throw new Error("FORBIDDEN");
  }

  const permissions = await resolvePermissions(user.id, user.schoolId);

  if (!permissions.includes(permissionCode)) {
    throw new Error("FORBIDDEN");
  }

  return { user };
}

export async function requireSchoolAdmin(schoolId: string) {
  const { user } = await requireAuth();

  // Platform Admin bypasses all school checks
  if (user.role === ADMIN_ROLE) {
    return { user };
  }

  // Check if user has ADMIN role in this specific school (via systemKey)
  const adminRole = await prisma.role.findFirst({
    where: { systemKey: "SCHOOL_ADMIN", schoolId },
  });

  if (!adminRole) {
    throw new Error("FORBIDDEN");
  }

  const userRole = await prisma.userRole.findFirst({
    where: { userId: user.id, roleId: adminRole.id, schoolId },
  });

  if (!userRole) {
    throw new Error("FORBIDDEN");
  }

  return { user };
}
