import { prisma } from "@/lib/prisma";
import { Client } from "../types/client";

export class PrismaClientRepository {
  findAll() {
    return prisma.client.findMany({
      orderBy: { name: "asc" },
    });
  }

  findById(id: string) {
    return prisma.client.findUnique({
      where: { id },
    });
  }

  findBySchool(schoolId: string, limit?: number) {
    return prisma.client.findMany({
      where: { schoolId },
      take: limit,
      orderBy: { name: "asc" },
    });
  }

  countBySchool(schoolId: string) {
    return prisma.client.count({
      where: { schoolId },
    });
  }

  create(data: Omit<Client, "id">) {
    return prisma.client.create({
      data,
    });
  }

  update(id: string, data: Partial<Client>) {
    return prisma.client.update({
      where: { id },
      data,
    });
  }

  delete(id: string) {
    return prisma.client.delete({
      where: { id },
    });
  }
}
