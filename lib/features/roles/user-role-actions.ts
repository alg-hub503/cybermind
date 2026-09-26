import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { logRoleChange } from "@/lib/audit-log";

export class LastSchoolAdminError extends Error {
  constructor() {
    super("Cannot remove or reassign the school's only SCHOOL_ADMIN");
    this.name = "LastSchoolAdminError";
  }
}

export class RoleMismatchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RoleMismatchError";
  }
}

const MAX_RETRIES = 1;

/**
 * Throws if `userId` currently holds the school's SCHOOL_ADMIN role AND is
 * the only holder of it. A school can have at most one Role with
 * systemKey "SCHOOL_ADMIN" (enforced by the @@unique([schoolId, systemKey])
 * constraint on Role), so this only ever has to check one role id.
 */
async function assertNotLastSchoolAdmin(
  tx: Prisma.TransactionClient,
  schoolId: string,
  userId: string
): Promise<void> {
  const adminRole = await tx.role.findFirst({
    where: { schoolId, systemKey: "SCHOOL_ADMIN" },
    select: { id: true },
  });

  if (!adminRole) return;

  const holders = await tx.userRole.findMany({
    where: { schoolId, roleId: adminRole.id },
    select: { userId: true },
  });

  const isCurrentHolder = holders.some((h) => h.userId === userId);
  if (!isCurrentHolder) return;

  const otherHolders = holders.filter((h) => h.userId !== userId);
  if (otherHolders.length === 0) {
    throw new LastSchoolAdminError();
  }
}

function isSerializationFailure(err: unknown): boolean {
  return (
    err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2034"
  );
}

export type RoleChangeResult = {
  changed: boolean;
  previousRoleId: string | null;
};

/**
 * Replaces (or creates) the single UserRole a user holds within one school.
 *
 * Race safety: UserRole has no unique index on (userId, schoolId) — only on
 * (userId, roleId, schoolId) — so under the database's default READ
 * COMMITTED isolation, two concurrent calls for the same user (different
 * target roleId) could both pass the "delete existing rows" step (nothing to
 * delete yet) and both insert, leaving the user with two roles at once. A
 * real unique index would be the standard fix but requires a migration,
 * explicitly out of scope for this batch. Instead, the delete+create pair
 * below runs inside a SERIALIZABLE transaction: both transactions' deletes
 * read the same (userId, schoolId) predicate, so Postgres detects the write
 * skew between them and aborts one with a serialization failure — Prisma
 * error P2034 — which is caught and retried once. This is a genuine
 * Postgres-level guarantee (see https://docs.prisma.io -> Transactions ->
 * "Transaction timing issues"), not an application-level check.
 */
export async function assignUserRole(input: {
  schoolId: string;
  userId: string;
  roleId: string;
  actorId: string;
}): Promise<RoleChangeResult> {
  const { schoolId, userId, roleId, actorId } = input;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await prisma.$transaction(
        async (tx) => {
          const [targetUser, targetRole] = await Promise.all([
            tx.user.findUnique({
              where: { id: userId },
              select: { id: true, schoolId: true },
            }),
            tx.role.findUnique({
              where: { id: roleId },
              select: { id: true, schoolId: true },
            }),
          ]);

          if (!targetUser || targetUser.schoolId !== schoolId) {
            throw new RoleMismatchError(
              "Target user does not belong to this school"
            );
          }
          if (!targetRole || targetRole.schoolId !== schoolId) {
            throw new RoleMismatchError(
              "Target role does not belong to this school"
            );
          }

          const existing = await tx.userRole.findMany({
            where: { userId, schoolId },
            select: { roleId: true },
          });

          // Already exactly this role: no-op, not an error.
          if (existing.length === 1 && existing[0].roleId === roleId) {
            return {
              changed: false,
              previousRoleId: existing[0].roleId,
            } satisfies RoleChangeResult;
          }

          // Moving AWAY from a role (including "no role" -> a role, which
          // has no existing SCHOOL_ADMIN row to protect) only needs the
          // last-admin check when an existing row is actually being lost.
          if (existing.length > 0) {
            await assertNotLastSchoolAdmin(tx, schoolId, userId);
            await tx.userRole.deleteMany({ where: { userId, schoolId } });
          }

          await tx.userRole.create({ data: { userId, roleId, schoolId } });

          return {
            changed: true,
            previousRoleId: existing[0]?.roleId ?? null,
          } satisfies RoleChangeResult;
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
      );

      if (result.changed) {
        logRoleChange({
          action: "assign",
          actorId,
          targetUserId: userId,
          schoolId,
          oldRoleId: result.previousRoleId,
          newRoleId: roleId,
        });
      }

      return result;
    } catch (err) {
      if (isSerializationFailure(err) && attempt < MAX_RETRIES) {
        continue;
      }
      throw err;
    }
  }

  /* istanbul ignore next -- unreachable: loop always returns or throws */
  throw new Error("assignUserRole: retry loop exited unexpectedly");
}

/**
 * Removes whatever UserRole `userId` holds within `schoolId`, leaving them
 * with zero permissions in that school. Same SERIALIZABLE + retry-once
 * race-safety strategy as assignUserRole(), and the same last-SCHOOL_ADMIN
 * protection.
 */
export async function removeUserRole(input: {
  schoolId: string;
  userId: string;
  actorId: string;
}): Promise<RoleChangeResult> {
  const { schoolId, userId, actorId } = input;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await prisma.$transaction(
        async (tx) => {
          const targetUser = await tx.user.findUnique({
            where: { id: userId },
            select: { id: true, schoolId: true },
          });

          if (!targetUser || targetUser.schoolId !== schoolId) {
            throw new RoleMismatchError(
              "Target user does not belong to this school"
            );
          }

          const existing = await tx.userRole.findMany({
            where: { userId, schoolId },
            select: { roleId: true },
          });

          if (existing.length === 0) {
            return {
              changed: false,
              previousRoleId: null,
            } satisfies RoleChangeResult;
          }

          await assertNotLastSchoolAdmin(tx, schoolId, userId);
          await tx.userRole.deleteMany({ where: { userId, schoolId } });

          return {
            changed: true,
            previousRoleId: existing[0].roleId,
          } satisfies RoleChangeResult;
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
      );

      if (result.changed) {
        logRoleChange({
          action: "remove",
          actorId,
          targetUserId: userId,
          schoolId,
          oldRoleId: result.previousRoleId,
          newRoleId: null,
        });
      }

      return result;
    } catch (err) {
      if (isSerializationFailure(err) && attempt < MAX_RETRIES) {
        continue;
      }
      throw err;
    }
  }

  /* istanbul ignore next -- unreachable: loop always returns or throws */
  throw new Error("removeUserRole: retry loop exited unexpectedly");
}
