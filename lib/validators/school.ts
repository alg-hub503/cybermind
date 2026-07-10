import { z } from "zod";

export const SchoolSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "School name is too short")
    .max(100, "School name is too long"),
});

export type SchoolInput =
  z.infer<typeof SchoolSchema>;