import { PrismaAcademicYearRepository } from "../repositories/prisma-academic-year-repository";
import type { CreateAcademicYearDto, UpdateAcademicYearDto } from "../types/academic-year";

export class AcademicYearService {
  private repository = new PrismaAcademicYearRepository();

  getAll() {
    return this.repository.findAll();
  }

  getById(id: string) {
    return this.repository.findById(id);
  }

  getBySchool(schoolId: string) {
    return this.repository.findBySchool(schoolId);
  }

  create(data: CreateAcademicYearDto) {
    return this.repository.create(data);
  }

  update(id: string, data: UpdateAcademicYearDto) {
    return this.repository.update(id, data);
  }

  delete(id: string) {
    return this.repository.delete(id);
  }
}
