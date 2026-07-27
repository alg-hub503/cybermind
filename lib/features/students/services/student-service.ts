import { PrismaStudentRepository } from "../repositories/prisma-student-repository";
import type { CreateStudentDto, UpdateStudentDto } from "../types/student";

export class StudentService {
  private repository = new PrismaStudentRepository();

  getAll() { return this.repository.findAll(); }
  getById(id: string) { return this.repository.findById(id); }
  getBySchool(schoolId: string) { return this.repository.findBySchool(schoolId); }
  getByCode(schoolId: string, code: string) { return this.repository.findByCode(schoolId, code); }
  create(data: CreateStudentDto) { return this.repository.create(data); }
  update(id: string, data: UpdateStudentDto) { return this.repository.update(id, data); }
  delete(id: string) { return this.repository.delete(id); }
}
