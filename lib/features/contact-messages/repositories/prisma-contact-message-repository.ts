import { prisma } from "@/lib/prisma";
import type { ContactMessage, CreateContactMessageDto } from "../types/contact-message";

export class PrismaContactMessageRepository {
  async create(data: CreateContactMessageDto): Promise<ContactMessage> {
    return prisma.contactMessage.create({
      data: {
        userId: data.userId,
        schoolId: data.schoolId ?? null,
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
      },
    }) as unknown as ContactMessage;
  }

  async findById(id: string): Promise<ContactMessage | null> {
    return prisma.contactMessage.findUnique({
      where: { id },
    }) as unknown as ContactMessage | null;
  }

  async findByUser(userId: string): Promise<ContactMessage[]> {
    return prisma.contactMessage.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }) as unknown as ContactMessage[];
  }

  async findAll(): Promise<ContactMessage[]> {
    return prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
    }) as unknown as ContactMessage[];
  }

  async updateStatus(id: string, status: "NEW" | "READ" | "REPLIED"): Promise<ContactMessage> {
    return prisma.contactMessage.update({
      where: { id },
      data: { status },
    }) as unknown as ContactMessage;
  }
}
