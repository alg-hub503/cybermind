import { z } from "zod";

export const CreateInvoiceSchema = z.object({
  clientId: z.string().uuid("Invalid client id"),

  amount: z
    .number()
    .positive("Amount must be greater than zero"),
});

export type CreateInvoiceInput =
  z.infer<typeof CreateInvoiceSchema>;