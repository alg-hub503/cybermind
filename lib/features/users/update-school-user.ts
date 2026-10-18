import { prisma } from "@/lib/prisma";
import { ADMIN_ROLE } from "@/lib/constants";
import {
  RoleMismatchError,
  PlatformAdminProtectedError,
} from "@/lib/features/users/delete-school-user";

// Re-exported so existing imports of these two names from this module keep
// working; the classes themselves live in delete-school-user.ts. They must
// be the SAME class objects as the ones app/api/.../route.ts's
// toDeleteHttpError() checks with `instanceof` — two classes with identical
// names defined in two files are not the same class, and `instanceof`
// against the wrong one silently falls through to a generic 500. That was
// exactly this file's bug before this fix: it defined its own copies.
export { RoleMismatchError, PlatformAdminProtectedError };

/**
 * Renames a user who belongs to `schoolId`. Deliberately narrow: this only
 * ever touches `name`. It never touches `email` (needs the same
 * normalization/duplicate-check care as register()) or `password` (a reset
 * flow), and it never touches `User.role` (the platform field owned by
 * PATCH /api/users/[id]/role) — those are separate, unbuilt features, not
 * oversights.
 */
export async function updateSchoolUserName(input: {
  schoolId: string;
  userId: string;
  name: string;
}): Promise<void> {
  const { schoolId, userId, name } = input;

  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, schoolId: true, role: true },
  });

  if (!targetUser || targetUser.schoolId !== schoolId) {
    throw new RoleMismatchError("Target user does not belong to this school");
  }

  if (targetUser.role === ADMIN_ROLE) {
    throw new PlatformAdminProtectedError();
  }

  await prisma.user.update({
    where: { id: userId },
    data: { name },
  });
}
