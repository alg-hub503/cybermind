import { prisma } from "@/lib/prisma";

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  schoolId: true,
  subscriptionStatus: true,
} as const;

export class PrismaUserRepository {
  findBySchool(schoolId: string) {
    return prisma.user.findMany({
      where: { schoolId },
      select: userSelect,
      orderBy: { role: "asc" },
    });
  }

  countBySchool(schoolId: string) {
    return prisma.user.count({
      where: { schoolId },
    });
  }
}
