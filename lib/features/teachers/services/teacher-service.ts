import { PrismaTeacherRepository } from "../repositories/prisma-teacher-repository";
import type { CreateTeacherDto, UpdateTeacherDto } from "../types/teacher";

export class TeacherService {
  private repository = new PrismaTeacherRepository();

  getAll() { return this.repository.findAll(); }
  getById(id: string) { return this.repository.findById(id); }
  getBySchool(schoolId: string) { return this.repository.findBySchool(schoolId); }
  getByUserId(userId: string) { return this.repository.findByUserId(userId); }
  create(data: CreateTeacherDto) { return this.repository.create(data); }
  update(id: string, data: UpdateTeacherDto) { return this.repository.update(id, data); }
  delete(id: string) { return this.repository.delete(id); }
}
