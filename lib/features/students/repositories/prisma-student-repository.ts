import { prisma } from "@/lib/prisma";
import type { Student, StudentWithDetails, CreateStudentDto, UpdateStudentDto } from "../types/student";

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

  async findByIdWithDetails(id: string): Promise<StudentWithDetails | null> {
    const student = await prisma.student.findUnique({ where: { id } });
    if (!student) return null;

    const records = await prisma.studentAcademicRecord.findMany({
      where: {
        studentId: student.id,
        schoolId: student.schoolId,
      },
      include: {
        academicYear: { select: { id: true, name: true } },
        class: { select: { id: true, name: true, academicYearId: true } },
      },
    });

    // Defensive consistency filter: Prisma schema has no @@unique constraint
    // linking StudentAcademicRecord.academicYearId to Class.academicYearId.
    // A mismatched academic year/class pair could appear if data integrity
    // was violated at the database level. We filter on the JS side to guarantee
    // the displayed history shows only internally consistent (academicYear ↔ class)
    // enrollments — identical to the pattern used in Class Detail.
    const consistentRecords = records.filter(
      (r) => r.academicYearId === r.class.academicYearId
    );

    const academicHistory = consistentRecords.map((r) => ({
      academicYear: r.academicYear,
      class: { id: r.class.id, name: r.class.name },
      enrolledAt: r.enrolledAt,
    }));

    return {
      id: student.id,
      schoolId: student.schoolId,
      code: student.code,
      firstName: student.firstName,
      lastName: student.lastName,
      dateOfBirth: student.dateOfBirth,
      status: student.status,
      academicHistory,
    };
  }
}
