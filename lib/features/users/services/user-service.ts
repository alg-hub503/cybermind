import { PrismaUserRepository } from "../repositories/prisma-user-repository";

export class UserService {
  private repository = new PrismaUserRepository();

  getBySchool(schoolId: string) {
    return this.repository.findBySchool(schoolId);
  }

  getById(id: string) {
    return this.repository.findById(id);
  }

  countBySchool(schoolId: string) {
    return this.repository.countBySchool(schoolId);
  }
}
