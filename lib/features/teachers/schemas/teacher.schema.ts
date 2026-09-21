import { z } from "zod";

import { emailSchema, passwordSchema } from "@/lib/auth-schemas";

export const createTeacherSchema = z.object({
  schoolId: z.string().min(1, "School is required"),
  name: z.string().min(1, "Name is required"),
  email: emailSchema,
  password: passwordSchema,
  phone: z.string().nullable().optional(),
  specialization: z.string().nullable().optional(),
  qualifications: z.string().nullable().optional(),
  hireDate: z.string().nullable().optional(),
});

export const updateTeacherSchema = z.object({
  name: z.string().trim().min(1).optional(),
  phone: z.string().nullable().optional(),
  specialization: z.string().nullable().optional(),
  qualifications: z.string().nullable().optional(),
  hireDate: z.string().nullable().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export type CreateTeacherSchema = z.infer<typeof createTeacherSchema>;
export type UpdateTeacherSchema = z.infer<typeof updateTeacherSchema>;
