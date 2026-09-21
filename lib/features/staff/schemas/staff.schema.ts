import { z } from "zod";

import { emailSchema, passwordSchema } from "@/lib/auth-schemas";

export const createStaffSchema = z.object({
  schoolId: z.string().min(1, "School is required"),
  name: z.string().min(1, "Name is required"),
  email: emailSchema,
  password: passwordSchema,
  phone: z.string().nullable().optional(),
  position: z.string().nullable().optional(),
  department: z.string().nullable().optional(),
  hireDate: z.string().nullable().optional(),
});

export const updateStaffSchema = z.object({
  name: z.string().trim().min(1).optional(),
  phone: z.string().nullable().optional(),
  position: z.string().nullable().optional(),
  department: z.string().nullable().optional(),
  hireDate: z.string().nullable().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export type CreateStaffSchema = z.infer<typeof createStaffSchema>;
export type UpdateStaffSchema = z.infer<typeof updateStaffSchema>;
