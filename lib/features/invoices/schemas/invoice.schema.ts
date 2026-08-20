import { z } from "zod";

export const invoiceSchema = z.object({
  amount: z.number().positive(),
  schoolId: z.string().min(1),
  clientId: z.string().min(1).optional(),
  studentId: z.string().min(1).optional(),
}).refine(
  (data) => Boolean(data.clientId) !== Boolean(data.studentId),
  { message: "Exactly one of clientId or studentId is required" }
);

export type InvoiceSchema = z.infer<typeof invoiceSchema>;
