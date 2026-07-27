import { z } from "zod";

export const gradeBaseSchema = z.object({
  schoolId: z.string().min(1, "School is required"),
  name: z.string().min(1, "Name is required"),
  order: z.number().int().min(0, "Order must be 0 or greater"),
});

export const gradeSchema = gradeBaseSchema;

export const updateGradeSchema = gradeBaseSchema.partial();

export type GradeSchema = z.infer<typeof gradeSchema>;
