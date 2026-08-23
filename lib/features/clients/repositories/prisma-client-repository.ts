import { prisma } from "@/lib/prisma";
import { Client } from "../types/client";

export class PrismaClientRepository {
  findAll() {
    return prisma.client.findMany({
      orderBy: { name: "asc" },
      include: { School: true },
    });
  }

  findById(id: string) {
    return prisma.client.findUnique({
      where: { id },
    });
  }

  findByIdWithDetails(id: string) {
    return prisma.client.findUnique({
      where: { id },
      include: { School: true, Invoice: { orderBy: { createdAt: "desc" } } },
    });
  }

  findBySchool(schoolId: string, limit?: number) {
    return prisma.client.findMany({
      where: { schoolId },
      take: limit,
      orderBy: { name: "asc" },
      include: { School: true },
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
