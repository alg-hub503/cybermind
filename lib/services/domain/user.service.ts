import { prisma } from "@/lib/prisma";
import { normalizeEmail } from "@/lib/auth-input";

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: {
      email,
    },
  });
}

export async function getUserCountBySchool(schoolId: string) {
  return prisma.user.count({
    where: {
      schoolId,
    },
  });
}

/**
 * Finds a user by email for login / password reset / duplicate checks.
 *
 * New accounts are stored lower-case, so the exact lookup (indexed) hits first.
 * The case-insensitive fallback exists for legacy rows that were saved with
 * mixed case before emails were normalized.
 */
export async function findUserByLoginEmail(rawEmail: string) {
  const email = normalizeEmail(rawEmail);

  if (!email) {
    return null;
  }

  const exact = await prisma.user.findUnique({ where: { email } });

  if (exact) {
    return exact;
  }

  return prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
  });
}
