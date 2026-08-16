import { PrismaGradeRepository } from "../repositories/prisma-grade-repository";
import type { CreateGradeDto, UpdateGradeDto, GradeWithClasses } from "../types/grade";

export class GradeService {
  private repository = new PrismaGradeRepository();

  getAll() { return this.repository.findAll(); }
  getById(id: string) { return this.repository.findById(id); }
  getBySchool(schoolId: string) { return this.repository.findBySchool(schoolId); }
  create(data: CreateGradeDto) { return this.repository.create(data); }
  update(id: string, data: UpdateGradeDto) { return this.repository.update(id, data); }
  delete(id: string) { return this.repository.delete(id); }
  getByIdWithClasses(id: string): Promise<GradeWithClasses | null> {
    return this.repository.findByIdWithClasses(id);
  }
}
