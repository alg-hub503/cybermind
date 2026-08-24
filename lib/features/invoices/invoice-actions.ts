import { InvoiceService } from "@/lib/features/invoices/services/invoice-service";

const service = new InvoiceService();

export const getInvoices = () => service.getAll();
export const getInvoice = (id: string) => service.getById(id);
export const getInvoiceWithDetails = (id: string) => service.getByIdWithDetails(id);
export const getInvoicesBySchool = (schoolId: string, limit?: number) => service.getBySchool(schoolId, limit);
export const countInvoicesBySchool = (schoolId: string) => service.countBySchool(schoolId);
export const getRevenueBySchool = (schoolId: string) => service.getRevenueBySchool(schoolId);
export const createInvoice = (data: Parameters<InvoiceService["create"]>[0]) => service.create(data);
export const updateInvoice = (id: string, data: Parameters<InvoiceService["update"]>[1]) => service.update(id, data);
export const deleteInvoice = (id: string) => service.delete(id);
