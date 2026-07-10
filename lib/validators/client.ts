import { z } from "zod";

export const CreateClientSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Client name must contain at least 2 characters")
    .max(100, "Client name is too long"),
});

export const UpdateClientSchema = z.object({
  id: z.string().uuid("Invalid client id"),

  name: z
    .string()
    .trim()
    .min(2, "Client name must contain at least 2 characters")
    .max(100, "Client name is too long"),
});

export type CreateClientInput =
  z.infer<typeof CreateClientSchema>;

export type UpdateClientInput =
  z.infer<typeof UpdateClientSchema>;