import { PrismaSchoolRepository } from "../repositories/prisma-school-repository";
import { CreateSchoolDto, UpdateSchoolDto } from "../types/school";

export class SchoolService {
  private repository = new PrismaSchoolRepository();

  getAll() {
    return this.repository.findAll();
  }

  getById(id: string) {
    return this.repository.findById(id);
  }

  create(data: CreateSchoolDto) {
    return this.repository.create(data);
  }

  update(id: string, data: UpdateSchoolDto) {
    return this.repository.update(id, data);
  }

  delete(id: string) {
    return this.repository.delete(id);
  }
}
