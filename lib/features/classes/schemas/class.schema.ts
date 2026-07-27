import { z } from "zod";

export const classBaseSchema = z.object({
  schoolId: z.string().min(1, "School is required"),
  gradeId: z.string().min(1, "Grade is required"),
  academicYearId: z.string().min(1, "Academic year is required"),
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
});

export const classSchema = classBaseSchema;

export const updateClassSchema = classBaseSchema.partial();

export type ClassSchema = z.infer<typeof classSchema>;
