import { PrismaClassRepository } from "../repositories/prisma-class-repository";
import type { CreateClassDto, UpdateClassDto, ClassWithDetails } from "../types/class";

export class ClassService {
  private repository = new PrismaClassRepository();

  getAll() { return this.repository.findAll(); }
  getById(id: string) { return this.repository.findById(id); }
  getBySchool(schoolId: string) { return this.repository.findBySchool(schoolId); }
  getByGrade(gradeId: string) { return this.repository.findByGrade(gradeId); }
  create(data: CreateClassDto) { return this.repository.create(data); }
  update(id: string, data: UpdateClassDto) { return this.repository.update(id, data); }
  delete(id: string) { return this.repository.delete(id); }
  getByIdWithDetails(id: string): Promise<ClassWithDetails | null> {
    return this.repository.findByIdWithDetails(id);
  }
}
