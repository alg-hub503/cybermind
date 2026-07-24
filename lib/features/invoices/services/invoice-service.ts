import { PrismaInvoiceRepository } from "../repositories/prisma-invoice-repository";
import { CreateInvoiceDto, UpdateInvoiceDto } from "../types/invoice";

export class InvoiceService {
  private repository = new PrismaInvoiceRepository();

  getAll() {
    return this.repository.findAll();
  }

  getById(id: string) {
    return this.repository.findById(id);
  }

  getBySchool(schoolId: string, limit?: number) {
    return this.repository.findBySchool(schoolId, limit);
  }

  countBySchool(schoolId: string) {
    return this.repository.countBySchool(schoolId);
  }

  getRevenueBySchool(schoolId: string) {
    return this.repository.getRevenueBySchool(schoolId);
  }

  create(data: CreateInvoiceDto) {
    return this.repository.create(data);
  }

  update(id: string, data: UpdateInvoiceDto) {
    return this.repository.update(id, data);
  }

  delete(id: string) {
    return this.repository.delete(id);
  }
}
