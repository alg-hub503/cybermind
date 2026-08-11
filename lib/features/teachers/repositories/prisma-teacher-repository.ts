import { prisma } from "@/lib/prisma";
import type { CreateTeacherDto, UpdateTeacherDto } from "../types/teacher";

export class PrismaTeacherRepository {
  async findAll() {
    return prisma.teacherProfile.findMany({
      include: { user: { select: { id: true, name: true, email: true, role: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: string) {
    return prisma.teacherProfile.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true, email: true, role: true } } },
    });
  }

  async findBySchool(schoolId: string) {
    return prisma.teacherProfile.findMany({
      where: { schoolId },
      include: { user: { select: { id: true, name: true, email: true, role: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  async findByUserId(userId: string) {
    return prisma.teacherProfile.findUnique({
      where: { userId },
      include: { user: { select: { id: true, name: true, email: true, role: true } } },
    });
  }

  async create(data: CreateTeacherDto) {
    const { hireDate, schoolId, name, email, password, phone, specialization, qualifications } = data;
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          password,
          role: "TEACHER",
          schoolId,
        },
        select: { id: true, name: true, email: true, role: true },
      });

      const profile = await tx.teacherProfile.create({
        data: {
          userId: user.id,
          schoolId,
          phone: phone ?? null,
          specialization: specialization ?? null,
          qualifications: qualifications ?? null,
          hireDate: hireDate ? new Date(hireDate) : null,
        },
      });

      return { ...profile, user };
    });
  }

  async update(id: string, data: UpdateTeacherDto) {
    const updateData: Record<string, unknown> = {};
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.specialization !== undefined) updateData.specialization = data.specialization;
    if (data.qualifications !== undefined) updateData.qualifications = data.qualifications;
    if (data.hireDate !== undefined) {
      updateData.hireDate = data.hireDate ? new Date(data.hireDate) : null;
    }
    if (data.status !== undefined) updateData.status = data.status;

    return prisma.teacherProfile.update({
      where: { id },
      data: updateData,
      include: { user: { select: { id: true, name: true, email: true, role: true } } },
    });
  }

  async delete(id: string) {
    return prisma.teacherProfile.delete({ where: { id } });
  }
}
