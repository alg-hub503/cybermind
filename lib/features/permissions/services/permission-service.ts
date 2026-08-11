import { PrismaPermissionRepository } from "../repositories/prisma-permission-repository";

export class PermissionService {
  private repository = new PrismaPermissionRepository();

  getAll() { return this.repository.findAll(); }
  getByCode(code: string) { return this.repository.findByCode(code); }
}
