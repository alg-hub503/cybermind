import { prisma } from "@/lib/prisma";
import type { CreateStaffDto, UpdateStaffDto } from "../types/staff";

export class PrismaStaffRepository {
  async findAll() {
    return prisma.staffProfile.findMany({
      include: { user: { select: { id: true, name: true, email: true, role: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: string) {
    return prisma.staffProfile.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true, email: true, role: true } } },
    });
  }

  async findBySchool(schoolId: string) {
    return prisma.staffProfile.findMany({
      where: { schoolId },
      include: { user: { select: { id: true, name: true, email: true, role: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  async findByUserId(userId: string) {
    return prisma.staffProfile.findUnique({
      where: { userId },
      include: { user: { select: { id: true, name: true, email: true, role: true } } },
    });
  }

  async create(data: CreateStaffDto) {
    const { hireDate, schoolId, name, email, password, phone, position, department } = data;
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          password,
          role: "STAFF",
          schoolId,
        },
        select: { id: true, name: true, email: true, role: true },
      });

      const profile = await tx.staffProfile.create({
        data: {
          userId: user.id,
          schoolId,
          phone: phone ?? null,
          position: position ?? null,
          department: department ?? null,
          hireDate: hireDate ? new Date(hireDate) : null,
        },
      });

      return { ...profile, user };
    });
  }

  async update(id: string, data: UpdateStaffDto) {
    const updateData: Record<string, unknown> = {};
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.position !== undefined) updateData.position = data.position;
    if (data.department !== undefined) updateData.department = data.department;
    if (data.hireDate !== undefined) {
      updateData.hireDate = data.hireDate ? new Date(data.hireDate) : null;
    }
    if (data.status !== undefined) updateData.status = data.status;

    return prisma.staffProfile.update({
      where: { id },
      data: updateData,
      include: { user: { select: { id: true, name: true, email: true, role: true } } },
    });
  }

  async delete(id: string) {
    return prisma.staffProfile.delete({ where: { id } });
  }
}
