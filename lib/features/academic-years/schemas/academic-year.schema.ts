import { z } from "zod";

export const academicYearSchema = z.object({
  schoolId: z.string().min(1, "School is required"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  isCurrent: z.boolean(),
});

export type AcademicYearSchema = z.infer<typeof academicYearSchema>;
