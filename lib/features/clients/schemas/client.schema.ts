import { z } from "zod";
export const clientSchema = z.object({
  name: z.string().min(2),
  schoolId: z.string().min(1),
});
export type ClientSchema = z.infer<typeof clientSchema>;
