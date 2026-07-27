import { prisma } from "@/lib/prisma";
import type { Student, CreateStudentDto, UpdateStudentDto } from "../types/student";

export class PrismaStudentRepository {
  async findAll(): Promise<Student[]> {
    return prisma.student.findMany({ orderBy: { createdAt: "desc" } }) as unknown as Student[];
  }

  async findById(id: string): Promise<Student | null> {
    return prisma.student.findUnique({ where: { id } }) as unknown as Student | null;
  }

  async findBySchool(schoolId: string): Promise<Student[]> {
    return prisma.student.findMany({ where: { schoolId }, orderBy: { createdAt: "desc" } }) as unknown as Student[];
  }

  async findByCode(schoolId: string, code: string): Promise<Student | null> {
    return prisma.student.findUnique({
      where: { schoolId_code: { schoolId, code } },
    }) as unknown as Student | null;
  }

  async create(data: CreateStudentDto): Promise<Student> {
    const { dateOfBirth, ...rest } = data;
    return prisma.student.create({
      data: {
        ...rest,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      },
    }) as unknown as Student;
  }

  async update(id: string, data: UpdateStudentDto): Promise<Student> {
    const updateData: Record<string, unknown> = {};
    if (data.code !== undefined) updateData.code = data.code;
    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.dateOfBirth !== undefined) {
      updateData.dateOfBirth = data.dateOfBirth ? new Date(data.dateOfBirth) : null;
    }
    if (data.status !== undefined) updateData.status = data.status;

    return prisma.student.update({ where: { id }, data: updateData }) as unknown as Student;
  }

  async delete(id: string): Promise<Student> {
    return prisma.student.delete({ where: { id } }) as unknown as Student;
  }
}
