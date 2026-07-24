import { prisma } from "@/lib/prisma";
import { School } from "../types/school";

export class PrismaSchoolRepository {
  findAll() {
    return prisma.school.findMany({
      orderBy: { name: "asc" },
    });
  }

  findById(id: string) {
    return prisma.school.findUnique({
      where: { id },
      include: { subscription: true },
    });
  }

  create(data: Omit<School, "id">) {
    return prisma.school.create({
      data,
    });
  }

  update(id: string, data: Partial<School>) {
    return prisma.school.update({
      where: { id },
      data,
    });
  }

  delete(id: string) {
    return prisma.school.delete({
      where: { id },
    });
  }
}
