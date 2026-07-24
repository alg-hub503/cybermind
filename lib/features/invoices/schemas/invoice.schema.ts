import { z } from "zod";
export const invoiceSchema = z.object({
  amount: z.number().positive(),
  clientId: z.string().min(1),
  schoolId: z.string().min(1),
});
export type InvoiceSchema = z.infer<typeof invoiceSchema>;
