import { z } from "zod";
export const schoolSchema = z.object({
  name: z.string().min(2),
});
export type SchoolSchema = z.infer<typeof schoolSchema>;
