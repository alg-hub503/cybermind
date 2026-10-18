import { z } from "zod";

export const updateSchoolUserNameSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name is too long"),
});

export type UpdateSchoolUserNameSchema = z.infer<typeof updateSchoolUserNameSchema>;
