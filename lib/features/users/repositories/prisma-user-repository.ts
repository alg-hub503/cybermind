import { prisma } from "@/lib/prisma";

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  schoolId: true,
} as const;

export class PrismaUserRepository {
  findBySchool(schoolId: string) {
    return prisma.user.findMany({
      where: { schoolId },
      select: userSelect,
      orderBy: { role: "asc" },
    });
  }

  findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        ...userSelect,
        School: { select: { id: true, name: true } },
      },
    });
  }

  countBySchool(schoolId: string) {
    return prisma.user.count({
      where: { schoolId },
    });
  }

  /**
   * Same as findBySchool(), plus each user's current school-scoped role (if
   * any). Under the "one role per user per school" invariant enforced by
   * assignUserRole()/removeUserRole(), `userRoles` has at most one entry.
   */
  findBySchoolWithRoles(schoolId: string) {
    return prisma.user.findMany({
      where: { schoolId },
      select: {
        ...userSelect,
        userRoles: {
          where: { schoolId },
          select: {
            roleId: true,
            role: { select: { id: true, name: true, systemKey: true } },
          },
        },
      },
      orderBy: { role: "asc" },
    });
  }
}
