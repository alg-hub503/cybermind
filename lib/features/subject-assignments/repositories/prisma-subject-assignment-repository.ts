import { prisma } from "@/lib/prisma";
import type {
  SubjectAssignment,
  CreateSubjectAssignmentDto,
} from "../types/subject-assignment";

export class PrismaSubjectAssignmentRepository {
  async findBySchool(schoolId: string): Promise<SubjectAssignment[]> {
    return prisma.subjectAssignment.findMany({
      where: { schoolId },
      orderBy: { createdAt: "desc" },
      include: {
        class: { select: { id: true, name: true } },
        teacher: { select: { id: true, user: { select: { name: true } } } },
      },
    }) as unknown as SubjectAssignment[];
  }

  async findByClass(classId: string): Promise<SubjectAssignment[]> {
    return prisma.subjectAssignment.findMany({
      where: { classId },
      orderBy: { subject: "asc" },
      include: {
        class: { select: { id: true, name: true } },
        teacher: { select: { id: true, user: { select: { name: true } } } },
      },
    }) as unknown as SubjectAssignment[];
  }

  async findById(id: string): Promise<SubjectAssignment | null> {
    return prisma.subjectAssignment.findUnique({
      where: { id },
      include: {
        class: { select: { id: true, name: true } },
        teacher: { select: { id: true, user: { select: { name: true } } } },
      },
    }) as unknown as SubjectAssignment | null;
  }

  async create(data: CreateSubjectAssignmentDto): Promise<SubjectAssignment> {
    return prisma.subjectAssignment.create({ data }) as unknown as SubjectAssignment;
  }

  async delete(id: string): Promise<SubjectAssignment> {
    return prisma.subjectAssignment.delete({ where: { id } }) as unknown as SubjectAssignment;
  }
}
