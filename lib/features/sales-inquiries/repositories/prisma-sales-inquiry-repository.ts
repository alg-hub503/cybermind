import { prisma } from "@/lib/prisma";
import type { SalesInquiry, CreateSalesInquiryDto } from "../types/sales-inquiry";

export class PrismaSalesInquiryRepository {
  async create(data: CreateSalesInquiryDto): Promise<SalesInquiry> {
    return prisma.salesInquiry.create({
      data: {
        userId: data.userId,
        schoolId: data.schoolId ?? null,
        organizationName: data.organizationName,
        contactName: data.contactName,
        email: data.email,
        phone: data.phone ?? null,
        studentCount: data.studentCount ?? null,
        currentSolution: data.currentSolution ?? null,
        requirements: data.requirements,
        demoRequested: data.demoRequested ?? false,
      },
    }) as unknown as SalesInquiry;
  }

  async findById(id: string): Promise<SalesInquiry | null> {
    return prisma.salesInquiry.findUnique({
      where: { id },
    }) as unknown as SalesInquiry | null;
  }

  async findByUser(userId: string): Promise<SalesInquiry[]> {
    return prisma.salesInquiry.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }) as unknown as SalesInquiry[];
  }

  async findAll(): Promise<SalesInquiry[]> {
    return prisma.salesInquiry.findMany({
      orderBy: { createdAt: "desc" },
    }) as unknown as SalesInquiry[];
  }

  async updateStatus(id: string, status: "NEW" | "CONTACTED" | "QUALIFIED" | "CLOSED"): Promise<SalesInquiry> {
    return prisma.salesInquiry.update({
      where: { id },
      data: { status },
    }) as unknown as SalesInquiry;
  }
}
