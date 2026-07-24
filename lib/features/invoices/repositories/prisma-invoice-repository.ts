import { prisma } from "@/lib/prisma";
import { CreateInvoiceDto, Invoice } from "../types/invoice";
import { randomUUID } from "crypto";

export class PrismaInvoiceRepository {
  findAll() {
    return prisma.invoice.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  findById(id: string) {
    return prisma.invoice.findUnique({
      where: { id },
    });
  }

  findBySchool(schoolId: string, limit?: number) {
    return prisma.invoice.findMany({
      where: { schoolId },
      take: limit,
      orderBy: { createdAt: "desc" },
    });
  }

  countBySchool(schoolId: string) {
    return prisma.invoice.count({
      where: { schoolId },
    });
  }

  getRevenueBySchool(schoolId: string) {
    return prisma.invoice.aggregate({
      where: { schoolId },
      _sum: { amount: true },
    });
  }

  create(data: CreateInvoiceDto) {
    return prisma.invoice.create({
      data: {
        id: randomUUID(),
        ...data,
      },
    });
  }

  update(id: string, data: Partial<Invoice>) {
    return prisma.invoice.update({
      where: { id },
      data,
    });
  }

  delete(id: string) {
    return prisma.invoice.delete({
      where: { id },
    });
  }
}
