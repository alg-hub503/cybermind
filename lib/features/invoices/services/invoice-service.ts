import { PrismaInvoiceRepository } from "../repositories/prisma-invoice-repository";
import { CreateInvoiceDto, Invoice, UpdateInvoiceDto } from "../types/invoice";

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
    const hasClient = Boolean(data.clientId);
    const hasStudent = Boolean(data.studentId);

    if (hasClient === hasStudent) {
      throw new Error("Exactly one of clientId or studentId is required");
    }

    return this.repository.create(data);
  }

  async update(id: string, data: UpdateInvoiceDto): Promise<Invoice> {
    const existingInvoice = await this.repository.findById(id);

    if (!existingInvoice) {
      throw new Error("Invoice not found");
    }

    if (
      (data.clientId !== undefined && data.clientId !== existingInvoice.clientId) ||
      (data.studentId !== undefined && data.studentId !== existingInvoice.studentId)
    ) {
      throw new Error("Cannot change invoice ownership type after creation.");
    }

    return this.repository.update(id, data);
  }

  delete(id: string) {
    return this.repository.delete(id);
  }
}
