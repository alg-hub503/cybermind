import { prisma } from "@/lib/prisma";

export class PrismaPermissionRepository {
  async findAll() {
    return prisma.permission.findMany({
      orderBy: { code: "asc" },
    });
  }

  async findByCode(code: string) {
    return prisma.permission.findUnique({
      where: { code },
    });
  }
}
