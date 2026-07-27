import { prisma } from "@/lib/prisma";
import type { Class, CreateClassDto, UpdateClassDto } from "../types/class";

export class PrismaClassRepository {
  async findAll(): Promise<Class[]> {
    return prisma.class.findMany({ orderBy: { createdAt: "desc" } }) as unknown as Class[];
  }

  async findById(id: string): Promise<Class | null> {
    return prisma.class.findUnique({ where: { id } }) as unknown as Class | null;
  }

  async findBySchool(schoolId: string): Promise<Class[]> {
    return prisma.class.findMany({ where: { schoolId }, orderBy: { createdAt: "desc" } }) as unknown as Class[];
  }

  async findByGrade(gradeId: string): Promise<Class[]> {
    return prisma.class.findMany({ where: { gradeId }, orderBy: { name: "asc" } }) as unknown as Class[];
  }

  async create(data: CreateClassDto): Promise<Class> {
    return prisma.class.create({ data }) as unknown as Class;
  }

  async update(id: string, data: UpdateClassDto): Promise<Class> {
    const updateData: Record<string, unknown> = {};
    if (data.gradeId !== undefined) updateData.gradeId = data.gradeId;
    if (data.academicYearId !== undefined) updateData.academicYearId = data.academicYearId;
    if (data.name !== undefined) updateData.name = data.name;
    if (data.code !== undefined) updateData.code = data.code;

    return prisma.class.update({ where: { id }, data: updateData }) as unknown as Class;
  }

  async delete(id: string): Promise<Class> {
    return prisma.class.delete({ where: { id } }) as unknown as Class;
  }
}
