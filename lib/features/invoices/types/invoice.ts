export interface Invoice {
  id: string;
  amount: number;
  clientId: string | null;
  schoolId: string;
  studentId: string | null;  // NEW
  status: string; // InvoiceStatus enum as string
  dueDate: Date | null;  // NEW
  period: string | null;  // NEW
  createdAt: Date;
  Client?: Client | null;
  Student?: Student | null;
}
export interface CreateInvoiceDto {
  amount: number;
  clientId?: string;
  schoolId: string;
  studentId?: string;  // NEW
}
export interface UpdateInvoiceDto {
  amount?: number;
  clientId?: string;
  studentId?: string;
}

interface Client {
  id: string;
  name: string;
}
interface Student {
  id: string;
  firstName: string;
  lastName: string;
}
