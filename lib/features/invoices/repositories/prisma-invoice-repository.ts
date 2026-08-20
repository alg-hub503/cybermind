import { prisma } from "@/lib/prisma";
import { CreateInvoiceDto, Invoice } from "../types/invoice";
import { randomUUID } from "crypto";

export class PrismaInvoiceRepository {
  findAll() {
    return prisma.invoice.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        Client: true,
        Student: true,
      },
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
      include: {
        Client: true,
        Student: true,
      },
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
    const invoiceData: {
      id: string;
      amount: number;
      schoolId: string;
      clientId?: string | null;
      studentId?: string | null;
    } = {
      id: randomUUID(),
      amount: data.amount,
      schoolId: data.schoolId,
      clientId: data.clientId ?? null,
      studentId: data.studentId ?? null,
    };

    return prisma.invoice.create({ data: invoiceData });
  }

  async update(id: string, data: Partial<Invoice>): Promise<Invoice> {
    const updateData: Record<string, unknown> = {};
    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.clientId !== undefined) updateData.clientId = data.clientId;
    if (data.studentId !== undefined) updateData.studentId = data.studentId;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.dueDate !== undefined) updateData.dueDate = data.dueDate;
    if (data.period !== undefined) updateData.period = data.period;

    return prisma.invoice.update({
      where: { id },
      data: updateData,
    });
  }

  delete(id: string) {
    return prisma.invoice.delete({
      where: { id },
    });
  }
}
