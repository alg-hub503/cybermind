import { PrismaClientRepository } from "../repositories/prisma-client-repository";
import { CreateClientDto, UpdateClientDto } from "../types/client";

export class ClientService {
  private repository = new PrismaClientRepository();

  getAll() {
    return this.repository.findAll();
  }

  getById(id: string) {
    return this.repository.findById(id);
  }

  getByIdWithDetails(id: string) {
    return this.repository.findByIdWithDetails(id);
  }

  getBySchool(schoolId: string, limit?: number) {
    return this.repository.findBySchool(schoolId, limit);
  }

  countBySchool(schoolId: string) {
    return this.repository.countBySchool(schoolId);
  }

  create(data: CreateClientDto) {
    return this.repository.create(data);
  }

  update(id: string, data: UpdateClientDto) {
    return this.repository.update(id, data);
  }

  delete(id: string) {
    return this.repository.delete(id);
  }
}
