import { PrismaRoleRepository } from "../repositories/prisma-role-repository";
import type { CreateRoleDto, UpdateRoleDto } from "../types/role";

export class RoleService {
  private repository = new PrismaRoleRepository();

  getAll() { return this.repository.findAll(); }
  getBySchoolId(schoolId: string) { return this.repository.findBySchoolId(schoolId); }
  getById(id: string) { return this.repository.findById(id); }
  getByName(name: string, schoolId: string) { return this.repository.findByName(name, schoolId); }
  create(data: CreateRoleDto) { return this.repository.create(data); }
  update(id: string, data: UpdateRoleDto) { return this.repository.update(id, data); }
  delete(id: string) { return this.repository.delete(id); }
}
