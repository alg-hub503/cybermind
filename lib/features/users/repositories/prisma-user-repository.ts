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
}
