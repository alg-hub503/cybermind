import { z } from "zod";

export const studentBaseSchema = z.object({
  schoolId: z.string().min(1, "School is required"),
  code: z.string().min(1, "Code is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.string().nullable().optional(),
});

export const studentSchema = studentBaseSchema;

export const updateStudentSchema = studentBaseSchema.partial();

export type StudentSchema = z.infer<typeof studentSchema>;
