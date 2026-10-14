import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { ADMIN_ROLE } from "@/lib/constants";
import { logUserDeleted } from "@/lib/audit-log";
import {
  assertNotLastSchoolAdmin,
  LastSchoolAdminError,
} from "@/lib/features/roles/user-role-actions";

export class RoleMismatchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RoleMismatchError";
  }
}

export class PlatformAdminProtectedError extends Error {
  constructor() {
    super("Platform ADMIN accounts cannot be deleted from a school's user list");
    this.name = "PlatformAdminProtectedError";
  }
}

export { LastSchoolAdminError };

const MAX_RETRIES = 1;

function isSerializationFailure(err: unknown): boolean {
  return (
    err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2034"
  );
}

/**
 * Deletes a user who belongs to `schoolId`.
 *
 * Safe at the schema level: every FK pointing at User (UserRole,
 * PasswordResetToken, EmailChangeToken/Attempt, TeacherProfile, StaffProfile,
 * Report, ...) is `onDelete: Cascade`, and no business record (Student,
 * Invoice, Client, Class, Grade, AcademicYear) references a creating user —
 * confirmed by reading prisma/schema.prisma before writing this. A hard
 * delete is therefore the right choice; no soft-delete flag is needed.
 *
 * Race safety: reuses the same SERIALIZABLE + retry-once strategy as
 * assignUserRole()/removeUserRole() for the last-SCHOOL_ADMIN check, because
 * deleting two different SCHOOL_ADMIN holders at nearly the same moment has
 * the same write-skew risk assertNotLastSchoolAdmin() was built to catch
 * there.
 */
export async function deleteSchoolUser(input: {
  schoolId: string;
  userId: string;
  actorId: string;
}): Promise<void> {
  const { schoolId, userId, actorId } = input;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const deletedEmail = await prisma.$transaction(
        async (tx) => {
          const targetUser = await tx.user.findUnique({
            where: { id: userId },
            select: { id: true, schoolId: true, role: true, email: true },
          });

          if (!targetUser || targetUser.schoolId !== schoolId) {
            throw new RoleMismatchError(
              "Target user does not belong to this school"
            );
          }

          if (targetUser.role === ADMIN_ROLE) {
            throw new PlatformAdminProtectedError();
          }

          await assertNotLastSchoolAdmin(tx, schoolId, userId);

          await tx.user.delete({ where: { id: userId } });

          return targetUser.email;
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
      );

      logUserDeleted({
        actorId,
        targetUserId: userId,
        targetEmail: deletedEmail,
        schoolId,
      });

      return;
    } catch (err) {
      if (isSerializationFailure(err) && attempt < MAX_RETRIES) {
        continue;
      }
      throw err;
    }
  }

  /* istanbul ignore next -- unreachable: loop always returns or throws */
  throw new Error("deleteSchoolUser: retry loop exited unexpectedly");
}
