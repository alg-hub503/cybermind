export interface Invoice {
  id: string;
  amount: number;
  clientId: string;
  schoolId: string;
  createdAt: Date;
}
export interface CreateInvoiceDto {
  amount: number;
  clientId: string;
  schoolId: string;
}
export interface UpdateInvoiceDto {
  amount?: number;
}
