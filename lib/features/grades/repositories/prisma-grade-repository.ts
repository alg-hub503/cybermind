import { prisma } from "@/lib/prisma";
import type {
  Grade,
  GradeWithClasses,
  CreateGradeDto,
  UpdateGradeDto,
} from "../types/grade";

export class PrismaGradeRepository {
  async findAll(): Promise<Grade[]> {
    return prisma.grade.findMany({ orderBy: { order: "asc" } }) as unknown as Grade[];
  }

  async findById(id: string): Promise<Grade | null> {
    return prisma.grade.findUnique({ where: { id } }) as unknown as Grade | null;
  }

  async findBySchool(schoolId: string): Promise<Grade[]> {
    return prisma.grade.findMany({ where: { schoolId }, orderBy: { order: "asc" } }) as unknown as Grade[];
  }

  async create(data: CreateGradeDto): Promise<Grade> {
    return prisma.grade.create({ data }) as unknown as Grade;
  }

  async update(id: string, data: UpdateGradeDto): Promise<Grade> {
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.order !== undefined) updateData.order = data.order;

    return prisma.grade.update({ where: { id }, data: updateData }) as unknown as Grade;
  }

  async delete(id: string): Promise<Grade> {
    return prisma.grade.delete({ where: { id } }) as unknown as Grade;
  }

  async findByIdWithClasses(id: string): Promise<GradeWithClasses | null> {
    const grade = await prisma.grade.findUnique({
      where: { id },
      include: {
        Class: {
          select: {
            id: true,
            name: true,
            code: true,
            academicYear: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!grade) return null;

    const { Class: classes, ...rest } = grade;
    return { ...rest, classes } as unknown as GradeWithClasses;
  }
}
