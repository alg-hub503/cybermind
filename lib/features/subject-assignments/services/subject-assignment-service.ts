import { PrismaSubjectAssignmentRepository } from "../repositories/prisma-subject-assignment-repository";
import type { CreateSubjectAssignmentDto } from "../types/subject-assignment";

export class SubjectAssignmentService {
  private repository = new PrismaSubjectAssignmentRepository();

  getBySchool(schoolId: string) { return this.repository.findBySchool(schoolId); }
  getByClass(classId: string) { return this.repository.findByClass(classId); }
  getById(id: string) { return this.repository.findById(id); }
  create(data: CreateSubjectAssignmentDto) { return this.repository.create(data); }
  delete(id: string) { return this.repository.delete(id); }
}
