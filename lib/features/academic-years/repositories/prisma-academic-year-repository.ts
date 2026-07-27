import { prisma } from "@/lib/prisma";
import type { AcademicYear, CreateAcademicYearDto, UpdateAcademicYearDto } from "../types/academic-year";

export class PrismaAcademicYearRepository {
  async findAll(): Promise<AcademicYear[]> {
    return prisma.academicYear.findMany({
      orderBy: { startDate: "desc" },
    }) as unknown as AcademicYear[];
  }

  async findById(id: string): Promise<AcademicYear | null> {
    return prisma.academicYear.findUnique({ where: { id } }) as unknown as AcademicYear | null;
  }

  async findBySchool(schoolId: string): Promise<AcademicYear[]> {
    return prisma.academicYear.findMany({
      where: { schoolId },
      orderBy: { startDate: "desc" },
    }) as unknown as AcademicYear[];
  }

  async create(data: CreateAcademicYearDto): Promise<AcademicYear> {
    return prisma.academicYear.create({
      data: {
        schoolId: data.schoolId,
        name: data.name,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        isCurrent: data.isCurrent,
      },
    }) as unknown as AcademicYear;
  }

  async update(id: string, data: UpdateAcademicYearDto): Promise<AcademicYear> {
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate);
    if (data.endDate !== undefined) updateData.endDate = new Date(data.endDate);
    if (data.isCurrent !== undefined) updateData.isCurrent = data.isCurrent;

    return prisma.academicYear.update({
      where: { id },
      data: updateData,
    }) as unknown as AcademicYear;
  }

  async delete(id: string): Promise<AcademicYear> {
    return prisma.academicYear.delete({ where: { id } }) as unknown as AcademicYear;
  }
}
