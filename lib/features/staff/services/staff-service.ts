import { PrismaStaffRepository } from "../repositories/prisma-staff-repository";
import type { CreateStaffDto, UpdateStaffDto } from "../types/staff";

export class StaffService {
  private repository = new PrismaStaffRepository();

  getAll() { return this.repository.findAll(); }
  getById(id: string) { return this.repository.findById(id); }
  getBySchool(schoolId: string) { return this.repository.findBySchool(schoolId); }
  getByUserId(userId: string) { return this.repository.findByUserId(userId); }
  create(data: CreateStaffDto) { return this.repository.create(data); }
  update(id: string, data: UpdateStaffDto) { return this.repository.update(id, data); }
  delete(id: string) { return this.repository.delete(id); }
}
