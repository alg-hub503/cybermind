import { z } from "zod";

export const assignUserRoleSchema = z.object({
  roleId: z.string().min(1, "roleId is required"),
});

export type AssignUserRoleSchema = z.infer<typeof assignUserRoleSchema>;
