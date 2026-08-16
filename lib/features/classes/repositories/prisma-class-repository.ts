import { prisma } from "@/lib/prisma";
import type { Class, ClassWithDetails, CreateClassDto, UpdateClassDto } from "../types/class";

export class PrismaClassRepository {
  async findAll(): Promise<Class[]> {
    return prisma.class.findMany({
      orderBy: { createdAt: "desc" },
      include: { grade: true, academicYear: true },
    }) as unknown as Class[];
  }

  async findById(id: string): Promise<Class | null> {
    return prisma.class.findUnique({
      where: { id },
      include: { grade: true, academicYear: true },
    }) as unknown as Class | null;
  }

  async findBySchool(schoolId: string): Promise<Class[]> {
    return prisma.class.findMany({
      where: { schoolId },
      orderBy: { createdAt: "desc" },
      include: { grade: true, academicYear: true },
    }) as unknown as Class[];
  }

  async findByGrade(gradeId: string): Promise<Class[]> {
    return prisma.class.findMany({
      where: { gradeId },
      orderBy: { name: "asc" },
      include: { grade: true, academicYear: true },
    }) as unknown as Class[];
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

  async findByIdWithDetails(id: string): Promise<ClassWithDetails | null> {
    const cls = await prisma.class.findUnique({
      where: { id },
      include: {
        grade: { select: { id: true, name: true } },
        academicYear: { select: { id: true, name: true } },
      },
    });

    if (!cls) return null;

    const records = await prisma.studentAcademicRecord.findMany({
      where: {
        classId: cls.id,
        academicYearId: cls.academicYearId,
        schoolId: cls.schoolId,
      },
      include: {
        student: {
          select: { id: true, code: true, firstName: true, lastName: true },
        },
      },
    });

    const students = records.map((r) => r.student);

    return {
      id: cls.id,
      schoolId: cls.schoolId,
      name: cls.name,
      code: cls.code,
      grade: cls.grade,
      academicYear: cls.academicYear,
      students,
    };
  }
}
