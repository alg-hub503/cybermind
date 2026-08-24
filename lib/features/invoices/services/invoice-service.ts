import { PrismaInvoiceRepository } from "../repositories/prisma-invoice-repository";
import { CreateInvoiceDto, Invoice, UpdateInvoiceDto } from "../types/invoice";

const DUPLICATE_INVOICE_ERROR = "DUPLICATE_INVOICE";

export class InvoiceService {
  private repository = new PrismaInvoiceRepository();

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

  getRevenueBySchool(schoolId: string) {
    return this.repository.getRevenueBySchool(schoolId);
  }

  async create(data: CreateInvoiceDto) {
    const hasClient = Boolean(data.clientId);
    const hasStudent = Boolean(data.studentId);

    if (hasClient === hasStudent) {
      throw new Error("Exactly one of clientId or studentId is required");
    }

    const duplicate = await this.repository.findDuplicate({
      schoolId: data.schoolId,
      amount: data.amount,
      clientId: data.clientId,
      studentId: data.studentId,
    });

    if (duplicate) {
      const err = new Error(DUPLICATE_INVOICE_ERROR);
      err.name = DUPLICATE_INVOICE_ERROR;
      throw err;
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

    const checkAmount = data.amount ?? existingInvoice.amount;
    const checkClientId = data.clientId !== undefined ? data.clientId : existingInvoice.clientId;
    const checkStudentId = data.studentId !== undefined ? data.studentId : existingInvoice.studentId;

    const duplicate = await this.repository.findDuplicate({
      schoolId: existingInvoice.schoolId,
      amount: checkAmount,
      clientId: checkClientId,
      studentId: checkStudentId,
      excludeId: id,
    });

    if (duplicate) {
      const err = new Error(DUPLICATE_INVOICE_ERROR);
      err.name = DUPLICATE_INVOICE_ERROR;
      throw err;
    }

    return this.repository.update(id, data);
  }

  delete(id: string) {
    return this.repository.delete(id);
  }
}
