import bcrypt from "bcryptjs";
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
    const hashedPassword = await bcrypt.hash(String(password), 12);
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
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
    const profileData: Record<string, unknown> = {};
    if (data.phone !== undefined) profileData.phone = data.phone;
    if (data.specialization !== undefined) profileData.specialization = data.specialization;
    if (data.qualifications !== undefined) profileData.qualifications = data.qualifications;
    if (data.hireDate !== undefined) {
      profileData.hireDate = data.hireDate ? new Date(data.hireDate) : null;
    }
    if (data.status !== undefined) profileData.status = data.status;

    const profile = await prisma.teacherProfile.findUnique({ where: { id }, select: { userId: true } });
    if (!profile) throw new Error("Teacher not found");

    return prisma.$transaction(async (tx) => {
      if (data.name !== undefined) {
        await tx.user.update({ where: { id: profile.userId }, data: { name: data.name } });
      }

      return tx.teacherProfile.update({
        where: { id },
        data: profileData,
        include: { user: { select: { id: true, name: true, email: true, role: true } } },
      });
    });
  }

  async delete(id: string) {
    return prisma.teacherProfile.delete({ where: { id } });
  }
}
