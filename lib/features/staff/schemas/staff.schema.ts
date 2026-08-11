import { z } from "zod";

export const createStaffSchema = z.object({
  schoolId: z.string().min(1, "School is required"),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
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
